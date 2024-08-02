// proxy-server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = 3333;

app.use(cors())

app.get('/api/tokenList', async (req, res) => {
  try {
    const response = await fetch('https://gateway.ipfs.io/ipns/tokens.uniswap.org');
    const data = await response.json();
    console.log(data);
    res.json(JSON.stringify(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch token list' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});