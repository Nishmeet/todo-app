const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-render-server-url.onrender.com/api'  // Update with your actual Render server URL
    : 'http://localhost:4000/api';

export default API_BASE_URL; 