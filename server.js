require('dotenv').config();
const express = require('express');
const cors = require('cors'); // ✅ Enable CORS for frontend access
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000; // ✅ Use environment variable for deployment

// ✅ Load OpenAI API Key securely
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors()); // ✅ Allow cross-origin requests
app.use(express.json());

// ✅ Root route to check if the API is live
app.get("/", (req, res) => {
    res.send("🚀 Costudy AI API is live!");
});

// ✅ OpenAI Chat API endpoint
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
        });

        res.json({ reply: response.choices[0].message.content });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Start the server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
