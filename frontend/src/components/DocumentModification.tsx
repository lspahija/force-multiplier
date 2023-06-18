import {useState} from "react";
import {useLocation} from "react-router-dom";
import {Container, createStyles, rem} from '@mantine/core';
import {processAudio, useVoiceDetection} from "../util/audio";
import {transcribeAudio, handleResponse, modifyDocument} from "../util/api";
import {HeaderMenuColored} from "./HeaderMenuColored";
import {diffWordsWithSpace} from 'diff';
import {
    useBackAndRefresh,
    useControlVoiceDetector,
    useHighlightDiff,
    useHighlightOnRefresh
} from "../util/CustomHooks.tsx";
import {TitleSection} from "./TitleSection.tsx";
import {FeedbackForm} from "./FeedbackForm.tsx";
import {VoiceFeedback} from "./VoiceFeedback.tsx";
import {CurrentDocumentDisplay} from "./CurrentDocumentDisplay.tsx";
import {DocumentNavigationControls} from "./DocumentNavigationControls.tsx";
import {ErrorNotification} from "./ErrorNotification.tsx";
import {ProcessingLoaders} from "./ProcessingLoaders.tsx";
import {DiffView} from "./DiffView.tsx";
import {ApiKeyModal} from "./ApiKeyModal.tsx";

const useStyles = createStyles(theme => ({
    container: {
        position: 'relative',
        padding: `${rem(80)} 0`,
        [theme.fn.smallerThan('sm')]: {
            padding: `${rem(40)} 0`
        }
    }
}));

export function DocumentModification() {
    const {classes} = useStyles();
    const location = useLocation();
    const {document} = location.state;
    const [currentDocument, setCurrentDocument] = useState<string>(document);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [feedbackBackgroundColor, setFeedbackBackgroundColor] = useState("initial");
    const [diffBackgroundColor, setDiffBackgroundColor] = useState("initial");
    const [isRenderingReact, setIsRenderingReact] = useState(false);
    const [documentHistory, setDocumentHistory] = useState([document]);
    const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
    const [highlightedDocument, setHighlightedDocument] = useState([]);
    const [showDiffs, setShowDiffs] = useState(true);
    const [useVoice, setUseVoice] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY_TEST);

    useHighlightDiff(currentDocumentIndex, setHighlightedDocument, currentDocument, documentHistory, diffWordsWithSpace)
    useHighlightOnRefresh(setDiffBackgroundColor, currentDocument);
    useHighlightOnRefresh(setFeedbackBackgroundColor, feedback);
    useBackAndRefresh();

    const voiceDetector = useVoiceDetection(
        () => {
            if (!useVoice) return;
            console.log("speech started")
            handleModalOpen();
            setIsSpeaking(true)
        },
        async audio => {
            console.log("speech ended")
            setIsSpeaking(false);
            if (!useVoice) return;
            await sendAudio(await processAudio(audio));
        },
        () => {
            console.log("VAD misfire")
            if (!useVoice) return;
            setIsSpeaking(false)
        })

    useControlVoiceDetector(useVoice, voiceDetector, setIsSpeaking)

    const handleApiKeyChange = (e) => setApiKey(e.currentTarget.value);
    const handleModalOpen = () => {
        if (!apiKey) setIsModalOpen(true)
    }

    const handleModalClose = () => setIsModalOpen(false);

    async function sendTextFeedback(feedbackText: string) {
        if (!apiKey) return
        try {
            handleProcessingStart();
            setFeedback(feedbackText);
            await handleModification(feedbackText);
            setIsProcessing(false);
        } catch (error) {
            handleError(error);
        }
    }

    async function sendAudio(blob) {
        if (!apiKey) return
        try {
            voiceDetector.pause();
            handleProcessingStart();

            const transcriptionData = await handleResponse(await transcribeAudio(blob, apiKey));
            setFeedback(transcriptionData.feedback);

            await handleModification(transcriptionData.feedback);

            setIsProcessing(false);
            voiceDetector.start();
        } catch (error) {
            handleError(error);
            voiceDetector.start();
        }
    }

    async function handleModification(feedback: string) {
        const modificationData = await handleResponse(await modifyDocument(currentDocument, isRenderingReact, feedback, apiKey));

        setDocumentHistory([...documentHistory.slice(0, currentDocumentIndex + 1), modificationData.modified_document]);
        setCurrentDocumentIndex(prevIndex => prevIndex + 1);
        setCurrentDocument(modificationData.modified_document);
    }

    function handleProcessingStart() {
        setIsProcessing(true);
        setError(null);
    }

    function handleError(error) {
        if (error instanceof Error) {
            console.log(`error encountered: ${error.message}`);
            setError(error.message);
        } else {
            console.log(`error encountered: ${error}`);
            setError(String(error));
        }
        setIsProcessing(false);
    }


    return (
        <>
            <ApiKeyModal isModalOpen={isModalOpen} handleModalClose={handleModalClose} apiKey={apiKey}
                         handleApiKeyChange={handleApiKeyChange}/>
            <HeaderMenuColored/>
            <Container size={700} className={classes.container}>
                <TitleSection useVoice={useVoice} isSpeaking={isSpeaking} isProcessing={isProcessing}/>
                <ProcessingLoaders isSpeaking={isSpeaking} isProcessing={isProcessing}/>
                <ErrorNotification error={error} setError={setError}/>
                <FeedbackForm useVoice={useVoice} isProcessing={isProcessing} sendTextFeedback={sendTextFeedback}
                              handleModalOpen={handleModalOpen} />
                <VoiceFeedback feedback={feedback} useVoice={useVoice} feedbackBackgroundColor={feedbackBackgroundColor}
                               classes={classes}/>
                <CurrentDocumentDisplay currentDocument={currentDocument} isProcessing={isProcessing}
                                        isRenderingReact={isRenderingReact} setCurrentDocument={setCurrentDocument}/>
                <DiffView showDiffs={showDiffs} currentDocumentIndex={currentDocumentIndex}
                          highlightedDocument={highlightedDocument} diffBackgroundColor={diffBackgroundColor}/>
            </Container>
            <DocumentNavigationControls currentDocumentIndex={currentDocumentIndex} documentHistory={documentHistory}
                                        setShowDiffs={setShowDiffs} setIsRenderingReact={setIsRenderingReact}
                                        setCurrentDocumentIndex={setCurrentDocumentIndex}
                                        setCurrentDocument={setCurrentDocument} useVoice={useVoice}
                                        setUseVoice={setUseVoice} showDiffs={showDiffs}
                                        isRenderingReact={isRenderingReact}
            />
        </>
    );
}


