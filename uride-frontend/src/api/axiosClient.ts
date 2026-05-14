import axios from 'axios';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// Aquí pondrás la URL que te dé Railway (Paso 2)
const API_URL_PROD = 'https://tu-backend-u-ride.up.railway.app/api'; 
const API_URL_LOCAL = 'https://localhost:7003/api';

export const api = axios.create({
  baseURL: isLocalhost ? API_URL_LOCAL : API_URL_PROD,
  headers: {
    'Content-Type': 'application/json',
  },
});

// [CRÍTICO] Patrón Interceptor: Atrapa la petición antes de enviarla
api.interceptors.request.use(
    (config) => {
        // Buscamos el pasaporte en la memoria del navegador
        const token = localStorage.getItem('accessToken');
        
        // Si existe, se lo pegamos a la cabecera como lo exigía Swagger
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);