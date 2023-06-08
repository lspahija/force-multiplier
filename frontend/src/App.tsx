import React, {useState, ChangeEvent, MouseEvent} from "react";
import {BeatLoader} from 'react-spinners';
import {useMicVAD} from "@ricky0123/vad-react";
import {utils} from "@ricky0123/vad-react";

const App: React.FC = () => {
    const [document, setDocument] = useState<string>("");
    const [processedDocument, setProcessedDocument] = useState<string>("");
    const [isDocumentSubmitted, setDocumentSubmitted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
        setIsLoading(true);
        sendAudioData(blob)
    };

    const sendAudioData = (blob) => {
        return fetch("http://localhost:8000/modify", {
            method: "POST",
            body: createBody(blob),
            headers: {
                'document': processedDocument
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
        setProcessedDocument(newDocument);
        setIsLoading(false);
    };

    const handleError = (error) => {
        console.log(`error encountered: ${error.message}`);
        setIsLoading(false);
    };

    const handleDocumentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setDocument(e.target.value);
    };

    const handleDocumentSubmit = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setProcessedDocument(document);
        setDocumentSubmitted(true);
    };

    useMicVAD({
        preSpeechPadFrames: 5,
        positiveSpeechThreshold: 0.90,
        negativeSpeechThreshold: 0.75,
        minSpeechFrames: 4,
        startOnLoad: true,
        onSpeechStart: () => {
            console.log("speech started here")
        },
        onSpeechEnd: async (audio) => {
            console.log("speech ended here")
            await processAudio(audio);
        },
        onVADMisfire: () => {
            console.log("misfire occurred here")
        },
    });

    return (
        <div className="app">
            <h1>Force Multiplier</h1>
            {!isDocumentSubmitted ? (
                <>
                    <textarea
                        placeholder="Document"
                        value={document}
                        onChange={handleDocumentChange}
                    />
                    <button onClick={handleDocumentSubmit}>Submit</button>
                </>
            ) : (
                <>
                    <h2>Processed Document:</h2>
                    <pre>{processedDocument}</pre>
                    {isLoading && <BeatLoader color="#26D0CE"/>}
                </>
            )}
        </div>
    );
};

export default App;
