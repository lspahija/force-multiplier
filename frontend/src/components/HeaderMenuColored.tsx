import { createStyles, Header, Container, rem, Text } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background,
    borderBottom: 0,
  },

  inner: {
    height: rem(56),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },
}));

export function HeaderMenuColored() {
  const { classes } = useStyles();

  return (
    <Header height={56} className={classes.header} >
      <Container>
        <div className={classes.inner}>
          <Text fz="xl" fw={700} color={"white"}>Force Multiplier</Text>
        </div>
      </Container>
    </Header>
  );
}