require('dotenv').config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const { Configuration, OpenAIApi } = require("openai");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow requests from costudy.in
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Middleware to verify user authentication
const authenticateUser = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ error: "No token provided" });

  const { data, error } = await supabase.auth.getUser(authorization.replace("Bearer ", ""));
  if (error) return res.status(401).json({ error: "Invalid token" });

  req.user = data.user;
  next();
};

// Root route to check if the API is live (from your current code)
app.get("/", (req, res) => {
  res.send("🚀 Costudy AI API is live!");
});

// POST /api/ai-tutor - Handle user messages and get AI responses
app.post("/api/ai-tutor", authenticateUser, async (req, res) => {
  const { message, roomContext } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Prepare the AI prompt with room context (if provided)
    let aiPrompt = "You are a helpful academic tutor. ";
    if (roomContext && roomContext.subject) {
      aiPrompt += `You specialize in ${roomContext.subject}. `;
    }
    aiPrompt += `The user asks: ${message}`;

    // Call OpenAI API (using gpt-4 as per your preference)
    const completion = await openai.createChatCompletion({
      model: "gpt-4", // Changed to gpt-4 to match your current code
      messages: [{ role: "user", content: aiPrompt }],
    });

    const aiResponse = completion.data.choices[0].message.content;

    // Store the chat history in Supabase
    const { error: dbError } = await supabase
      .from("chat_history")
      .insert([
        {
          user_id: userId,
          message,
          response: aiResponse,
          room_context: roomContext || null,
          created_at: new Date().toISOString(),
        },
      ]);

    if (dbError) {
      console.error("Error saving chat history:", dbError);
    }

    // Return the AI response
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// GET /api/chat-history - Fetch user's chat history
app.get("/api/chat-history", authenticateUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from("chat_history")
      .select("message, response")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const formattedMessages = data.map((entry) => [
      { sender: "user", text: entry.message },
      { sender: "ai", text: entry.response },
    ]).flat();

    res.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});