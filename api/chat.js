import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { message, ai } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log(`Processing ${ai} request: ${message.substring(0, 100)}...`);
    
    let response;
    
    switch(ai) {
      case 'chatgpt':
        response = await handleOpenAI(message);
        break;
      case 'deepseek':
        response = await handleDeepSeek(message);
        break;
      case 'gemini':
        response = await handleGemini(message);
        break;
      default:
        response = await handleOpenAI(message);
    }
    
    return res.status(200).json({
      success: true,
      response: response
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Something went wrong'
    });
  }
}

// OpenAI/ChatGPT
async function handleOpenAI(message) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Add OPENAI_API_KEY to Vercel environment variables.');
  }
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful AI assistant.' },
      { role: 'user', content: message }
    ],
    max_tokens: 1000,
    temperature: 0.7
  });
  
  return completion.choices[0].message.content;
}

// DeepSeek
async function handleDeepSeek(message) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured. Add DEEPSEEK_API_KEY to Vercel environment variables.');
  }
  
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com'
  });
  
  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are DeepSeek, a coding and technical AI assistant.' },
      { role: 'user', content: message }
    ],
    max_tokens: 2000,
    temperature: 0.7
  });
  
  return completion.choices[0].message.content;
}

// Gemini
async function handleGemini(message) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Add GEMINI_API_KEY to Vercel environment variables.');
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const result = await model.generateContent(message);
  const response = await result.response;
  
  return response.text();
}
