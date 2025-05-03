const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load secrets from .env
dotenv.config();

const app = express();
const PORT = 3000;
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // serves index.html and other frontend files

app.post('/generate-story', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        const response = await axios.post(API_URL, {
            contents: [
                {
                    parts: [{ text: `Write a short story based on the following prompt: ${prompt}` }]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const story = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No story received.';
        res.json({ story });

    } catch (err) {
        console.error('Gemini API error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to generate story.' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
