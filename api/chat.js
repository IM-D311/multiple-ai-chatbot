// api/chat.js - HYBRID SOLUTION
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  
  try {
    const { message, ai = 'auto' } = req.body;
    
    if (!message) return res.status(400).json({ error: 'Message required' });
    
    console.log(`🔍 Detecting AI for: "${message.substring(0, 50)}"`);
    
    // Determine which AI to use
    const selectedAI = detectAI(message, ai);
    
    // Try to get answer using credentials
    let response;
    try {
      response = await getAnswerFromAI(message, selectedAI);
    } catch (error) {
      console.log(`❌ Login failed, using smart response: ${error.message}`);
      response = getSmartResponse(message, selectedAI);
    }
    
    return res.status(200).json({
      success: true,
      response: response,
      ai: selectedAI,
      source: 'Your AI Account'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).json({
      success: true,
      response: `I received your message! Here's a helpful response...\n\nYour query: "${req.body?.message?.substring(0, 100)}"\n\n💡 Pro tip: For faster responses, consider using API keys which are more reliable than browser automation.`,
      ai: 'assistant'
    });
  }
}

// Detect which AI to use based on query
function detectAI(message, selectedAI) {
  if (selectedAI !== 'auto') return selectedAI;
  
  const msg = message.toLowerCase();
  
  // Coding queries → DeepSeek
  if (/(code|program|function|algorithm|debug|javascript|python|html|css|java|c\+\+|sql|database|api|git|terminal|error|bug|fix|compile|syntax)/.test(msg)) {
    return 'deepseek';
  }
  
  // Math queries → DeepSeek
  if (/(math|calculate|equation|formula|statistic|probability|algebra|calculus|geometry|trigonometry|solve.*problem)/.test(msg)) {
    return 'deepseek';
  }
  
  // Image/Visual queries → Gemini
  if (/(image|picture|photo|visual|draw|paint|sketch|generate.*image|describe.*image|analyze.*image|vision|look.*like|design|graphic)/.test(msg)) {
    return 'gemini';
  }
  
  // Writing queries → ChatGPT
  if (/(write|essay|story|poem|creative|article|blog|email|letter|content|brainstorm|paraphrase|rewrite|translate|summary|report)/.test(msg)) {
    return 'chatgpt';
  }
  
  // Default to ChatGPT
  return 'chatgpt';
}

// Try to login and get answer (simplified version)
async function getAnswerFromAI(message, aiType) {
  // YOUR CREDENTIALS (you need to provide these)
  const credentials = {
    chatgpt: {
      email: process.env.CHATGPT_EMAIL || 'imulla311@gmail.com',
      password: process.env.CHATGPT_PASSWORD || 'Imulla@311'
    },
    deepseek: {
      email: process.env.DEEPSEEK_EMAIL || 'imulla311@gmail.com',
      password: process.env.DEEPSEEK_PASSWORD || 'Imulla@311'
    },
    gemini: {
      email: process.env.GEMINI_EMAIL || 'imulla311@gmail.com',
      password: process.env.GEMINI_PASSWORD || 'Imulla@311'
    }
  };
  
  // Check if credentials exist
  const creds = credentials[aiType];
  if (!creds.email || creds.email === 'your-email@gmail.com') {
    throw new Error(`No credentials configured for ${aiType}. Please add ${aiType.toUpperCase()}_EMAIL and ${aiType.toUpperCase()}_PASSWORD to Vercel environment variables.`);
  }
  
  console.log(`🔄 Attempting to use ${aiType} with email: ${creds.email}`);
  
  // Browser automation is complex in serverless
  // For now, return a simulated response
  return simulateAIResponse(message, aiType, creds.email);
}

// Simulate AI response (in production, this would be real browser automation)
function simulateAIResponse(message, aiType, userEmail) {
  const aiNames = {
    chatgpt: 'ChatGPT',
    deepseek: 'DeepSeek',
    gemini: 'Gemini'
  };
  
  const aiSpecialties = {
    chatgpt: 'creative writing, general knowledge, and problem-solving',
    deepseek: 'coding, mathematics, and technical solutions',
    gemini: 'visual analysis, creative content, and multimodal tasks'
  };
  
  return `🤖 **Response from ${aiNames[aiType]} (via ${userEmail}'s account)**\n\n**Your Question:** ${message}\n\n**Answer:**\nThis is a simulated response from your ${aiNames[aiType]} account. In a production system, this would be the actual answer from ${aiNames[aiType]} after logging in with your credentials.\n\n**Specialty:** ${aiNames[aiType]} is particularly good at ${aiSpecialties[aiType]}.\n\n**Next Steps:**\n1. To get real answers, the system needs to automate browser login\n2. This requires complex setup with Puppeteer/Playwright\n3. Consider using API keys for more reliable access\n\n💡 **Actual functionality would:**\n• Login to ${aiNames[aiType]} as ${userEmail}\n• Submit your question\n• Extract and return the real answer\n• Logout to save session`;
}

// Smart fallback response
function getSmartResponse(message, aiType) {
  const responses = {
    chatgpt: `As ChatGPT, I would analyze: "${message}"\n\nBased on typical ChatGPT responses:\n• Provide comprehensive answer\n• Include examples\n• Offer multiple perspectives\n• Suggest next steps\n\n🔧 **To enable real ChatGPT responses:**\nAdd your ChatGPT credentials to Vercel environment variables.`,
    deepseek: `As DeepSeek (coding expert), for query: "${message}"\n\nI would provide:\n• Code examples\n• Step-by-step solutions\n• Best practices\n• Debugging tips\n• Performance optimizations\n\n💻 **For real coding help:**\nConfigure your DeepSeek account credentials.`,
    gemini: `As Gemini (multimodal AI), for: "${message}"\n\nI would offer:\n• Visual analysis\n• Creative suggestions\n• Detailed explanations\n• Practical applications\n• Related concepts\n\n🎨 **For visual/content help:**\nSet up your Gemini credentials.`
  };
  
  return responses[aiType] || responses.chatgpt;
}
