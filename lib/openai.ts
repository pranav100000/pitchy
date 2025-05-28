import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
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
    return { success: false, error: error instanceof Error ? error.message : 'Unknown transcription error' };
  }
}

export async function generateAIResponse(messages: ChatCompletionMessageParam[]): Promise<OpenAIResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.5-preview',
      messages: messages,
      max_tokens: 150,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });
    
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content received from OpenAI');
    }
    
    return { 
      success: true, 
      response: content.trim() 
    };
  } catch (error) {
    console.error('AI response error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown AI response error' };
  }
}

export async function generateSessionFeedback(feedbackPrompt: string): Promise<FeedbackResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.5-preview',
      messages: [
        {
          role: 'user',
          content: feedbackPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });
    
    const feedbackText = completion.choices[0]?.message?.content?.trim();
    if (!feedbackText) {
      throw new Error('No feedback content received from OpenAI');
    }
    
    // Parse the feedback into score and bullet points
    const lines = feedbackText.split('\n').filter(line => line.trim());
    let score = 25; // Default harsh score for poor conversations
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
        'Failed to extract meaningful feedback from conversation analysis',
        'This suggests the conversation was too brief or unfocused to evaluate',
        'Need significantly more substantive interaction with the customer',
        'Try having a complete conversation before expecting useful feedback'
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
    return { success: false, error: error instanceof Error ? error.message : 'Unknown feedback generation error' };
  }
}

export default openai;