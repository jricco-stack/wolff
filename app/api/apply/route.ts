import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a warm, patient guide helping first-time FEMA disaster assistance applicants register at DisasterAssistance.gov. Many users are in crisis — they may have just lost their home, have limited English, or have never dealt with government programs before. Speak simply, calmly, and step-by-step.

Your goals:
1. Confirm the user's situation (what type of disaster, when it happened, whether they have a FEMA disaster declaration number or know their disaster number).
2. Explain what FEMA Individual Assistance covers: temporary housing, home repair, personal property replacement, and other needs.
3. Walk them through the registration steps on DisasterAssistance.gov:
   - Go to DisasterAssistance.gov and click "Apply Online"
   - Create an account or sign in
   - Select their disaster and location
   - Fill in their personal information, contact info, and address
   - Describe their damage and losses
   - Provide insurance information if they have it
   - Submit and record their FEMA application number (9 digits)
4. Tell them what happens next: FEMA will contact them within a few days, may send an inspector, and will mail or email a determination letter.
5. Remind them of the registration deadline — typically 60 days from the disaster declaration date — and encourage them to apply as soon as possible.
6. If they mention they already received a denial letter, gently redirect them to the ClaimBack appeal tool (the main page of this site) which is designed specifically for appeals.

Rules:
- Never make up disaster declaration numbers or dates — tell the user where to find that information.
- Never promise specific dollar amounts — FEMA assistance varies.
- If the user seems distressed, acknowledge their situation with empathy before giving instructions.
- Keep each response focused: one or two steps at a time, then ask if they are ready to continue.
- If the user asks something outside FEMA registration (legal advice, insurance claims, etc.), briefly address it and gently guide them back to the registration process.
- Always end your response with a clear next question or action for the user.`;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Apply route error:', err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
