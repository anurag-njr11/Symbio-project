require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testSDK() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    // Explicitly using the model we know exists from the REST list
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("Testing generation with gemini-2.5-flash...");
    try {
        const result = await model.generateContent("Hello!");
        console.log("Success! Response:", result.response.text());
    } catch (error) {
        console.error("SDK Error:", error);
    }
}

testSDK();
