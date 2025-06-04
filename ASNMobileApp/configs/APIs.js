import axios from "axios";

// const BASE_URL = 'https://zennen6528.pythonanywhere.com/';

const BASE_URL = 'http://192.168.100.18:8000/';

export const endpoints = {
    'posts': '/posts/',
    'login': '/o/token/',
    'register': '/users/',
    'current-user': '/users/current-user/',
    'post-details': (postId) => `/posts/${postId}/details/`,
    'comments': (postId) => `/posts/${postId}/comments/`,
    'reactions': (postId) => `/posts/${postId}/reactions/`
};

export const authAPIs = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});