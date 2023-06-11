import {Textarea, Group, Title, Button, createStyles, rem, Container} from '@mantine/core';
import {useState} from "react";
import {Link} from "react-router-dom";
import {HeaderMenuColored} from "./HeaderMenuColored.tsx";

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
    paddingBottom: {
        paddingBottom: rem(10)
    },
}));

export function Document() {
    const {classes} = useStyles();

    const [document, setDocument] = useState<string>("");

    return (
        <>
            <HeaderMenuColored/>
            <Container size={700} className={classes.inner}>
                <Title
                    order={2}
                    size="h1"
                    sx={(theme) => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                    weight={600}
                    align="center"
                    className={classes.paddingBottom}
                >
                    Enter your starting text
                </Title>

                <Textarea
                    mt="md"
                    placeholder="This is a story about a cat named Milo and a dog named Kelly. Bla bla bla..."
                    maxRows={10}
                    minRows={5}
                    autosize
                    name="message"
                    variant="filled"
                    value={document}
                    onChange={e => setDocument(e.currentTarget.value)}
                />
                <Group position="center" mt="xl">
                    <Link to={document.length === 0 ? "#" : "/feedback"} state={{document: document}}>
                        <Button type="submit" disabled={document.length === 0} size="md">
                            Submit
                        </Button>
                    </Link>
                </Group>
            </Container>
        </>
    );
}