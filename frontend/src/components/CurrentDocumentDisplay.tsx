import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import { LiveEditor, LiveError, LivePreview, LiveProvider } from "react-live";
import {Divider, Textarea, Title} from '@mantine/core';
import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles(() => ({
    textBlock: {
        margin: `${rem(20)} 0`,
        whiteSpace: 'pre-wrap'
    },
}));

export const CurrentDocumentDisplay = ({ currentDocument, isProcessing, isRenderingReact, setCurrentDocument }) => {
    const { classes } = useStyles();

    const formattedCode = prettier.format(currentDocument, {
        parser: "babel",
        plugins: [parserBabel],
    });

    return (
        <>
            {!isRenderingReact && <>
                <Divider my="sm" variant="dashed" />
                <Title order={2} size="h4" sx={theme => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}` })}
                    weight={700} align="center" className={classes.textBlock}>Current document:</Title>
                <Textarea
                    mt="md"
                    maxRows={10}
                    minRows={5}
                    autosize
                    name="message"
                    variant="filled"
                    value={currentDocument}
                    onChange={e => setCurrentDocument(e.currentTarget.value)}
                    disabled={isProcessing}
                />
            </>}
            {isRenderingReact && (
                <>
                    <Divider my="sm" variant="dashed" />
                    <Title order={2} size="h4" sx={theme => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}` })}
                        weight={700} align="center" className={classes.textBlock}>Current code:</Title>
                    <LiveProvider code={formattedCode}>
                        <LiveEditor disabled={isProcessing} />
                        <LiveError />
                        <LivePreview />
                    </LiveProvider>
                </>
            )}
        </>
    )
}
