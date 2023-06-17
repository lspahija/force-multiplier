import {Notification} from '@mantine/core';

export const ErrorNotification = ({error, setError}) => {
    if (!error) return null;

    return (
        <Notification
            color="red"
            onClose={() => setError(null)}
        >
            {error}
        </Notification>
    );
};
