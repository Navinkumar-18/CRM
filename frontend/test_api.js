const axios = require('axios');

async function run() {
  try {
    // 1. Get token
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@nexus.com',
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;
    
    // 2. Fetch customers
    const res = await axios.get('http://localhost:3001/api/customers?page=1&limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}

run();
