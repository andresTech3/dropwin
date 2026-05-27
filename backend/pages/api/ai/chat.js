import aiService from '../../../services/aiService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages = [], message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const response = await aiService.chat(messages, message);
    return res.status(200).json({ success: true, data: { response, role: 'assistant' } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
