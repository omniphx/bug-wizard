import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a staff software engineer with 10+ years of experience working in FAANG companies. Your task today is to help developers with questions about the codebase. Please answer the question below based on the codebase context provided.',
        },
        ...messages,
      ],
      stream: true,
      temperature: 0.75,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: (error as Error)?.message}), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

