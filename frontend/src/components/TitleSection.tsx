import {Title, Text} from '@mantine/core';

interface TitleSectionProps {
    useVoice: boolean;
    isSpeaking: boolean;
    isProcessing: boolean;
}

export const TitleSection = ({useVoice, isSpeaking, isProcessing}: TitleSectionProps) => {
    return (
        <>
            {!isSpeaking && !isProcessing && (
                <>
                    <Title color={"#3b5bdb"} order={1} size="h1"
                           sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})} weight={700}
                           align="center">
                        Provide Your Feedback
                    </Title>
                    {useVoice && <Text fz="sm" align={"center"}>(Yes, just talk and describe the changes you'd like to
                        see)</Text>}
                </>
            )}
        </>
    );
};
