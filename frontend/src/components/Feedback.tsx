import {Title, Text, createStyles, rem, Container, Loader, Divider, Switch} from '@mantine/core';
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {handleResponse, sendAudioData} from "../utils/api.ts";
import {processAudio, useVoiceDetection} from "../utils/audio.ts";
import {HeaderMenuColored} from "./HeaderMenuColored.tsx";

const useStyles = createStyles((theme) => ({
    inner: {
        position: 'relative',
        paddingTop: rem(200),
        paddingBottom: rem(120),

        [theme.fn.smallerThan('sm')]: {
            paddingBottom: rem(80),
            paddingTop: rem(80),
        },
    },
    paddingBottom: {
        paddingBottom: rem(20)
    },
    paddingBoth: {
        paddingTop: rem(20),
        paddingBottom: rem(20),
        whiteSpace: 'pre-wrap'
    },
    currentDocument: {
        paddingTop: rem(20),
        paddingBottom: rem(20),
        whiteSpace: 'pre-wrap'
    },
    paddingTop: {
        paddingTop: rem(20),
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        margin: `${rem(50)} auto`,
    },
}));

export function Feedback() {
    const {classes} = useStyles();

    useBackAndRefresh()

    const location = useLocation()
    const {document} = location.state
    const [currentDocument, setCurrentDocument] = useState<string>(document)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [isListening, setIsListening] = useState(false)
    const [backgroundColor, setBackgroundColor] = useState("initial");

    useHighlightOnRefresh(setBackgroundColor, currentDocument)


    const voiceDetector = useVoiceDetection(
        () => {
            console.log("speech started")
            setIsSpeaking(true)
        },
        async (audio) => {
            console.log("speech ended")
            setIsSpeaking(false)
            const audioBlob = await processAudio(audio);
            sendData(audioBlob);
        },
        () => {
            console.log("VAD misfire")
            setIsSpeaking(false)
        },
        setIsListening
    )

    const sendData = (blob) => {
        setIsProcessing(true);
        sendAudioData(blob, currentDocument)
            .then(handleResponse)
            .then(handleSuccess)
            .catch(handleError);
    };

    const handleSuccess = (data) => {
        setCurrentDocument(data.modified_document);
        setFeedback(data.feedback);
        setIsProcessing(false);
    };

    const handleError = (error) => {
        console.log(`error encountered: ${error.message}`);
        setIsProcessing(false);
    };

    return (
        <>
            <HeaderMenuColored/>
            <Container size={700} className={classes.inner}>
                {!isSpeaking && !isProcessing && <>
                    <Title
                        color={"indigo"}
                        order={1}
                        size="h1"
                        sx={(theme) => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                        weight={700}
                        align="center"
                    >
                        Provide Your Feedback
                    </Title>
                    <Text
                        fz="sm"
                        align={"center"}
                        className={classes.paddingBottom}>(Yes, just talk and describe the changes you'd like to see)
                    </Text>
                </>}

                <Container size={50}>
                    {isSpeaking && <Loader size="xl" variant="bars"/>}
                    {isProcessing && <Loader size="xl"/>}
                </Container>
                {feedback &&
                    <>
                        <Divider my="sm" variant="dashed"/>
                        <Title
                            order={2}
                            size="h4"
                            sx={(theme) => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                            weight={700}
                            align="center"
                            className={classes.paddingTop}
                        >
                            Your feedback:
                        </Title>
                        <Text fz="md" align={"justify"} className={classes.paddingBottom}>{feedback}</Text>
                    </>
                }
                <Divider my="sm" variant="dashed"/>
                <Text fz="md" align={"justify"} className={classes.currentDocument}
                      style={{backgroundColor}}>{currentDocument}</Text>
                <Divider my="sm" variant="dashed"/>
                <div className={classes.button}>
                    <Switch
                        checked={isListening}
                        onChange={() => {
                            if (isListening) voiceDetector.pause(); else voiceDetector.start();
                        }}
                        label={isListening ? 'Listening' : 'Not Listening'}
                    />
                </div>
            </Container>
        </>
    );
}

const useHighlightOnRefresh = (setBackgroundColor, currentDocument) => {
    useEffect(() => {
        setBackgroundColor('#ffe066');
        const timer = setTimeout(() => {
            setBackgroundColor('initial');
        }, 500);

        return () => clearTimeout(timer);
    }, [currentDocument, setBackgroundColor]);
}

const useBackAndRefresh = () => {
    const navigate = useNavigate();
    window.onpopstate = () => {
        navigate("/document");
        navigate(0)
    }
}
