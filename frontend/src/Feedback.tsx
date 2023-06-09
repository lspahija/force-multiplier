import {Title, Text, createStyles, rem, Container} from '@mantine/core';
import {useLocation} from "react-router-dom";

const useStyles = createStyles((theme) => ({
    inner: {
        position: 'relative',
        paddingTop: rem(200),
        paddingBottom: rem(120),

        [theme.fn.smallerThan('sm')]: {
            paddingBottom: rem(80),
            paddingTop: rem(80),
        },
    },
    title: {
       paddingBottom: rem(40)
    }
}));

export function Feedback() {
    const {classes} = useStyles();

    const location = useLocation()
    const {document} = location.state

    return (
        <Container size={700} className={classes.inner}>
            <Title
                order={2}
                size="h1"
                sx={(theme) => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                weight={900}
                align="center"
                className={classes.title}
            >
                Provide Your Feedback
            </Title>

            <Text fz="md">{document}</Text>
        </Container>
    );
}