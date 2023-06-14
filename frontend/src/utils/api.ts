export const sendAudioData = (blob, currentDocument) => {
    return fetch("/modify", {
        method: "POST",
        body: createBody(blob),
        headers: {
            'document': base64Encode(currentDocument)
        }
    });
};

function base64Encode(str: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return window.btoa(String.fromCharCode(...new Uint8Array(data)));
}

export const createBody = (data) => {
    const formData = new FormData();
    formData.append("audio", data, "audio.wav");
    return formData;
};

export const handleResponse = (res) => {
    if (!res.ok) {
        return res.text().then(error => {
            throw new Error(JSON.parse(error).detail);
        });
    }

    return res.json();
};

