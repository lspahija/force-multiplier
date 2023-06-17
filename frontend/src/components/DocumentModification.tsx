import {useState, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
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
import {processAudio, useVoiceDetection} from "../utils/audio";
import {transcribeAudio, handleResponse, modifyDocument} from "../utils/api";
import {LiveEditor, LiveError, LivePreview, LiveProvider} from "react-live";
import {HeaderMenuColored} from "./HeaderMenuColored";
import {diffWordsWithSpace} from 'diff';

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
    const [currentDocument, setCurrentDocument] = useState(document);
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

    useEffect(() => {
        if (currentDocumentIndex === 0) {
            setHighlightedDocument(currentDocument);
            return;
        }

        const oldDocument = documentHistory[currentDocumentIndex - 1];
        const diffResult = diffWordsWithSpace(oldDocument, currentDocument);
        setHighlightedDocument(highlightDifferences(diffResult));
    }, [currentDocument, currentDocumentIndex, documentHistory]);

    const highlightDifferences = (diffResult) => {
        return diffResult.map((part, index) => {
            const color = part.added ? 'lightgreen' :
                part.removed ? 'salmon' : 'transparent';
            const spanStyle = {
                backgroundColor: color,
                textDecoration: part.removed ? 'line-through' : 'none'
            };
            return <span key={index} style={spanStyle}>{part.value}</span>;
        });
    }


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


    useEffect(() => {
        const stopListening = () => {
            voiceDetector.pause()
            setIsSpeaking(false)
        }

        if (useVoice) voiceDetector.start();
        else stopListening();
    }, [useVoice]);

    async function sendTextFeedback(feedbackText: string) {
        try {
            setIsProcessing(true);

            setFeedback(feedbackText);

            const modificationResponse = await modifyDocument(currentDocument, feedbackText);
            const modificationData = await handleResponse(modificationResponse);

            setDocumentHistory([...documentHistory.slice(0, currentDocumentIndex + 1), modificationData.modified_document]);
            setCurrentDocumentIndex(prevIndex => prevIndex + 1);
            setCurrentDocument(modificationData.modified_document);

            setIsProcessing(false);
            setError(null);
        } catch (error) {
            if (error instanceof Error) {
                console.log(`error encountered: ${error.message}`);
                setError(error.message);
            } else {
                console.log(`error encountered: ${error}`);
                setError(String(error));
            }
            setIsProcessing(false);
        }
    }


    async function sendAudio(blob) {
        try {
            voiceDetector.pause();
            setIsProcessing(true);

            const transcriptionResponse = await transcribeAudio(blob);
            const transcriptionData = await handleResponse(transcriptionResponse);
            setFeedback(transcriptionData.feedback);

            const modificationResponse = await modifyDocument(currentDocument, transcriptionData.feedback);
            const modificationData = await handleResponse(modificationResponse);

            setDocumentHistory([...documentHistory.slice(0, currentDocumentIndex + 1), modificationData.modified_document]);
            setCurrentDocumentIndex(prevIndex => prevIndex + 1);
            setCurrentDocument(modificationData.modified_document);

            setIsProcessing(false);
            voiceDetector.start();
            setError(null);
        } catch (error) {
            if (error instanceof Error) {
                console.log(`error encountered: ${error.message}`);
                setError(error.message);
            } else {
                console.log(`error encountered: ${error}`);
                setError(String(error));
            }
            setIsProcessing(false);
            voiceDetector.start();
        }
    }


    const navigateBack = () => {
        if (currentDocumentIndex > 0) {
            setCurrentDocumentIndex(prevIndex => prevIndex - 1);
            setCurrentDocument(documentHistory[currentDocumentIndex - 1]);
        }
    };

    const navigateForward = () => {
        if (currentDocumentIndex < documentHistory.length - 1) {
            setCurrentDocumentIndex(prevIndex => prevIndex + 1);
            setCurrentDocument(documentHistory[currentDocumentIndex + 1]);
        }
    };

    return (
        <>
            <HeaderMenuColored/>
            <Container size={700} className={classes.container}>
                {!isSpeaking && !isProcessing && (
                    <>
                        <Title color={"#3b5bdb"} order={1} size="h1"
                               sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})} weight={700}
                               align="center">
                            Provide Your Feedback
                        </Title>
                        {useVoice &&
                            <Text fz="sm" align={"center"} className={classes.subHeader}>(Yes, just talk and describe
                                the
                                changes you'd like to see)</Text>}
                    </>
                )}
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
                {!useVoice &&
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        sendTextFeedback(feedback);
                    }}>
                        <Divider my="sm" variant="dashed" style={{marginTop: rem(30)}}/>
                        <Title order={2} size="h4" sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                               weight={700} align="center" className={classes.textBlock}>Your feedback:</Title>
                        <Textarea
                            placeholder="Type your feedback here"
                            value={feedback}
                            onChange={e => setFeedback(e.currentTarget.value)}
                            disabled={isProcessing}
                        />
                        <div style={{textAlign: 'center', marginTop: rem(10)}}>
                            <Button type="submit" disabled={isProcessing}>Submit Feedback</Button>
                        </div>
                    </form>
                }
                {feedback && useVoice && (
                    <>
                        <Divider my="sm" variant="dashed"/>
                        <Title order={2} size="h4" sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                               weight={700} align="center" className={classes.textBlock}>Your feedback:</Title>
                        <Text fz="md" align={"justify"} style={{backgroundColor: feedbackBackgroundColor}}
                              className={classes.textBlock}>{feedback}</Text>
                    </>
                )}
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
                            <LiveEditor/>
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
                            <Button onClick={navigateBack} disabled={currentDocumentIndex === 0}>Back</Button>
                            <Button onClick={navigateForward}
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

function useHighlightOnRefresh(setBackgroundColor, text) {
    useEffect(() => {
        setBackgroundColor('#ffe066');
        const timer = setTimeout(() => {
            setBackgroundColor('initial');
        }, 500);
        return () => clearTimeout(timer);
    }, [text, setBackgroundColor]);
}

function useBackAndRefresh() {
    const navigate = useNavigate();
    window.onpopstate = () => {
        navigate("/document");
        navigate(0);
    }
}
