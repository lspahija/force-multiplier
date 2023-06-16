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
import {sendAudioData, handleResponse} from "../utils/api";
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

export function Feedback() {
    const {classes} = useStyles();
    const location = useLocation();
    const {document} = location.state;
    const [currentDocument, setCurrentDocument] = useState(document);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState("initial");
    const [isRenderingReact, setIsRenderingReact] = useState(false);
    const [documentHistory, setDocumentHistory] = useState([document]);
    const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
    const [highlightedDocument, setHighlightedDocument] = useState([]);
    const [showDiffs, setShowDiffs] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentDocumentIndex === 0) {
            setHighlightedDocument(currentDocument);
            return;
        }

        const oldDocument = documentHistory[currentDocumentIndex - 1];
        const diffResult = diffWordsWithSpace(oldDocument, currentDocument);
        setHighlightedDocument(highlightDifferences(diffResult));
    }, [currentDocument, currentDocumentIndex, documentHistory]);

    const stopListening = () => {
        voiceDetector.pause()
        setIsSpeaking(false)
        setIsListening(false)
    }

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


    useHighlightOnRefresh(setBackgroundColor, currentDocument);
    useBackAndRefresh();
    const voiceDetector = useVoiceDetection(
        () => {
            console.log("speech started")
            setIsSpeaking(true)
        },
        async audio => {
            console.log("speech ended")
            setIsSpeaking(false);
            sendData(await processAudio(audio));
        },
        () => {
            console.log("VAD misfire")
            setIsSpeaking(false)
        },
        setIsListening)

    function sendData(blob) {
        voiceDetector.pause();
        setIsProcessing(true);
        sendAudioData(blob, currentDocument).then(handleResponse).then(data => {
            setDocumentHistory([...documentHistory.slice(0, currentDocumentIndex + 1), data.modified_document]);
            setCurrentDocumentIndex(prevIndex => prevIndex + 1);
            setCurrentDocument(data.modified_document);
            setFeedback(data.feedback);
            setIsProcessing(false);
            voiceDetector.start();
            setError(null);
        }).catch(error => {
            console.log(`error encountered: ${error.message}`);
            setError(error.message);
            setIsProcessing(false);
            voiceDetector.start();
        });
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
                        <Text fz="sm" align={"center"} className={classes.subHeader}>(Yes, just talk and describe the
                            changes you'd like to see)</Text>
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
                {feedback && (
                    <>
                        <Divider my="sm" variant="dashed"/>
                        <Title order={2} size="h4" sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                               weight={700} align="center" className={classes.textBlock}>Your feedback:</Title>
                        <Text fz="md" align={"justify"} className={classes.textBlock}>{feedback}</Text>
                    </>
                )}
                {!isRenderingReact && <>
                    <Divider my="sm" variant="dashed"/>
                    <Textarea
                        mt="md"
                        maxRows={10}
                        minRows={5}
                        autosize
                        name="message"
                        variant="filled"
                        value={currentDocument}
                        onChange={e => setCurrentDocument(e.currentTarget.value)}
                    />
                </>}
                {isRenderingReact && (
                    <>
                        <Divider my="sm" variant="dashed"/>
                        <LiveProvider code={currentDocument}>
                            <LiveEditor/>
                            <LiveError/>
                            <LivePreview/>
                        </LiveProvider>
                    </>
                )}
                {showDiffs && currentDocumentIndex !== 0 &&
                    <Text fz="md" align={"justify"} className={classes.textBlock}
                          style={{backgroundColor}}>{highlightedDocument}</Text>}
            </Container>
            <Affix position={{bottom: rem(50), right: rem(50)}}>
                <Grid>
                    <Grid.Col span={12}>
                        <div className={classes.buttonGroup}>
                            <Button onClick={navigateBack} disabled={currentDocumentIndex === 0}>Back</Button>
                            <Button onClick={navigateForward}
                                    disabled={currentDocumentIndex === documentHistory.length - 1}>Forward</Button>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                            <div className={classes.switchContainer}>
                                <Switch
                                    checked={showDiffs}
                                    onChange={() => setShowDiffs(prev => !prev)}
                                    label={showDiffs ? 'Diffs' : 'No Diffs'}
                                />
                            </div>
                            <div className={classes.switchContainer}>
                                <Switch
                                    checked={isListening}
                                    onChange={() => {
                                        if (isListening) stopListening(); else voiceDetector.start();
                                    }}
                                    label={isListening ? 'Listening' : 'Not Listening'}
                                />
                            </div>
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

function useHighlightOnRefresh(setBackgroundColor, currentDocument) {
    useEffect(() => {
        setBackgroundColor('#ffe066');
        const timer = setTimeout(() => {
            setBackgroundColor('initial');
        }, 500);
        return () => clearTimeout(timer);
    }, [currentDocument, setBackgroundColor]);
}

function useBackAndRefresh() {
    const navigate = useNavigate();
    window.onpopstate = () => {
        navigate("/document");
        navigate(0);
    }
}
