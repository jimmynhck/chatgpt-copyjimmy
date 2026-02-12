import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Using OpenRouter's free tier API
    // No API key required for some models, but we'll use a demo key approach
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || 'sk-or-v1-demo'}`,
        'HTTP-Referer': 'https://chatgptcopyjimmy.vercel.app',
        'X-Title': 'ChatGPT Clone',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: messages.map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      // Fallback to a mock response if API fails
      return NextResponse.json({
        message: `I'm a demo ChatGPT clone. The free API quota may have been exceeded or requires configuration.\n\nYour message was: "${messages[messages.length - 1]?.content}"\n\nTo use real AI responses, add an OPENROUTER_API_KEY environment variable in Vercel. You can get a free key at https://openrouter.ai/keys`,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      message: data.choices[0]?.message?.content || 'No response from AI',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}