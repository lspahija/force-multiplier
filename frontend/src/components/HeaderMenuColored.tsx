import { createStyles, Header, Container, rem, Text } from '@mantine/core';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBolt} from "@fortawesome/free-solid-svg-icons";

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background,
    borderBottom: 0,
  },

  inner: {
    height: rem(56),
    display: 'flex',
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
          <FontAwesomeIcon icon={faBolt} style={{color: "#ffffff", marginRight: "0.5rem"}}/>
          <Text fz="xl" fw={700} color={"white"}>Force Multiplier</Text>
        </div>
      </Container>
    </Header>
  );
}