import { NextApiRequest, NextApiResponse } from 'next';
import { generateAIResponse } from '../../lib/openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

interface ChatApiRequest {
  messages: ChatCompletionMessageParam[];
}

interface ChatApiResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { messages }: ChatApiRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Messages array is required and must not be empty' 
      });
    }

    // Validate message format
    const isValidMessages = messages.every(msg => 
      msg && 
      typeof msg.role === 'string' && 
      typeof msg.content === 'string' &&
      ['system', 'user', 'assistant'].includes(msg.role)
    );

    if (!isValidMessages) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid message format. Each message must have role and content.' 
      });
    }

    // Generate AI response
    const result = await generateAIResponse(messages);

    if (result.success) {
      res.status(200).json({
        success: true,
        response: result.response
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate AI response'
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during AI response generation'
    });
  }
}