export const navigateBack = (currentDocumentIndex, setCurrentDocumentIndex, setCurrentDocument, documentHistory) => {
    if (currentDocumentIndex > 0) {
        setCurrentDocumentIndex(prevIndex => prevIndex - 1);
        setCurrentDocument(documentHistory[currentDocumentIndex - 1]);
    }
};

export const navigateForward = (currentDocumentIndex, setCurrentDocumentIndex, setCurrentDocument, documentHistory) => {
    if (currentDocumentIndex < documentHistory.length - 1) {
        setCurrentDocumentIndex(prevIndex => prevIndex + 1);
        setCurrentDocument(documentHistory[currentDocumentIndex + 1]);
    }
};