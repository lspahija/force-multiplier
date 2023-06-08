import {createStyles, Container, Text, Button, Group, rem} from '@mantine/core';

const useStyles = createStyles((theme) => ({
    wrapper: {
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },

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
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        fontSize: rem(62),
        fontWeight: 900,
        lineHeight: 1.1,
        margin: 0,
        padding: 0,
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,

        [theme.fn.smallerThan('sm')]: {
            fontSize: rem(42),
            lineHeight: 1.2,
        },
    },

    description: {
        marginTop: theme.spacing.xl,
        fontSize: rem(24),

        [theme.fn.smallerThan('sm')]: {
            fontSize: rem(18),
        },
    },

    controls: {
        marginTop: `calc(${theme.spacing.xl} * 2)`,

        [theme.fn.smallerThan('sm')]: {
            marginTop: theme.spacing.xl,
        },
    },

    control: {
        height: rem(54),
        paddingLeft: rem(38),
        paddingRight: rem(38),

        [theme.fn.smallerThan('sm')]: {
            height: rem(54),
            paddingLeft: rem(18),
            paddingRight: rem(18),
            flex: 1,
        },
    },
}));

export function Hero() {
    const {classes} = useStyles();

    return (
        <div className={classes.wrapper}>
            <Container size={700} className={classes.inner}>
                <h1 className={classes.title}>
                    Feedback is{' '}
                    <Text component="span" variant="gradient" gradient={{from: 'blue', to: 'cyan'}} inherit>
                        all
                    </Text>{' '}
                    you need
                </h1>

                <Text className={classes.description} color="dimmed">
                    Enter a starting piece of text. It can be an essay, code, anything.
                    Then, verbally describe the changes you want performed, and watch the AI do all the work.
                    Rinse and repeat until satisfied.
                </Text>

                <Group className={classes.controls}>
                    <Button
                        size="xl"
                        className={classes.control}
                        variant="gradient"
                        gradient={{from: 'blue', to: 'cyan'}}
                    >
                        Get started
                    </Button>
                </Group>
            </Container>
        </div>
    );
}
