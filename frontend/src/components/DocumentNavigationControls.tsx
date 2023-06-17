import {Switch, Button, createStyles, rem, Grid, Affix} from '@mantine/core';
import {navigateBack, navigateForward} from "../util/navigation.ts";

const useStyles = createStyles(() => ({
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: rem(5),
        marginTop: rem(20),
        marginBottom: rem(10)
    },
    switchContainer: {
        margin: `${rem(5)} 0`
    },
}));

export const DocumentNavigationControls = ({
                                               currentDocumentIndex, documentHistory, setShowDiffs, setIsRenderingReact,
                                               setCurrentDocumentIndex, setCurrentDocument, useVoice, setUseVoice,
                                               showDiffs, isRenderingReact
                                           }) => {
    const {classes} = useStyles();

    return (
        <Affix position={{bottom: rem(50), right: rem(50)}}>
            <Grid>
                <Grid.Col span={12}>
                    <div className={classes.buttonGroup}>
                        <Button
                            onClick={() => navigateBack(currentDocumentIndex, setCurrentDocumentIndex, setCurrentDocument, documentHistory)}
                            disabled={currentDocumentIndex === 0}>Back</Button>
                        <Button
                            onClick={() => navigateForward(currentDocumentIndex, setCurrentDocumentIndex, setCurrentDocument, documentHistory)}
                            disabled={currentDocumentIndex === documentHistory.length - 1}>Forward</Button>
                    </div>
                    <div className={classes.switchContainer}>
                        <Switch
                            checked={useVoice}
                            onChange={() => setUseVoice(prev => !prev)}
                            label={useVoice ? 'Voice' : 'Text'}
                        />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                        {
                            currentDocumentIndex !== 0 &&
                            <div className={classes.switchContainer}>
                                <Switch
                                    checked={showDiffs}
                                    onChange={() => setShowDiffs(prev => !prev)}
                                    label={showDiffs ? 'Diffs' : 'No Diffs'}
                                />
                            </div>
                        }
                        <div className={classes.switchContainer}>
                            <Switch
                                checked={isRenderingReact}
                                onChange={() => setIsRenderingReact(prev => !prev)}
                                label={isRenderingReact ? 'Rendering React' : 'Not Rendering React'}
                            />
                        </div>
                    </div>
                </Grid.Col>
            </Grid>
        </Affix>
    )
}
