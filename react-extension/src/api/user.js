import sendRequest from "./api";
import { login } from "./auth";


export async function createUser(name, email, password) {
    const response = await sendRequest('/user/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });


      if (response) {
        await login(email, password);
      }

      return response;
}


export async function getCurrentUser() {
  return await sendRequest('/user/');
}


export async function deleteUser() {
  const response = await sendRequest('/user/', {
    method: 'DELETE',
  });

  return response;
}