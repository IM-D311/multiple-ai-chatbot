export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  
  return res.status(200).json({
    success: true,
    message: 'Multi-AI Assistant API',
    services: {
      chatgpt: hasOpenAI,
      deepseek: hasDeepSeek,
      gemini: hasGemini
    },
    available: hasOpenAI || hasDeepSeek || hasGemini,
    timestamp: new Date().toISOString()
  });
}
