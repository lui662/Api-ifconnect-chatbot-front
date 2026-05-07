import axios from "https://cdn.jsdelivr.net/npm/axios@1.6.7/+esm";

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    }
})

export default api; 