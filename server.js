const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

let activePlayers = new Map();
const TIMEOUT = 60000;

setInterval(() => {
  const now = Date.now();
  for (let [id, timestamp] of activePlayers.entries()) {
    if (now - timestamp > TIMEOUT) {
      activePlayers.delete(id);
    }
  }
}, 10000);

app.post('/heartbeat', (req, res) => {
  const playerId = req.headers['x-player-id'] || req.ip || `anon-${Math.random()}`;

  activePlayers.set(playerId, Date.now());

  console.log(`Heartbeat from ${playerId}. Total active: ${activePlayers.size}`);

  res.json({ success: true, count: activePlayers.size });
});

app.get('/count', (req, res) => {
  const now = Date.now();
  for (let [id, timestamp] of activePlayers.entries()) {
    if (now - timestamp > TIMEOUT) {
      activePlayers.delete(id);
    }
  }

  res.json({
    schemaVersion: 1,
    label: "Live Players",
    message: activePlayers.size.toString(),
    color: activePlayers.size > 0 ? "blue" : "lightgrey"
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'running', activePlayers: activePlayers.size });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
