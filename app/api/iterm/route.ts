import OpenAI from 'openai';
import { z } from 'zod';

export const runtime = 'edge';

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      })
    )
    .nonempty(), // Ensure at least one message is present
  // Add any other fields you expect in `rest`, with appropriate validation
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    // Extract the authorization header
    const authorizationHeader = req.headers.get('authorization');

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract the API key from the Bearer token
    const apiKey = authorizationHeader.split(' ')[1];

    // Parse the request body

    // Parse and validate the request body using Zod
    const {messages, ...rest} = requestSchema.parse(await req.json());

    console.log({ messages, rest });

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Prepare and send request to OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a terminal interface. Provide clear, concise, and accurate commands to assist the user.',
        },
        ...messages,
      ],
      ...rest,
    });

    // Return the API response
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: (error as Error)?.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}