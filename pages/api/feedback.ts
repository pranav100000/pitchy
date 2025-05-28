import { NextApiRequest, NextApiResponse } from 'next';
import { generateSessionFeedback } from '../../lib/openai';
import { buildFeedbackPrompt } from '../../lib/scenarios';
import { ConversationExchange, Persona, Scenario, SessionFeedback } from '../../lib/types';

interface FeedbackApiRequest {
  transcript: ConversationExchange[];
  persona: Persona;
  scenario: Scenario;
}

interface FeedbackApiResponse {
  success: boolean;
  feedback?: SessionFeedback;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeedbackApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { transcript, persona, scenario }: FeedbackApiRequest = req.body;

    // Validate required fields
    if (!transcript || !Array.isArray(transcript)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transcript array is required' 
      });
    }

    if (!persona || !persona.name || !persona.description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid persona object is required' 
      });
    }

    if (!scenario || !scenario.name || !scenario.description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid scenario object is required' 
      });
    }

    // Validate transcript format
    const isValidTranscript = transcript.every(exchange => 
      exchange && 
      typeof exchange.user === 'string' && 
      typeof exchange.assistant === 'string' &&
      typeof exchange.timestamp === 'number'
    );

    if (!isValidTranscript) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid transcript format. Each exchange must have user, assistant, and timestamp.' 
      });
    }

    // Handle empty conversation
    if (transcript.length === 0) {
      return res.status(200).json({
        success: true,
        feedback: {
          score: 0,
          feedback: [
            'Complete failure: No conversation attempted whatsoever',
            'You cannot learn sales without actually talking to the customer',
            'This is like showing up to a sales meeting and saying nothing',
            'Start over and actually engage in a real conversation'
          ],
          rawFeedback: 'SCORE: 0 - No conversation data available for analysis. Complete failure to engage.'
        }
      });
    }

    // Handle minimal conversation (less than 2 meaningful exchanges)
    if (transcript.length < 2) {
      return res.status(200).json({
        success: true,
        feedback: {
          score: 15,
          feedback: [
            'Pathetically short conversation - barely tried to engage',
            'One or two sentences is not a sales conversation',
            'Real customers need more than surface-level interaction',
            'Practice having complete conversations, not just quick exchanges'
          ],
          rawFeedback: 'SCORE: 15 - Extremely minimal conversation. Insufficient effort to evaluate sales skills.'
        }
      });
    }

    // Build the feedback prompt
    const feedbackPrompt = buildFeedbackPrompt(transcript, persona, scenario);

    // Generate feedback using OpenAI
    const result = await generateSessionFeedback(feedbackPrompt);

    if (result.success) {
      res.status(200).json({
        success: true,
        feedback: {
          score: result.score || 0,
          feedback: result.feedback || [],
          rawFeedback: result.rawFeedback || ''
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate feedback'
      });
    }
  } catch (error) {
    console.error('Feedback API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during feedback generation'
    });
  }
}