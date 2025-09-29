const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment from project root: .env.local first, then .env
const rootDir = path.resolve(__dirname, '..');
const envLocalPath = path.join(rootDir, '.env.local');
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const app = express();
app.use(cors());
app.use(express.json());

const PPLX_API_KEY = process.env.PPLX_API_KEY || process.env.PERPLEXITY_API_KEY;
const PPLX_MODEL = process.env.PPLX_MODEL || 'sonar';

app.get('/', (req, res) => {
  res.type('text').send('StockAI API is running. POST /api/generate with JSON { "ticker": "AAPL" }');
});

app.post('/api/generate', async (req, res) => {
  try {
    if (!PPLX_API_KEY) {
      return res.status(500).json({ error: 'Missing PPLX_API_KEY in env' });
    }

    const { ticker } = req.body || {};
    const cleaned = (ticker || '').toString().trim().toUpperCase().slice(0, 10);
    if (!cleaned) {
      return res.status(400).json({ error: 'Ticker is required' });
    }

    const prompt = `In one concise paragraph (80-120 words), describe the stock ${cleaned}. Include what the company does, rough market position, recent general performance tone, and typical risk considerations. Avoid giving financial advice and avoid fabricating precise metrics.`;

    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PPLX_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'stockai-dev/0.1'
      },
      body: JSON.stringify({
        model: PPLX_MODEL,
        messages: [
          { role: 'system', content: 'You are a concise stock explainer. Keep it neutral and factual-sounding.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 220
      })
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return res.status(resp.status).json({ error: 'Upstream error', details: text });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(500).json({ error: 'No content returned' });
    }

    return res.json({ ticker: cleaned, content });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.SERVER_PORT || 4000;
app.listen(PORT, () => {
  console.log(`StockAI server running on http://localhost:${PORT}`);
}); 