import {useState} from "react";
import {Divider, Textarea, Button, rem} from '@mantine/core';

export const FeedbackForm = ({
                                 useVoice,
                                 isProcessing,
                                 sendTextFeedback,
                                 handleModalOpen
                             }) => {
    const [feedback, setFeedback] = useState("");

    return (
        <>
            {
                !useVoice && <form onSubmit={async (e) => {
                    e.preventDefault();
                    await sendTextFeedback(feedback);
                }}>
                    <Divider my="sm" variant="dashed" style={{marginTop: rem(20)}}/>
                    <Textarea
                        placeholder="Type your feedback here"
                        value={feedback}
                        onClick={handleModalOpen}
                        onChange={e => setFeedback(e.currentTarget.value)}
                        disabled={isProcessing}
                        style={{marginTop: rem(30)}}
                    />
                    <div style={{textAlign: 'center', marginTop: rem(20), marginBottom: rem(20)}}>
                        <Button type="submit" disabled={isProcessing}>Submit Feedback</Button>
                    </div>
                </form>
            }
        </>
    );
};
