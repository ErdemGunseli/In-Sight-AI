import sendRequest from './api';


export async function getMessages() {
    return await sendRequest('/assistant/messages', {
        method: 'GET'
    });
}


export async function completion(text, encodedImage, generateAudio) {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('encoded_image', encodedImage);
    formData.append('generate_audio', generateAudio);

    return await sendRequest('/assistant/completion', {
        method: 'POST',
        body: formData
    });
}
