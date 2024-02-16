export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            // TODO add embeddings here
            content: `You are a debugging wizard! 🧙‍♂️`,
          },
          ...messages,
        ],
        max_tokens: 512,
        temperature: 0.75,
        stream: true,
      }),
    });


    return new Response(res.body, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error(error);

    return new Response(JSON.stringify(error), {
      status: 400,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}
