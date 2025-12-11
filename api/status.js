// api/status.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Check for FREE API keys
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  
  return res.status(200).json({
    success: true,
    message: 'Multi-AI Assistant',
    free_apis_available: hasDeepSeek || hasGemini,
    setup_required: !hasDeepSeek && !hasGemini,
    instructions: 'Get FREE API keys from: DeepSeek (https://platform.deepseek.com) and Gemini (https://aistudio.google.com)',
    services: {
      deepseek: hasDeepSeek ? '✅ FREE API configured' : '❌ Get free key',
      gemini: hasGemini ? '✅ FREE API configured' : '❌ Get free key',
      chatgpt: '⚠️ Needs OpenAI credit (or use DeepSeek/Gemini)'
    },
    note: 'DeepSeek and Gemini have FREE tiers - no payment required!'
  });
}
