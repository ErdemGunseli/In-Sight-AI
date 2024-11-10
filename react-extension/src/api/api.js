import { toast } from 'react-toastify';
import config from '../config.json';

export const BASE_URL = config.BASE_URL;

// Creating a custom API Error to encapsulate the status code and message:
class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

/*
This function makes a HTTP request to the specified endpoint and handles the response.
'options' can be used to specify the method, headers, body, etc.
*/
async function sendRequest(endpoint, options = {}) {
    options.headers = options.headers || {};

    // Adding the token to auth header if it exists:
    const token = localStorage.getItem('accessToken');
    if (token) { options.headers['Authorization'] = `Bearer ${token}`;}

    try {
        // Sending the request and obtaining content type of the response:
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const contentType = response.headers.get('content-type');
        let responseObject = null;

        if (response.status !== 204 && contentType && contentType.includes('application/json')) {
            try {
                responseObject = await response.json();
            } catch (jsonError) {
                throw new ApiError('Failed to parse response as JSON', response.status);
            }
        }

        // If the request has failed, providing an error message:
        if (!response.ok) {
            let errorMessage;
            if (response.status === 429) {
                errorMessage = 'You are sending too many actions in a short period. Please try again later.';
            } else {
                errorMessage = responseObject?.detail || response.statusText || 'An error has occurred, please check your input.';
            }
            throw new ApiError(errorMessage, response.status);
        }

        return responseObject;
        
    } catch (error) {
        if (error instanceof ApiError) {
            toast.error(error.message, { toastId: 'api-error' });
        } else {
            toast.error('Please check your network connection', { toastId: 'network-error' });
        }
        return null;
    }
}

export default sendRequest;


export function encodeForm(data) {
    return Object.keys(data)
    // Encoding for application/x-www-form-urlencoded
    // 'encodeURIComponent' encodes spaces and special characters etc.
    // Encoding in the form "key1=val1&key2=val2":
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}