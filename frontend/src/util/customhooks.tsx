import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

export const useHighlightDiff = (currentDocumentIndex, setHighlightedDocument, currentDocument, documentHistory, diffWordsWithSpace) =>
    useEffect(() => {
        if (currentDocumentIndex === 0) {
            setHighlightedDocument(currentDocument);
            return;
        }

        const oldDocument = documentHistory[currentDocumentIndex - 1];
        const diffResult = diffWordsWithSpace(oldDocument, currentDocument);
        setHighlightedDocument(highlightDifferences(diffResult));
    }, [currentDocument, currentDocumentIndex, documentHistory, diffWordsWithSpace, setHighlightedDocument]);

export const useControlVoiceDetector = (useVoice, voiceDetector, setIsSpeaking) => useEffect(() => {
    if (useVoice) voiceDetector.start();
    else {
        voiceDetector.pause();
        setIsSpeaking(false)
    }
}, [useVoice]);

export const useHighlightOnRefresh = (setBackgroundColor, text) =>
    useEffect(() => {
        setBackgroundColor('#ffe066');
        const timer = setTimeout(() => {
            setBackgroundColor('initial');
        }, 500);
        return () => clearTimeout(timer);
    }, [text, setBackgroundColor]);

export const useBackAndRefresh = () => {
    const navigate = useNavigate();
    window.onpopstate = () => {
        navigate("/document");
        navigate(0);
    }
}

const highlightDifferences = (diffResult) =>
    diffResult.map((part, index) => {
        const color = part.added ? 'lightgreen' :
            part.removed ? 'salmon' : 'transparent';
        const spanStyle = {
            backgroundColor: color,
            textDecoration: part.removed ? 'line-through' : 'none'
        };
        return <span key={index} style={spanStyle}>{part.value}</span>;
    });