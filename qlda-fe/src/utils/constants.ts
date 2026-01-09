

let baseApi = import.meta.env.VITE_API_BASE 
console.log({baseApi});

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
