import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TTSApiRequest {
  text: string;
  persona: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, persona }: TTSApiRequest = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Select voice based on persona
    let voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy';
    
    switch (persona) {
      case 'skeptical_steve':
        voice = 'onyx'; // Deeper, more serious voice
        break;
      case 'busy_betty':
        voice = 'nova'; // Faster, more energetic voice
        break;
      case 'technical_tom':
        voice = 'echo'; // Clear, professional voice
        break;
      default:
        voice = 'alloy';
    }

    const response = await openai.audio.speech.create({
      model: 'tts-1-hd', // High quality model
      voice: voice,
      input: text,
      response_format: 'mp3',
      speed: persona === 'busy_betty' ? 1.1 : persona === 'skeptical_steve' ? 0.9 : 1.0
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);

  } catch (error) {
    console.error('TTS API error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}