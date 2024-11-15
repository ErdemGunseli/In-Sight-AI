import sendRequest from './api';

export function saveVoiceSetting(voice) {
    localStorage.setItem('voiceSetting', voice);
}

export function getVoiceSetting() {
    return localStorage.getItem('voiceSetting');
}

export function saveVoiceSpeed(speed) {
    localStorage.setItem('voiceSpeed', speed);
}

export function getVoiceSpeed() {
    const voiceSpeed = localStorage.getItem('voiceSpeed');
    return parseFloat(voiceSpeed) || 1;
}

export function saveAudioSetting(isAudioOn) {
    localStorage.setItem('audioSetting', isAudioOn);
}

export function getAudioSetting() {
    return localStorage.getItem('audioSetting') === 'true';
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

    // Getting the saved voice setting:
    const voiceSetting = getVoiceSetting();

    // If voice setting exists, including it in the form data:
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

export async function updateMessageFeedback(messageId, feedback) {
    const url = `/assistant/messages/${messageId}/feedback?feedback=${feedback}`;

    return await sendRequest(url, {
        method: 'PUT',
    });
}