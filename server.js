require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai'); // ✅ Correct Import

const app = express();
const port = 3000;

// Load OpenAI API Key from .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // ✅ Securely load API Key
});

app.use(express.json());

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error communicating with OpenAI API" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
