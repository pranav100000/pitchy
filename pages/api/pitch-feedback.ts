import { NextApiRequest, NextApiResponse } from 'next';
import { generatePitchFeedback } from '../../lib/openai';
import { buildPitchFeedbackPrompt } from '../../lib/scenarios';
import { PitchSession, PitchFeedback } from '../../lib/types';

interface PitchFeedbackApiRequest {
  pitchSession: PitchSession;
}

interface PitchFeedbackApiResponse {
  success: boolean;
  feedback?: PitchFeedback;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PitchFeedbackApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { pitchSession }: PitchFeedbackApiRequest = req.body;

    // Validate required fields
    if (!pitchSession) {
      return res.status(400).json({ 
        success: false, 
        error: 'Pitch session data is required' 
      });
    }

    if (!pitchSession.persona || !pitchSession.persona.name || !pitchSession.persona.description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid persona object is required' 
      });
    }

    if (!pitchSession.pitchLength || !pitchSession.pitchLength.name || !pitchSession.pitchLength.duration) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid pitch length object is required' 
      });
    }

    if (!pitchSession.transcript || typeof pitchSession.transcript !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid transcript string is required' 
      });
    }

    if (typeof pitchSession.duration !== 'number' || pitchSession.duration < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid duration number is required' 
      });
    }

    // Let the LLM handle all cases, including empty or very short pitches
    // No hardcoded fallbacks - the LLM will provide appropriate scores and justifications

    // Build the feedback prompt
    const feedbackPrompt = buildPitchFeedbackPrompt(pitchSession);

    // Generate feedback using OpenAI
    const result = await generatePitchFeedback(feedbackPrompt);

    if (result.success && result.feedback) {
      res.status(200).json({
        success: true,
        feedback: result.feedback
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate pitch feedback'
      });
    }
  } catch (error) {
    console.error('Pitch feedback API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during pitch feedback generation'
    });
  }
}