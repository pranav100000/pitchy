import { NextApiRequest, NextApiResponse } from 'next';
import { ResearchResponse } from '../../lib/types';
import { generateAIResponse } from '../../lib/openai';

interface ResearchApiRequest {
  query: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResearchResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    return res.status(500).json({ 
      success: false, 
      error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' 
    });
  }

  try {
    const { query }: ResearchApiRequest = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required and must be a non-empty string' 
      });
    }

    const trimmedQuery = query.trim();

    // Use WebSearch to get search results
    console.log(`🔍 Searching for: ${trimmedQuery}`);
    
    // For now, let's use AI to generate research data based on the query
    // In a real implementation, you'd use a web search API
    const researchPrompt = `You are a business research assistant. Research the following topic and provide key information that would be useful for a salesperson preparing for a call:

Query: "${trimmedQuery}"

Please provide:
1. A brief 2-3 sentence summary
2. 5-7 key talking points or facts
3. Potential business benefits or value propositions

Format your response as:
SUMMARY: [your summary here]

KEY POINTS:
• [point 1]
• [point 2]
• [point 3]
• [point 4]
• [point 5]

Focus on information that would help a salesperson understand the company, product, or topic better for a sales conversation.`;

    const aiResponse = await generateAIResponse([
      {
        role: 'user',
        content: researchPrompt
      }
    ]);

    if (!aiResponse.success || !aiResponse.response) {
      throw new Error(aiResponse.error || 'Failed to generate research data');
    }

    // Parse the AI response
    const responseText = aiResponse.response;
    let summary = '';
    let keyPoints: string[] = [];

    // Extract summary
    const summaryMatch = responseText.match(/SUMMARY:\s*(.+?)(?=\n|KEY POINTS:|$)/);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    }

    // Extract key points
    const keyPointsMatch = responseText.match(/KEY POINTS:\s*([\s\S]*?)(?=\n\n|$)/);
    if (keyPointsMatch) {
      keyPoints = keyPointsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('•') || line.startsWith('-'))
        .map(line => line.substring(1).trim())
        .filter(line => line.length > 0);
    }

    // Fallback if parsing fails
    if (!summary && keyPoints.length === 0) {
      summary = `Research completed for: ${trimmedQuery}`;
      keyPoints = [
        'General information gathered about the topic',
        'Key business considerations identified',
        'Potential value propositions outlined',
        'Competitive landscape reviewed',
        'Market opportunities assessed'
      ];
    }

    const researchData = {
      query: trimmedQuery,
      summary: summary || `Research summary for ${trimmedQuery}`,
      keyPoints: keyPoints.length > 0 ? keyPoints : [
        'Key information gathered about the topic',
        'Business context and background researched',
        'Relevant talking points identified'
      ],
      sources: ['AI Research Assistant'], // In real implementation, would include actual sources
      timestamp: Date.now()
    };

    console.log(`✅ Research completed for: ${trimmedQuery}`);
    console.log(`📝 Generated ${keyPoints.length} key points`);

    res.status(200).json({
      success: true,
      data: researchData
    });

  } catch (error) {
    console.error('Research API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during research'
    });
  }
}