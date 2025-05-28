import OpenAI from 'openai';
import { TranscriptionResponse, OpenAIResponse, FeedbackResponse } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(audioFile: File): Promise<TranscriptionResponse> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text'
    });
    
    return { success: true, text: transcription };
  } catch (error) {
    console.error('Transcription error:', error);
    return { success: false, error: error.message };
  }
}

export async function generateAIResponse(messages: Array<{role: string; content: string}>): Promise<OpenAIResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 150,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });
    
    return { 
      success: true, 
      response: completion.choices[0].message.content.trim() 
    };
  } catch (error) {
    console.error('AI response error:', error);
    return { success: false, error: error.message };
  }
}

export async function generateSessionFeedback(feedbackPrompt: string): Promise<FeedbackResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: feedbackPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });
    
    const feedbackText = completion.choices[0].message.content.trim();
    
    // Parse the feedback into score and bullet points
    const lines = feedbackText.split('\n').filter(line => line.trim());
    let score = 75; // Default score
    let feedback = [];
    
    // Extract score
    const scoreLine = lines.find(line => line.includes('SCORE:'));
    if (scoreLine) {
      const scoreMatch = scoreLine.match(/(\d+)/);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1]);
      }
    }
    
    // Extract feedback points
    const feedbackStartIndex = lines.findIndex(line => line.includes('FEEDBACK:'));
    if (feedbackStartIndex !== -1) {
      for (let i = feedbackStartIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('•') || line.startsWith('-')) {
          feedback.push(line.substring(1).trim());
        }
      }
    }
    
    // Fallback if parsing fails
    if (feedback.length === 0) {
      feedback = [
        'Good effort in engaging with the customer persona',
        'Consider asking more qualifying questions',
        'Work on addressing objections more directly',
        'Practice active listening and responding to customer cues'
      ];
    }
    
    return { 
      success: true, 
      score, 
      feedback,
      rawFeedback: feedbackText 
    };
  } catch (error) {
    console.error('Feedback generation error:', error);
    return { success: false, error: error.message };
  }
}

export default openai;