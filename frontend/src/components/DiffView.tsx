import {createStyles, rem, Text} from "@mantine/core";

const useStyles = createStyles(() => ({
    textBlock: {
        margin: `${rem(20)} 0`,
        whiteSpace: 'pre-wrap'
    },
}));

export const DiffView = ({
                             showDiffs,
                             currentDocumentIndex,
                             highlightedDocument,
                             diffBackgroundColor,
                         }) => {
    const {classes} = useStyles();

    if (!showDiffs || currentDocumentIndex === 0) return null;

    return (
        <Text
            fz="md"
            align={"justify"}
            className={classes.textBlock}
            style={{backgroundColor: diffBackgroundColor}}
        >
            {highlightedDocument}
        </Text>
    );
}