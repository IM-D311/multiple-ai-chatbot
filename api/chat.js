// /api/chat.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { message, ai } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    let aiResponse;
    
    // Route to appropriate AI based on 'ai' parameter
    if (ai === 'deepseek') {
      aiResponse = await callDeepSeek(message);
    } else if (ai === 'gemini') {
      aiResponse = await callGemini(message);
    } else {
      aiResponse = await callChatGPT(message); // Default to ChatGPT
    }

    return res.status(200).json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong with the AI service'
    });
  }
}

// Helper functions for each AI
async function callChatGPT(message) {
  // Your OpenAI logic here
  return "ChatGPT response placeholder";
}

async function callDeepSeek(message) {
  // Your DeepSeek logic here
  return "DeepSeek response placeholder";
}

async function callGemini(message) {
  // Your Gemini logic here
  return "Gemini response placeholder";
}