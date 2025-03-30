const fetch = require('node-fetch');

async function testAPI() {
    const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Tell me a joke" })
    });

    const data = await response.json();
    console.log("AI Response:", data.reply);
}

testAPI();
