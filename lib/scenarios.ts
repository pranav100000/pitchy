import { Scenario, Persona, ConversationExchange, ResearchData, PitchSession } from './types';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const scenarios: Record<string, Scenario> = {
  cold_call: {
    id: 'cold_call',
    name: 'Cold Call',
    description: 'Introducing yourself and product to a new prospect',
    icon: '📞',
    initialContext: `This is a cold call scenario. The salesperson is calling you for the first time to introduce themselves and their product/service. You have no prior relationship with them. React as your persona would to an unexpected sales call.`,
    objectives: [
      'Get the prospect\'s attention and interest',
      'Qualify the prospect\'s needs',
      'Schedule a follow-up meeting or demo',
      'Overcome initial objections and skepticism'
    ]
  },
  
  product_demo: {
    id: 'product_demo',
    name: 'Product Demo',
    description: 'Showing product features and benefits',
    icon: '💻',
    initialContext: `This is a product demonstration scenario. You have already expressed some interest in the product and have agreed to see a demo. The salesperson will be showing you features and benefits. React according to your persona's priorities and concerns.`,
    objectives: [
      'Clearly demonstrate key product features',
      'Connect features to customer benefits',
      'Handle questions about functionality',
      'Move toward closing or next steps'
    ]
  },
  
  objection_handling: {
    id: 'objection_handling',
    name: 'Objection Handling',
    description: 'Customer has concerns that need to be addressed',
    icon: '❓',
    initialContext: `This is an objection handling scenario. You are interested in the product but have significant concerns or objections that need to be addressed before you can move forward. Start the conversation by expressing your main objection based on your persona.`,
    objectives: [
      'Listen carefully to customer concerns',
      'Address objections with empathy and facts',
      'Provide reassurance and proof points',
      'Turn objections into selling opportunities'
    ]
  }
};

export function getScenarioById(id: string): Scenario | null {
  return scenarios[id] || null;
}

export function getAllScenarios(): Scenario[] {
  return Object.values(scenarios);
}

export function buildConversationPrompt(
  persona: Persona, 
  scenario: Scenario, 
  conversationHistory: ConversationExchange[], 
  userMessage: string,
  researchData?: ResearchData | null
): ChatCompletionMessageParam[] {
  const personaData = persona;
  const scenarioData = scenario;
  
  let systemContent = `${personaData.systemPrompt}

SCENARIO CONTEXT: ${scenarioData.initialContext}`;

  // Add research context if available
  if (researchData) {
    systemContent += `

RESEARCH CONTEXT: The salesperson has researched "${researchData.query}" and has the following information:
SUMMARY: ${researchData.summary}
KEY POINTS: ${researchData.keyPoints.join(', ')}

As ${personaData.name}, you should respond realistically to any topics or information the salesperson mentions that relates to this research. Be impressed if they demonstrate good knowledge, but also test them with follow-up questions that fit your persona.`;
  }

  systemContent += `

IMPORTANT INSTRUCTIONS:
- Stay in character as ${personaData.name} throughout the conversation
- Respond naturally as this persona would in this scenario
- Keep responses conversational and realistic (1-3 sentences typically)
- Don't break character or mention that you're an AI
- React authentically based on your persona's traits and the scenario context
- If the salesperson is doing well, show appropriate interest
- If they're struggling, respond according to your persona's nature`;

  const systemMessage: ChatCompletionMessageParam = {
    role: 'system',
    content: systemContent
  };

  const messages: ChatCompletionMessageParam[] = [systemMessage];
  
  // Add conversation history
  conversationHistory.forEach(exchange => {
    if (exchange.user) {
      messages.push({ role: 'user', content: exchange.user } as ChatCompletionMessageParam);
    }
    if (exchange.assistant) {
      messages.push({ role: 'assistant', content: exchange.assistant } as ChatCompletionMessageParam);
    }
  });
  
  // Add current user message
  if (userMessage) {
    messages.push({ role: 'user', content: userMessage } as ChatCompletionMessageParam);
  }
  
  return messages;
}

export function buildFeedbackPrompt(
  conversationHistory: ConversationExchange[], 
  persona: Persona, 
  scenario: Scenario
): string {
  const transcript = conversationHistory.map(exchange => 
    `Salesperson: ${exchange.user}\n${persona.name}: ${exchange.assistant}`
  ).join('\n\n');

  return `You are a BRUTAL but HONEST sales coach analyzing this conversation. Your job is to give harsh, realistic feedback that will actually help improve sales skills. Do NOT sugarcoat or give participation trophies.

SCENARIO: ${scenario.name} - ${scenario.description}
CUSTOMER PERSONA: ${persona.name} - ${persona.description}

CONVERSATION TRANSCRIPT:
${transcript}

SCORING GUIDELINES (be harsh and realistic):
- 90-100: Exceptional performance, would definitely close the deal
- 80-89: Strong performance with minor issues
- 70-79: Decent attempt but clear missed opportunities  
- 60-69: Weak performance, major fundamental issues
- 50-59: Poor performance, customer likely annoyed/disengaged
- 40-49: Very poor, customer probably hung up or lost interest
- 30-39: Terrible performance, completely missed the mark
- 20-29: Disaster - actively drove customer away
- 10-19: So bad it's almost insulting to the customer
- 0-9: Did they even try? Complete failure

JUDGE HARSHLY ON:
- Did they actually understand the persona's needs/concerns?
- Were they prepared or just winging it?
- Did they ask qualifying questions or just pitch?
- How well did they handle objections?
- Was their approach appropriate for this specific customer type?
- Did they build rapport or sound like a robot?
- Were they listening or just waiting to talk?

SPECIAL CASES:
- If transcript is empty or minimal (under 3 exchanges): Score 0-20
- If salesperson said almost nothing: Score 0-30  
- If they ignored obvious customer cues: Deduct 20+ points
- If they were generic instead of persona-specific: Major deduction

Please provide feedback in this exact format:

SCORE: [Number from 0-100, be harsh and realistic]

FEEDBACK:
• [Brutal honest critique of biggest failure/weakness]
• [Another major area that sucked with specific examples]
• [What they completely missed or screwed up]
• [One thing they did okay, if anything, but still needs work]

BE SPECIFIC. USE EXAMPLES FROM THE CONVERSATION. Don't give generic advice. If they failed, tell them exactly why and how. No participation trophies - only give high scores for genuinely excellent performance that would actually close deals.`;
}

export function buildPitchFeedbackPrompt(pitchSession: PitchSession): string {
  const { pitchLength, transcript, duration } = pitchSession;
  const timeUsedPercentage = (duration / pitchLength.duration) * 100;
  
  return `You are a RUTHLESS but HONEST pitch coach analyzing this sales pitch. Your job is to give brutal, realistic feedback that will actually help improve pitching skills. Do NOT sugarcoat or give participation trophies.

PITCH DETAILS:
- Allocated Time: ${pitchLength.duration} seconds (${pitchLength.name})
- Time Used: ${duration} seconds (${timeUsedPercentage.toFixed(1)}% of allocated time)
- Pitch Type: ${pitchLength.description}

PITCH TRANSCRIPT:
${transcript}

SCORING CRITERIA (Rate each 0-100, be brutally honest):

1. CLARITY (0-100): Was the message clear and easy to understand?
- 90-100: Crystal clear, impossible to misunderstand
- 70-89: Mostly clear with minor confusion
- 50-69: Somewhat unclear, key points lost
- 30-49: Confusing, hard to follow
- 0-29: Incomprehensible mess

2. PERSUASIVENESS (0-100): How compelling and convincing was the pitch?
- 90-100: Absolutely compelling, would buy immediately
- 70-89: Very persuasive with strong arguments
- 50-69: Somewhat convincing but weak points
- 30-49: Not very persuasive, unconvincing
- 0-29: Completely unpersuasive, actively off-putting

3. STRUCTURE (0-100): Was there a logical flow and organization?
- 90-100: Perfect structure, masterful flow
- 70-89: Good structure with clear progression
- 50-69: Decent structure but some issues
- 30-49: Poor structure, jumped around
- 0-29: No structure whatsoever, random rambling

4. TIME MANAGEMENT (0-100): How well did they use their allocated time?
- 90-100: Perfect timing, used time optimally
- 70-89: Good timing, minor issues
- 50-69: Decent timing but inefficient
- 30-49: Poor timing, too short/long or wasted time
- 0-29: Terrible timing, completely mismanaged

5. IMPACT (0-100): How memorable and impactful was the overall pitch?
- 90-100: Unforgettable, would stick in mind for weeks
- 70-89: Strong impact, memorable key points
- 50-69: Some impact but forgettable elements
- 30-49: Weak impact, easily forgotten
- 0-29: No impact whatsoever, completely forgettable

JUDGE HARSHLY ON:
- Was the value proposition clear and compelling?
- Did they use their time wisely or ramble/rush?
- Was there a clear structure (hook, problem, solution, benefit, call-to-action)?
- Did they sound confident and prepared or nervous and scattered?
- Was the language appropriate for the time constraint?
- Did they create genuine interest and urgency?

SPECIAL PENALTIES:
- If under 50% of time used: Deduct 20+ points for not filling time
- If over 110% of time: Deduct 10+ points for going over
- If no clear value proposition: Deduct 30+ points
- If no structure at all: Deduct 20+ points
- If no hook or attention grabber: Deduct 15+ points

Please provide feedback in this exact format:

OVERALL SCORE: [Number from 0-100, average of all criteria]

CRITERIA SCORES:
• Clarity: [0-100]
• Persuasiveness: [0-100] 
• Structure: [0-100]
• Time Management: [0-100]
• Impact: [0-100]

CRITERIA JUSTIFICATIONS:
• Clarity Justification: [Detailed explanation of why this score was given, with specific examples from the pitch]
• Persuasiveness Justification: [Detailed explanation of why this score was given, with specific examples from the pitch]
• Structure Justification: [Detailed explanation of why this score was given, with specific examples from the pitch]
• Time Management Justification: [Detailed explanation of why this score was given, with specific examples from the pitch]
• Impact Justification: [Detailed explanation of why this score was given, with specific examples from the pitch]

FEEDBACK:
• [Brutal critique of biggest failure with specific examples]
• [Another major weakness that killed the pitch]
• [What they completely missed about effective pitching]
• [Time management issues - too short/long/poor pacing]
• [One thing they did decently, if anything, but still needs major work]

BE SPECIFIC. USE EXAMPLES FROM THE PITCH. Don't give generic advice. If they failed, tell them exactly why and how. This is a pitch, not a conversation - judge accordingly. No participation trophies.`;
}