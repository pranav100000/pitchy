import { Scenario, Persona, ConversationExchange } from './types';
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
  userMessage: string
): ChatCompletionMessageParam[] {
  const personaData = persona;
  const scenarioData = scenario;
  
  const systemMessage: ChatCompletionMessageParam = {
    role: 'system',
    content: `${personaData.systemPrompt}

SCENARIO CONTEXT: ${scenarioData.initialContext}

IMPORTANT INSTRUCTIONS:
- Stay in character as ${personaData.name} throughout the conversation
- Respond naturally as this persona would in this scenario
- Keep responses conversational and realistic (1-3 sentences typically)
- Don't break character or mention that you're an AI
- React authentically based on your persona's traits and the scenario context
- If the salesperson is doing well, show appropriate interest
- If they're struggling, respond according to your persona's nature`
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

  return `Please analyze this sales conversation and provide constructive feedback.

SCENARIO: ${scenario.name} - ${scenario.description}
CUSTOMER PERSONA: ${persona.name} - ${persona.description}

CONVERSATION TRANSCRIPT:
${transcript}

Please provide feedback in this exact format:

SCORE: [Number from 1-100]

FEEDBACK:
• [Specific strength or area done well]
• [Specific area for improvement with actionable advice]
• [Another specific area for improvement or strength]
• [Final key insight or recommendation]

Focus on:
1. How well the salesperson adapted to the ${persona.name} persona
2. Effectiveness in the ${scenario.name} scenario
3. Communication skills and approach
4. Specific improvements with actionable advice
5. What they did well that they should continue

Keep feedback constructive, specific, and actionable. Avoid generic advice.`;
}