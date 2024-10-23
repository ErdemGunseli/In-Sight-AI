import sendRequest from './api';


export async function getMessages() {
    return await sendRequest('/assistant/messages', {
        method: 'GET'
    });
}

