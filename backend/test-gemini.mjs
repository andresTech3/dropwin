import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing');
      process.exit(1);
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    console.log('Testing Gemini API key with gemini-2.5-flash...');
    const prompt = 'Return a JSON object with a key "status" and value "ok"';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('Response:', response.text());
    console.log('SUCCESS: API key and model are working!');
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
}

testGemini();
