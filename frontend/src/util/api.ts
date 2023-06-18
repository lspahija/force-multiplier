export const transcribeAudio = (blob, apiKey) => fetch("/transcribe", {
    method: "POST",
    headers: {
        'Openai-Api-Key': apiKey
    },
    body: createBody(blob)
});

export const modifyDocument = (document, documentIsCode, feedback, apiKey) => fetch("/modify", {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
        'Openai-Api-Key': apiKey
    },
    body: JSON.stringify({
        document: base64Encode(document),
        document_is_code: documentIsCode,
        feedback: base64Encode(feedback)
    })
});


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

