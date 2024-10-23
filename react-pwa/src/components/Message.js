import React from 'react';
import PropTypes from 'prop-types';

function Message({ message }) {
    return (
        <li>
            <div>
                <strong>Type:</strong> {message.type}
            </div>
            <div>
                <strong>Text:</strong> {message.text || 'No text available'}
            </div>
            {message.encoded_audio && (
                <div>
                    <strong>Audio:</strong> 
                    <audio controls>
                        <source src={`data:audio/wav;base64,${message.encoded_audio}`} type="audio/wav" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
            <div>
                <strong>Timestamp:</strong> {new Date(message.timestamp).toLocaleString()}
            </div>
        </li>
    );
}

Message.propTypes = {
    message: PropTypes.shape({
        type: PropTypes.string.isRequired,
        text: PropTypes.string,
        encoded_audio: PropTypes.string,
        timestamp: PropTypes.string.isRequired,
    }).isRequired,
};

export default Message;
