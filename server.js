const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']);

app.use('/images', express.static(PUBLIC_DIR));
app.use(express.static(path.join(__dirname, 'static')));

function scanDir(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanDir(full));
    } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      const rel = path.relative(PUBLIC_DIR, full).split(path.sep).join('/');
      results.push('/images/' + rel);
    }
  }
  return results;
}

app.get('/api/images', (req, res) => {
  try {
    const images = scanDir(PUBLIC_DIR);
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Speed sketch app running at http://localhost:${PORT}`);
});
