import {Divider, Title, Text, createStyles, rem} from '@mantine/core';

interface VoiceFeedbackProps {
    feedback: string;
    useVoice: boolean;
    feedbackBackgroundColor: string;
    classes: any;
}

const useStyles = createStyles(() => ({
    textBlock: {
        margin: `${rem(20)} 0`,
        whiteSpace: 'pre-wrap'
    }
}));

export const VoiceFeedback = ({feedback, useVoice, feedbackBackgroundColor}: VoiceFeedbackProps) => {
    const {classes} = useStyles();

    return (
        feedback && useVoice && (
            <>
                <Divider my="sm" variant="dashed"/>
                <Title order={2} size="h4" sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                       weight={700} align="center" className={classes.textBlock}>Your feedback:</Title>
                <Text fz="md" align={"justify"} style={{backgroundColor: feedbackBackgroundColor}}
                      className={classes.textBlock}>
                    {feedback}
                </Text>
            </>
        )
    );
};
