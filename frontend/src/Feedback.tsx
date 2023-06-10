import {Title, Text, createStyles, rem, Container, Loader, Divider} from '@mantine/core';
import {useLocation} from "react-router-dom";
import {useState} from "react";
import {useMicVAD} from "@ricky0123/vad-react";
import {handleResponse, sendAudioData} from "./utils/api.ts";
import {processAudio} from "./utils/audio.ts";

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
        paddingBottom: rem(20)
    },
    paddingTop: {
        paddingTop: rem(20),
    }
}));

export function Feedback() {
    const {classes} = useStyles();

    const location = useLocation()
    const {document} = location.state
    const [currentDocument, setCurrentDocument] = useState<string>(document)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)

    useMicVAD({
        preSpeechPadFrames: 5,
        positiveSpeechThreshold: 0.90,
        negativeSpeechThreshold: 0.75,
        minSpeechFrames: 4,
        startOnLoad: true,
        onSpeechStart: () => {
            console.log("speech started")
            setIsSpeaking(true)
        },
        onSpeechEnd: async (audio) => {
            console.log("speech ended")
            setIsSpeaking(false)
            const audioBlob = await processAudio(audio);
            sendData(audioBlob);
        },
        onVADMisfire: () => {
            console.log("VAD misfire")
            setIsSpeaking(false)
        },
    });

    const sendData = (blob) => {
        setIsProcessing(true);
        sendAudioData(blob, document)
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
        <Container size={700} className={classes.inner}>
            {!isSpeaking && !isProcessing && <>
                <Title
                    variant="gradient"
                    gradient={{from: 'indigo', to: 'cyan', deg: 45}}
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
                        Your last feedback:
                    </Title>
                    <Text fz="md" align={"justify"} className={classes.paddingBoth}>{feedback}</Text>
                </>
            }
            <Divider my="sm" variant="dashed"/>
            <Title
                order={2}
                size="h4"
                sx={(theme) => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                weight={700}
                align="center"
                className={classes.paddingTop}
            >
                Your auto-updating text:
            </Title>
            <Text fz="md" align={"justify"} className={classes.paddingTop}>{currentDocument}</Text>
        </Container>
    );
}
