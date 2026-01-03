// API Base URL - có thể override bằng biến môi trường VITE_API_BASE

let baseApi = import.meta.env.VITE_API_BASE 
console.log({baseApi});

// process.env.NODE_ENV === "production" && (baseApi = "https://api-server-mail.sclould.com");

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
