import React, {useState, ChangeEvent, MouseEvent} from "react";
import axios from "axios";
import {BeatLoader} from 'react-spinners';
import {useMicVAD} from "@ricky0123/vad-react";

const App: React.FC = () => {
    const [document, setDocument] = useState<string>("");
    const [feedback, setFeedback] = useState<string>("");
    const [processedDocument, setProcessedDocument] = useState<string>("");
    const [isDocumentSubmitted, setDocumentSubmitted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useMicVAD({
        preSpeechPadFrames: 5,
        positiveSpeechThreshold: 0.90,
        negativeSpeechThreshold: 0.75,
        minSpeechFrames: 4,
        startOnLoad: true,
        onSpeechStart: () => {
            console.log("speech started")
        },
        onSpeechEnd: (audio) => {
            console.log("speech ended")
            console.log(audio)
        },
        onVADMisfire: () => {
            console.log("misfire occurred")
        },
    })

    const handleDocumentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setDocument(e.target.value);
    };

    const handleFeedbackChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(e.target.value);
    };

    const handleDocumentSubmit = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setProcessedDocument(document);  // update processedDocument here
        setDocumentSubmitted(true);
    };

    const handleSubmitFeedback = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post<string>("http://localhost:8000/modify", {
                document: processedDocument,
                feedback: feedback,
            });
            console.log(res.data);
            setProcessedDocument(res.data);
            setFeedback("");
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

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
                    <textarea
                        placeholder="Your feedback"
                        value={feedback}
                        onChange={handleFeedbackChange}
                    />
                    <button onClick={handleSubmitFeedback}>Submit</button>
                    {isLoading && <BeatLoader color="#26D0CE"/>}
                </>
            )}
        </div>
    );
};

export default App;
