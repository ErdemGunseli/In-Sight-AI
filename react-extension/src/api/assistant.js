import sendRequest from './api';

// Add functions to save and get the voice setting
export function saveVoiceSetting(voice) {
    localStorage.setItem('voiceSetting', voice);
}

export function getVoiceSetting() {
    return localStorage.getItem('voiceSetting');
}

// Add functions to save and get the voice speed
export function saveVoiceSpeed(speed) {
    localStorage.setItem('voiceSpeed', speed);
}

export function getVoiceSpeed() {
    return localStorage.getItem('voiceSpeed');
}

export async function getMessages() {
    return await sendRequest('/assistant/messages', { method: 'GET' });
}

export async function completion(text, encodedImage = null, generateAudio = false) {
    const formData = new FormData();

    if (text) {
        formData.append('text', text);
    }
    if (encodedImage) {
        formData.append('encoded_image', encodedImage);
    }
    formData.append('generate_audio', generateAudio);

    // Get the saved voice setting
    const voiceSetting = getVoiceSetting();

    // If voice setting exists, include it in the form data
    if (voiceSetting) {
        formData.append('openai_voice', voiceSetting);
    }

    return await sendRequest('/assistant/completion', {
        method: 'POST',
        body: formData
    });
}

export async function deleteMessages() {
    return await sendRequest('/assistant/messages', { method: 'DELETE' });
}