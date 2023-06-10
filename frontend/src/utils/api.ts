export const sendAudioData = (blob, currentDocument) => {
    return fetch("http://localhost:8000/modify", {
        method: "POST",
        body: createBody(blob),
        headers: {
            'document': currentDocument
        }
    });
};

export const createBody = (data) => {
    const formData = new FormData();
    formData.append("audio", data, "audio.wav");
    return formData;
};

export const handleResponse = (res) => {
    if (!res.ok) {
        return res.text().then(error => {
            throw new Error(error);
        });
    }

    return res.json();
};
