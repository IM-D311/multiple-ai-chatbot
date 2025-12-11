import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const { message, ai, user } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    console.log(`Processing ${ai} request from ${user}, message: ${message.substring(0, 50)}...`);

    let aiResponse;
    
    // Route to appropriate AI
    switch (ai) {
      case 'deepseek':
        aiResponse = await callDeepSeek(message);
        break;
      case 'gemini':
        aiResponse = await callGemini(message);
        break;
      case 'chatgpt':
      case 'auto':
      default:
        aiResponse = await callChatGPT(message);
        break;
    }

    return res.status(200).json({
      success: true,
      response: aiResponse,
      model: ai
    });

  } catch (error) {
    console.error('API Error:', error.message);
    
    let errorMessage = 'Something went wrong with the AI service';
    let statusCode = 500;
    
    if (error.message.includes('API key')) {
      errorMessage = `API key error. Please configure the ${ai} API key in Vercel environment variables.`;
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
      statusCode = 429;
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
}

// ========== OpenAI/ChatGPT ==========
async function callChatGPT(message) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
      },
      {
        role: 'user',
        content: message
      }
    ],
    max_tokens: 1500,
    temperature: 0.7
  });

  return response.choices[0]?.message?.content || 'No response from ChatGPT';
}

// ========== DeepSeek ==========
async function callDeepSeek(message) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com'
  });

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are DeepSeek, a coding and technical AI assistant. Focus on providing accurate, efficient, and practical solutions for programming, math, and technical problems.'
      },
      {
        role: 'user',
        content: message
      }
    ],
    max_tokens: 2000,
    temperature: 0.7
  });

  return response.choices[0]?.message?.content || 'No response from DeepSeek';
}

// ========== Gemini ==========
async function callGemini(message) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: {
      maxOutputTokens: 1500,
      temperature: 0.7
    }
  });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{
        text: `You are Gemini, a multimodal AI assistant specialized in visual understanding, creative tasks, and comprehensive explanations. Provide detailed, engaging, and helpful responses.

User question: ${message}`
      }]
    }]
  });

  const response = await result.response;
  return response.text() || 'No response from Gemini';
}
