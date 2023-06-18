import {Button, createStyles, Modal, rem, Text, TextInput} from "@mantine/core";

const useStyles = createStyles(() => ({
    apiKeyInput: {
        margin: `${rem(15)} 0`,
        whiteSpace: 'pre-wrap'
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '1.5rem',
    },
}));

export const ApiKeyModal = ({ isModalOpen, handleModalClose, apiKey, handleApiKeyChange }) => {
    const { classes } = useStyles();

    return (
        <Modal
            opened={isModalOpen}
            onClose={handleModalClose}
            centered={true}
        >
            <Text fz="xl" fw={500}>Please enter your OpenAI API key</Text>
            <TextInput
                placeholder="OpenAI API key"
                value={apiKey}
                onChange={handleApiKeyChange}
                className={classes.apiKeyInput}
            />
            <div className={classes.buttonContainer}>
                <Button onClick={handleModalClose}>Submit</Button>
            </div>
        </Modal>
    )
}
