const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-render-api-url/api'  // Update with your Render URL
    : 'http://localhost:4000/api';

export default API_BASE_URL; 