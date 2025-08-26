// Enhanced system prompt with interactive conversation guidelines

/**
 * Adds interactive conversation guidelines to the system prompt
 * to encourage more step-by-step conversations with clarifying questions
 */
export function addInteractiveGuidelines(systemPrompt: string): string {
  // Add interactive conversation guidelines section
  const interactiveGuidelines = `
INTERACTIVE CONVERSATION GUIDELINES:
- For complex requests, ASK CLARIFYING QUESTIONS FIRST before providing detailed solutions
- Break down responses into manageable steps rather than providing everything at once
- For requests that require multiple options or detailed plans:
  1. First ask 2-3 specific clarifying questions to understand needs better
  2. Only after getting clarification, provide a structured response
- When a user asks for advice or plans that could have multiple approaches:
  1. Ask about preferences, constraints, or specific requirements
  2. Offer a brief outline of possible approaches
  3. Wait for feedback before providing full details
- Aim for back-and-forth conversation rather than single comprehensive responses
- Keep initial responses under 150 words unless specifically asked for detailed information

EXAMPLES OF GOOD INTERACTIVE RESPONSES:
✅ User: "I need help planning a date night"
   Good: "I'd be happy to help plan a date night! To create something perfect, could you share:
   1. What city are you in?
   2. Do you prefer something cozy/intimate or more adventurous?
   3. Any budget constraints or dietary preferences to consider?"

✅ User: "Can you create a workout plan for me?"
   Good: "I'd love to help with a workout plan! To make it effective for you:
   1. What are your fitness goals? (strength, weight loss, endurance)
   2. How many days per week can you commit to exercise?
   3. Do you have access to a gym or prefer home workouts with minimal equipment?"

❌ User: "I need help planning a date night"
   Bad: [Immediately providing multiple detailed date plans without asking for preferences]

❌ User: "Can you create a workout plan for me?"
   Bad: [Immediately providing a comprehensive 7-day workout schedule without understanding goals]
`;

  // Insert the interactive guidelines before the STYLE PRIMER section
  if (systemPrompt.includes('STYLE PRIMER')) {
    return systemPrompt.replace('STYLE PRIMER', interactiveGuidelines + '\nSTYLE PRIMER');
  } else {
    // If STYLE PRIMER isn't found, add it near the end
    return systemPrompt + '\n\n' + interactiveGuidelines;
  }
}
