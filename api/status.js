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

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if API keys are configured
  const openaiKey = !!process.env.OPENAI_API_KEY;
  const deepseekKey = !!process.env.DEEPSEEK_API_KEY;
  const geminiKey = !!process.env.GEMINI_API_KEY;

  const services = {
    chatgpt: openaiKey,
    deepseek: deepseekKey,
    gemini: geminiKey
  };

  const availableServices = Object.values(services).filter(v => v).length;
  const totalServices = Object.values(services).length;

  return res.status(200).json({
    success: true,
    available: availableServices > 0,
    message: availableServices === totalServices 
      ? 'All AI services are ready' 
      : `${availableServices} out of ${totalServices} AI services are configured`,
    services: {
      chatgpt: openaiKey ? 'configured' : 'missing',
      deepseek: deepseekKey ? 'configured' : 'missing',
      gemini: geminiKey ? 'configured' : 'missing'
    },
    timestamp: new Date().toISOString()
  });
}
