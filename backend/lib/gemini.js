import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
});

export const geminiModelPro = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  generationConfig: {
    temperature: 0.3,
    topP: 0.9,
    maxOutputTokens: 8192,
  }
});

export const geminiModelJson = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.2,
    topP: 0.95,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json'
  }
});

async function callWithRetry(modelInstance, prompt, retries = 4, initialDelay = 3000) {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await modelInstance.generateContent(prompt);
      return result;
    } catch (error) {
      const errorMsg = String(error.message || error);
      const isRateLimit = errorMsg.includes('429') || 
                          errorMsg.includes('Quota exceeded') || 
                          errorMsg.includes('Too Many Requests') ||
                          errorMsg.includes('rate-limit');
      
      if (isRateLimit && i < retries - 1) {
        console.warn(`[Gemini API] Rate limit (429) hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
        continue;
      }
      throw error;
    }
  }
}

async function callOpenRouterFallback(prompt, isJson = false) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured for fallback.');
  }

  // Use a fast/cheap fallback model on OpenRouter, like Google's Gemini Flash, Claude Haiku, or a reliable Llama
  const model = 'google/gemini-2.5-flash'; 

  const systemMessage = isJson 
    ? 'You are a helpful assistant. Always output valid JSON only. Do not include markdown formatting if possible.'
    : 'You are a helpful assistant.';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://dropwin.vercel.app', 
      'X-Title': 'DropWin'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter fallback error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // Clean markdown JSON formatting if necessary
  if (isJson) {
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (content.startsWith('```')) {
      content = content.replace(/^```/, '').replace(/```$/, '').trim();
    }
  }
  
  return content;
}

export async function generateContent(prompt) {
  try {
    const result = await callWithRetry(geminiModel, prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error, attempting OpenRouter fallback...', error.message);
    try {
      return await callOpenRouterFallback(prompt, false);
    } catch (fallbackError) {
      console.error('OpenRouter fallback also failed:', fallbackError.message);
      throw new Error('Error generating content with AI (both Gemini and fallback failed): ' + error.message);
    }
  }
}

function sanitizeJsonString(str) {
  let inString = false;
  let escaped = false;
  let result = '';
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (char === '"' && !escaped) {
      inString = !inString;
    }
    
    if (inString && (char === '\n' || char === '\r')) {
      result += '\\n';
    } else {
      result += char;
    }
    
    if (char === '\\' && !escaped) {
      escaped = true;
    } else {
      escaped = false;
    }
  }
  return result;
}

export async function generateJSON(prompt) {
  let text = '';
  try {
    try {
      const result = await callWithRetry(geminiModelJson, prompt);
      const response = await result.response;
      text = response.text().trim();
    } catch (geminiError) {
      console.error('Gemini JSON error, attempting OpenRouter fallback...', geminiError.message);
      text = await callOpenRouterFallback(prompt, true);
    }
    
    const sanitizedText = sanitizeJsonString(text);
    return JSON.parse(sanitizedText);
  } catch (error) {
    console.error('JSON generation error:', error);
    console.error('Raw response text was:', text);
    throw new Error('Error generating JSON with AI: ' + error.message + ' | Raw text: ' + text.substring(0, 200) + '...');
  }
}

export default genAI;
