import { utils } from "@ricky0123/vad-react";

export const createAudioBlob = (audio) => {
    const wavBuffer = utils.encodeWAV(audio);
    return new Blob([wavBuffer], {type: 'audio/wav'});
};

export const validate = async (data) => {
    const decodedData = await new AudioContext().decodeAudioData(await data.arrayBuffer());
    const duration = decodedData.duration;
    const minDuration = 0.4;

    if (duration < minDuration) throw new Error(`Duration is ${duration}s, which is less than minimum of ${minDuration}s`);
};

export const processAudio = async (audio) => {
    const blob = createAudioBlob(audio);
    await validate(blob);
    return blob;
};
