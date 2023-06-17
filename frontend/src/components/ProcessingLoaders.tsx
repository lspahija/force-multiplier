import {Container, Loader} from '@mantine/core';

export const ProcessingLoaders = ({isSpeaking, isProcessing}) => (
    <Container size={50}>
        {isSpeaking && <Loader size="xl" variant="bars"/>}
        {isProcessing && <Loader size="xl"/>}
    </Container>
);
