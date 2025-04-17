const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

let token = null;

async function getToken() {
  const res = await axios.get('https://api.redgifs.com/v2/auth/temporary');
  token = res.data.token;
}

async function searchRedgifs(query, page = 1) {
  if (!token) await getToken();
  const res = await axios.get('https://api.redgifs.com/v2/gifs/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: { search_text: query, count: 10, page }
  });
  return res.data.gifs;
}

// Serve static HTML
app.use(express.static(path.join(__dirname, 'public')));

// Proxy API route
app.get('/api/search', async (req, res) => {
  const q = req.query.q || 'milf';
  const page = parseInt(req.query.page) || 1;
  try {
    const gifs = await searchRedgifs(q, page);
    res.json(gifs.map(v => ({
      video: v.urls.hd || v.urls.sd,
      thumbnail: v.urls.poster,
      title: v.title || ''
    })));
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Failed to fetch from RedGIFs' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
