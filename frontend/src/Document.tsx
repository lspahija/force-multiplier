import {Textarea, Group, Title, Button, createStyles, rem, Container} from '@mantine/core';
import {useState} from "react";
import {Link} from "react-router-dom";

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
}));

export function Document() {
    const {classes} = useStyles();

    const [document, setDocument] = useState<string>("");

    return (
        <Container size={700} className={classes.inner}>
            <Title
                order={2}
                size="h1"
                sx={(theme) => ({fontFamily: `Greycliff CF, ${theme.fontFamily}`})}
                weight={900}
                align="center"
            >
                Starting Text
            </Title>

            <Textarea
                mt="md"
                placeholder="Your text"
                maxRows={10}
                minRows={5}
                autosize
                name="message"
                variant="filled"
                value={document}
                onChange={e => setDocument(e.currentTarget.value)}
            />
            <Group position="center" mt="xl">
                <Link to={"/feedback"} state={{document: document}}>
                    <Button type="submit" size="md" onClick={() => console.log(document)}>
                        Submit
                    </Button>
                </Link>
            </Group>
        </Container>
    );
}