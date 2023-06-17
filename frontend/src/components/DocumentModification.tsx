import {useState} from "react";
import {useLocation} from "react-router-dom";
import {
    Title,
    Text,
    Container,
    Loader,
    Divider,
    Switch,
    Button,
    createStyles,
    rem,
    Affix,
    Grid,
    Notification, Textarea
} from '@mantine/core';
import {processAudio, useVoiceDetection} from "../util/audio";
import {transcribeAudio, handleResponse, modifyDocument} from "../util/api";
import {LiveEditor, LiveError, LivePreview, LiveProvider} from "react-live";
import {HeaderMenuColored} from "./HeaderMenuColored";
import {diffWordsWithSpace} from 'diff';
import {
    useBackAndRefresh, useControlVoiceDetector,
    useHighlightDiff,
    useHighlightOnRefresh
} from "../util/customhooks.tsx";
import {navigateBack, navigateForward} from "../util/navigation.ts";
import {TitleSection} from "./TitleSection.tsx";
import {FeedbackForm} from "./FeedbackForm.tsx";
import {VoiceFeedback} from "./VoiceFeedback.tsx";

const useStyles = createStyles(theme => ({
    container: {
        position: 'relative',
        padding: `${rem(80)} 0`,
        [theme.fn.smallerThan('sm')]: {
            padding: `${rem(40)} 0`
        }
    },
    subHeader: {
        marginTop: rem(10),
        marginBottom: rem(30),
    },
    textBlock: {
        margin: `${rem(20)} 0`,
        whiteSpace: 'pre-wrap'
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: rem(5),
        marginTop: rem(20),
        marginBottom: rem(10)
    },
    switchContainer: {
        margin: `${rem(5)} 0`
    },
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

    useHighlightDiff(currentDocumentIndex, setHighlightedDocument, currentDocument, documentHistory, diffWordsWithSpace)
    useHighlightOnRefresh(setDiffBackgroundColor, currentDocument);
    useHighlightOnRefresh(setFeedbackBackgroundColor, feedback);
    useBackAndRefresh();

    const voiceDetector = useVoiceDetection(
        () => {
            if (!useVoice) return;
            console.log("speech started")
            setIsSpeaking(true)
        },
        async audio => {
            if (!useVoice) return;
            console.log("speech ended")
            setIsSpeaking(false);
            await sendAudio(await processAudio(audio));
        },
        () => {
            if (!useVoice) return;
            console.log("VAD misfire")
            setIsSpeaking(false)
        })

    useControlVoiceDetector(useVoice, voiceDetector, setIsSpeaking)

    async function sendTextFeedback(feedbackText: string) {
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
        try {
            voiceDetector.pause();
            handleProcessingStart();

            const transcriptionResponse = await transcribeAudio(blob);
            const transcriptionData = await handleResponse(transcriptionResponse);
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
        const modificationResponse = await modifyDocument(currentDocument, feedback);
        const modificationData = await handleResponse(modificationResponse);

        setDocumentHistory([...documentHistory.slice(0, currentDocumentIndex + 1), modificationData.modified_document]);
        setCurrentDocumentIndex(prevIndex => prevIndex + 1);
        setCurrentDocument(modificationData.modified_document);
    }

    function handleProcessingStart() {
        setIsProcessing(true);
        setError(null);
    }

    function handleError(error: any) {
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
            <HeaderMenuColored/>
            <Container size={700} className={classes.container}>
                <TitleSection useVoice={useVoice} isSpeaking={isSpeaking} isProcessing={isProcessing}/>
                <Container size={50}>
                    {isSpeaking && <Loader size="xl" variant="bars"/>}
                    {isProcessing && <Loader size="xl"/>}
                </Container>
                {error &&
                    <Notification
                        color="red"
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Notification>}
                <FeedbackForm useVoice={useVoice} isProcessing={isProcessing} sendTextFeedback={sendTextFeedback}/>
                <VoiceFeedback feedback={feedback} useVoice={useVoice} feedbackBackgroundColor={feedbackBackgroundColor}
                               classes={classes}/>
                {!isRenderingReact && <>
                    <Divider my="sm" variant="dashed"/>
                    <Title order={2} size="h4" sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                           weight={700} align="center" className={classes.textBlock}>Current document:</Title>
                    <Textarea
                        mt="md"
                        maxRows={10}
                        minRows={5}
                        autosize
                        name="message"
                        variant="filled"
                        value={currentDocument}
                        onChange={e => setCurrentDocument(e.currentTarget.value)}
                        disabled={isProcessing}
                    />
                </>}
                {isRenderingReact && (
                    <>
                        <Divider my="sm" variant="dashed"/>
                        <Title order={2} size="h4" sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                               weight={700} align="center" className={classes.textBlock}>Current code:</Title>
                        <LiveProvider code={currentDocument}>
                            <LiveEditor disabled={isProcessing}/>
                            <LiveError/>
                            <LivePreview/>
                        </LiveProvider>
                    </>
                )}
                {showDiffs && currentDocumentIndex !== 0 &&
                    <Text fz="md" align={"justify"} className={classes.textBlock}
                          style={{backgroundColor: diffBackgroundColor}}>{highlightedDocument}</Text>}
            </Container>
            <Affix position={{bottom: rem(50), right: rem(50)}}>
                <Grid>
                    <Grid.Col span={12}>
                        <div className={classes.buttonGroup}>
                            <Button
                                onClick={() => navigateBack(currentDocumentIndex, setCurrentDocumentIndex, setCurrentDocument, documentHistory)}
                                disabled={currentDocumentIndex === 0}>Back</Button>
                            <Button
                                onClick={() => navigateForward(currentDocumentIndex, setCurrentDocumentIndex, setCurrentDocument, documentHistory)}
                                disabled={currentDocumentIndex === documentHistory.length - 1}>Forward</Button>
                        </div>
                        <div className={classes.switchContainer}>
                            <Switch
                                checked={useVoice}
                                onChange={() => setUseVoice(prev => !prev)}
                                label={useVoice ? 'Voice' : 'Text'}
                            />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                            {
                                currentDocumentIndex !== 0 &&
                                <div className={classes.switchContainer}>
                                    <Switch
                                        checked={showDiffs}
                                        onChange={() => setShowDiffs(prev => !prev)}
                                        label={showDiffs ? 'Diffs' : 'No Diffs'}
                                    />
                                </div>
                            }
                            <div className={classes.switchContainer}>
                                <Switch
                                    checked={isRenderingReact}
                                    onChange={() => setIsRenderingReact(prev => !prev)}
                                    label={isRenderingReact ? 'Rendering React' : 'Not Rendering React'}
                                />
                            </div>
                        </div>
                    </Grid.Col>
                </Grid>
            </Affix>
        </>
    );
}
