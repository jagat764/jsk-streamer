const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

let token = null;

async function getToken() {
  const res = await axios.get('https://api.redgifs.com/v2/auth/temporary');
  token = res.data.token;
}

async function searchRedgifs(query, page = 1) {
  const res = await axios.get('https://api.redgifs.com/v2/gifs/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: { search_text: query, count: 6, page }
  });
  return res.data.gifs;
}

app.get('/', async (req, res) => {
  const q = req.query.q || 'milf';
  const page = parseInt(req.query.page) || 1;

  if (!token) await getToken();

  if (!req.query.json) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en" data-theme="dark">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JSK 18+ Streamer</title>
        <style>
          body { background: var(--bg); color: var(--fg); font-family: Arial, sans-serif; margin: 0; padding: 0; transition: background 0.3s, color 0.3s; }
          header { padding: 20px; background: var(--header-bg); text-align: center; }
          h1 { margin: 0; color: #ff3c00; }
          form { margin-top: 10px; }
          input[type="text"] { padding: 10px; width: 200px; border-radius: 5px; border: none; }
          button { padding: 10px 15px; background: #ff3c00; border: none; color: white; border-radius: 5px; cursor: pointer; }
          #videos.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; padding: 16px; }
          #videos.list { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
          .video-card { background: var(--card-bg); padding: 10px; border-radius: 8px; position: relative; }
          .video-card video { width: 100%; border-radius: 8px; max-height: 320px; }
          .video-title { margin: 8px 0 0 0; font-size: 14px; color: var(--text-muted); }
          #loading { text-align: center; padding: 20px; color: #aaa; }
          .toggle-theme, .toggle-view {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #fff;
            border: 2px solid #ccc;
            cursor: pointer;
            margin-left: 10px;
          }
          .toggle-view { right: 60px; }
          .download-btn {
            position: absolute;
            bottom: 40px;
            right: 20px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #ff3c00;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-decoration: none;
            font-size: 16px;
            border: none;
          }
          .skeleton {
            background: #333;
            height: 200px;
            border-radius: 8px;
            animation: pulse 1s infinite;
          }
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 0.2; }
            100% { opacity: 0.6; }
          }

          html[data-theme="dark"] {
            --bg: #0e0e0e;
            --fg: #fff;
            --header-bg: #1a1a1a;
            --card-bg: #1e1e1e;
            --text-muted: #ccc;
          }

          html[data-theme="light"] {
            --bg: #f0f0f0;
            --fg: #000;
            --header-bg: #fff;
            --card-bg: #fff;
            --text-muted: #555;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>JSK 18+ Streamer</h1>
          <form method="GET">
            <input type="text" name="q" placeholder="Search..." value="${q}" required>
            <button type="submit">Search</button>
          </form>
        </header>
        <div class="toggle-theme" onclick="toggleTheme()"></div>
        <div class="toggle-view" onclick="toggleView()"></div>
        <main>
          <div id="videos" class="grid"></div>
          <div id="loading">Loading...</div>
        </main>
        <script>
          let page = 1;
          const query = "${q}";
          let loading = false;
          let isGrid = true;

          function toggleTheme() {
            const current = document.documentElement.getAttribute("data-theme");
            document.documentElement.setAttribute("data-theme", current === "dark" ? "light" : "dark");
          }

          function toggleView() {
            isGrid = !isGrid;
            const container = document.getElementById('videos');
            container.className = isGrid ? 'grid' : 'list';
          }

          async function loadMore() {
            if (loading) return;
            loading = true;
            document.getElementById('loading').style.display = 'block';

            const container = document.getElementById('videos');
            for (let i = 0; i < 6; i++) {
              const skel = document.createElement('div');
              skel.className = 'skeleton';
              container.appendChild(skel);
            }

            const res = await fetch('/?q=' + encodeURIComponent(query) + '&page=' + page + '&json=1');
            const data = await res.json();
            document.querySelectorAll('.skeleton').forEach(el => el.remove());

            data.forEach(v => {
              const card = document.createElement('div');
              card.className = 'video-card';
              const video = document.createElement('video');
              video.src = v.video;
              video.poster = v.thumbnail;
              video.controls = true;
              video.preload = 'none';
              video.setAttribute('loading', 'lazy');
              video.style.maxHeight = '320px';

              video.addEventListener('play', () => {
                document.querySelectorAll('video').forEach(el => {
                  if (el !== video) el.pause();
                });
              });

              const title = document.createElement('div');
              title.className = 'video-title';
              title.textContent = v.title || 'BY:- JSK';

              const downloadBtn = document.createElement('a');
              downloadBtn.className = 'download-btn';
              downloadBtn.href = v.video;
              downloadBtn.download = '';
              downloadBtn.innerHTML = '↓';
              downloadBtn.title = '🔁';

              card.appendChild(video);
              card.appendChild(title);
              card.appendChild(downloadBtn);
              container.appendChild(card);
            });

            page++;
            loading = false;
            document.getElementById('loading').style.display = 'none';
          }

          window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
              loadMore();
            }
          });

          loadMore();
        </script>
      </body>
      </html>
    `);
  } else {
    const gifs = await searchRedgifs(q, page);
    res.json(gifs.map(v => ({
      video: v.urls.hd || v.urls.sd,
      thumbnail: v.urls.poster,
      title: v.title || ''
    })));
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
