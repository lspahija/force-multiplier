// import prettier from "prettier/standalone";
// import parserBabel from "prettier/parser-babel";
import {LiveEditor, LiveError, LivePreview, LiveProvider} from "react-live";
import {Divider, Textarea, Title} from '@mantine/core';
import {createStyles, rem} from '@mantine/core';

const useStyles = createStyles(() => ({
    textBlock: {
        margin: `${rem(20)} 0`,
        whiteSpace: 'pre-wrap'
    }
}));

export const CurrentDocumentDisplay = ({currentDocument, isProcessing, isRenderingReact, setCurrentDocument}) => {
    const {classes} = useStyles();

    return (
        <>
            {!isRenderingReact && <>
                <Divider my="sm" variant="dashed"/>
                <Title size="h4" sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                       weight={700} align="center" className={classes.textBlock}>Current document:</Title>
                <Textarea
                    mt="md"
                    maxRows={30}
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
                    <Divider my="sm" variant="dashed"/>
                    <Title size="h4" sx={theme => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                           weight={700} align="center" className={classes.textBlock}>Current code:</Title>
                    <LiveProvider code={formatCode(currentDocument)}>
                        <LiveEditor disabled={isProcessing} onChange={code => setCurrentDocument(code)}/>
                        <LiveError/>
                        <LivePreview/>
                    </LiveProvider>
                </>
            )}
        </>
    )
}

const formatCode = (currentDocument) => {
    return currentDocument
    // try {
    //     return prettier.format(currentDocument, {
    //         parser: "babel",
    //         plugins: [parserBabel],
    //     })
    // } catch (e) {
    //     console.warn(e);
    //     return currentDocument
    // }
}
