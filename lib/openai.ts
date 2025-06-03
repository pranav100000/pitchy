import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { TranscriptionResponse, OpenAIResponse, FeedbackResponse, PitchFeedbackResponse, PitchFeedback } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(audioFile: File): Promise<TranscriptionResponse> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
      prompt: 'This is a sales pitch in English.'
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

export async function generatePitchFeedback(feedbackPrompt: string): Promise<PitchFeedbackResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.5-preview',
      messages: [
        {
          role: 'user',
          content: feedbackPrompt
        }
      ],
      max_tokens: 700,
      temperature: 0.3
    });
    
    const feedbackText = completion.choices[0]?.message?.content?.trim();
    if (!feedbackText) {
      throw new Error('No feedback content received from OpenAI');
    }
    
    // Parse the pitch feedback into structured format
    const lines = feedbackText.split('\n').filter(line => line.trim());
    
    let overallScore = 25; // Default harsh score
    const criteria = {
      clarity: 25,
      persuasiveness: 25,
      structure: 25,
      timeManagement: 25,
      impact: 25
    };
    const criteriaJustifications = {
      clarity: 'Unable to parse justification from feedback',
      persuasiveness: 'Unable to parse justification from feedback',
      structure: 'Unable to parse justification from feedback',
      timeManagement: 'Unable to parse justification from feedback',
      impact: 'Unable to parse justification from feedback'
    };
    const feedback: string[] = [];
    
    // Extract overall score
    const overallScoreLine = lines.find(line => line.includes('OVERALL SCORE:'));
    if (overallScoreLine) {
      const scoreMatch = overallScoreLine.match(/(\d+)/);
      if (scoreMatch) {
        overallScore = parseInt(scoreMatch[1]);
      }
    }
    
    // Extract criteria scores
    const criteriaSection = lines.find(line => line.includes('CRITERIA SCORES:'));
    if (criteriaSection) {
      const criteriaStartIndex = lines.indexOf(criteriaSection);
      for (let i = criteriaStartIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('Clarity:')) {
          const match = line.match(/(\d+)/);
          if (match) criteria.clarity = parseInt(match[1]);
        } else if (line.includes('Persuasiveness:')) {
          const match = line.match(/(\d+)/);
          if (match) criteria.persuasiveness = parseInt(match[1]);
        } else if (line.includes('Structure:')) {
          const match = line.match(/(\d+)/);
          if (match) criteria.structure = parseInt(match[1]);
        } else if (line.includes('Time Management:')) {
          const match = line.match(/(\d+)/);
          if (match) criteria.timeManagement = parseInt(match[1]);
        } else if (line.includes('Impact:')) {
          const match = line.match(/(\d+)/);
          if (match) criteria.impact = parseInt(match[1]);
        } else if (line.includes('CRITERIA JUSTIFICATIONS:')) {
          break;
        }
      }
    }

    // Extract criteria justifications
    const justificationsSection = lines.find(line => line.includes('CRITERIA JUSTIFICATIONS:'));
    if (justificationsSection) {
      const justificationsStartIndex = lines.indexOf(justificationsSection);
      for (let i = justificationsStartIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('Clarity Justification:')) {
          criteriaJustifications.clarity = line.substring(line.indexOf(':') + 1).trim();
        } else if (line.includes('Persuasiveness Justification:')) {
          criteriaJustifications.persuasiveness = line.substring(line.indexOf(':') + 1).trim();
        } else if (line.includes('Structure Justification:')) {
          criteriaJustifications.structure = line.substring(line.indexOf(':') + 1).trim();
        } else if (line.includes('Time Management Justification:')) {
          criteriaJustifications.timeManagement = line.substring(line.indexOf(':') + 1).trim();
        } else if (line.includes('Impact Justification:')) {
          criteriaJustifications.impact = line.substring(line.indexOf(':') + 1).trim();
        } else if (line.includes('FEEDBACK:')) {
          break;
        }
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
      feedback.push(
        'Failed to extract meaningful feedback from pitch analysis',
        'This suggests the pitch was too brief or unclear to evaluate properly',
        'Need a more substantial and structured pitch for useful feedback',
        'Try delivering a complete pitch with clear structure and content'
      );
    }

    // Fallback for missing justifications
    if (criteriaJustifications.clarity === 'Unable to parse justification from feedback') {
      criteriaJustifications.clarity = 'Unable to extract detailed justification from AI analysis';
      criteriaJustifications.persuasiveness = 'Unable to extract detailed justification from AI analysis';
      criteriaJustifications.structure = 'Unable to extract detailed justification from AI analysis';
      criteriaJustifications.timeManagement = 'Unable to extract detailed justification from AI analysis';
      criteriaJustifications.impact = 'Unable to extract detailed justification from AI analysis';
    }
    
    const pitchFeedback: PitchFeedback = {
      score: overallScore,
      feedback,
      rawFeedback: feedbackText,
      criteria,
      criteriaJustifications
    };
    
    return { 
      success: true, 
      feedback: pitchFeedback
    };
  } catch (error) {
    console.error('Pitch feedback generation error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown pitch feedback generation error' };
  }
}

export default openai;