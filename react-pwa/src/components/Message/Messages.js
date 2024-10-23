import React, { useEffect } from 'react';
import Message from './Message';
import { useMessages } from '../../context/MessageContext';
import { useUser } from '../../context/UserContext';

function Messages() {
    const { messages, refreshMessages } = useMessages();
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            refreshMessages();
        }
    }, [user, refreshMessages]);

    if (!user) {
        return <div>Please log in to view your messages.</div>;
    }

    return (
        <div>
            <h1>Your Messages</h1>
            <ul>
                {messages.map((message, index) => (
                    <Message key={index} message={message} />
                ))}
            </ul>
        </div>
    );
}

export default Messages;