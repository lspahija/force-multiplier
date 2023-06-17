import {createStyles, Divider, rem, Text, Title} from "@mantine/core";

const useStyles = createStyles(() => ({
    textBlock: {
        margin: `${rem(20)} 0`,
        whiteSpace: 'pre-wrap'
    },
    marginTop: {
        marginTop: rem(30)
    }
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
        <div className={classes.marginTop}>
            <Divider my="sm" variant="dashed" />
            <Title
                order={2}
                size="h3"
                sx={(theme) => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                weight={600}
                align="center"
                className={classes.textBlock}
            >
                Diff:
            </Title>
            <Text
                fz="md"
                align={"justify"}
                className={classes.textBlock}
                style={{backgroundColor: diffBackgroundColor}}
            >
                {highlightedDocument}
            </Text>
        </div>
    );
}