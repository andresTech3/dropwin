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

export async function generateContent(prompt) {
  try {
    const result = await callWithRetry(geminiModel, prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Error generating content with AI: ' + error.message);
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
    const result = await callWithRetry(geminiModelJson, prompt);
    const response = await result.response;
    text = response.text().trim();
    
    const sanitizedText = sanitizeJsonString(text);
    return JSON.parse(sanitizedText);
  } catch (error) {
    console.error('Gemini JSON generation error:', error);
    console.error('Raw response text was:', text);
    throw new Error('Error generating JSON with AI: ' + error.message + ' | Raw text: ' + text.substring(0, 200) + '...');
  }
}

export default genAI;
