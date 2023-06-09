import {Title, Text, createStyles, rem, Container, Loader} from '@mantine/core';
import {useLocation} from "react-router-dom";
import {useState} from "react";
import {useMicVAD, utils} from "@ricky0123/vad-react";

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
    title: {
        paddingBottom: rem(40)
    }
}));

export function Feedback() {
    const {classes} = useStyles();

    const location = useLocation()
    const {document} = location.state
    const [currentDocument, setCurrentDocument] = useState<string>(document);
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false);

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
            await processAudio(audio);
        },
        onVADMisfire: () => {
            console.log("VAD misfire")
            setIsSpeaking(false)
        },
    });

    const createAudioBlob = (audio) => {
        const wavBuffer = utils.encodeWAV(audio);
        return new Blob([wavBuffer], {type: 'audio/wav'});
    };

    const validate = async (data) => {
        const decodedData = await new AudioContext().decodeAudioData(await data.arrayBuffer());
        const duration = decodedData.duration;
        const minDuration = 0.4;

        if (duration < minDuration) throw new Error(`Duration is ${duration}s, which is less than minimum of ${minDuration}s`);
    };

    const createBody = (data) => {
        const formData = new FormData();
        formData.append("audio", data, "audio.wav");
        return formData;
    };

    const processAudio = async (audio) => {
        const blob = createAudioBlob(audio);
        await validate(blob);
        sendData(blob);
    };

    const sendData = (blob) => {
        setIsProcessing(true);
        sendAudioData(blob)
    };

    const sendAudioData = (blob) => {
        return fetch("http://localhost:8000/modify", {
            method: "POST",
            body: createBody(blob),
            headers: {
                'document': currentDocument
            }
        })
            .then(handleResponse)
            .then(handleSuccess)
            .catch(handleError);
    };

    const handleResponse = (res) => {
        if (!res.ok) {
            return res.text().then(error => {
                throw new Error(error);
            });
        }

        return res.json();
    };

    const handleSuccess = (newDocument) => {
        setCurrentDocument(newDocument);
        setIsProcessing(false);
    };

    const handleError = (error) => {
        console.log(`error encountered: ${error.message}`);
        setIsProcessing(false);
    };

    return (
        <Container size={700} className={classes.inner}>
            {!isSpeaking && !isProcessing && <Title
                variant="gradient"
                gradient={{from: 'indigo', to: 'cyan', deg: 45}}
                order={2}
                size="h1"
                sx={(theme) => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                weight={900}
                align="center"
                className={classes.title}
            >
                Provide Your Feedback
            </Title>}

            <Container size={100}>
                {isSpeaking && <Loader size="xl" variant="bars"/>}
                {isProcessing && <Loader size="xl"/>}
            </Container>

            <Text fz="md">{currentDocument}</Text>
        </Container>
    );
}