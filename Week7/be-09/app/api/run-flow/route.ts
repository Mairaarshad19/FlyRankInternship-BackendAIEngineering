import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL });

export async function POST(req: Request) {
  const { nodes, edges, startNodeId } = await req.json();
  let currentId = startNodeId;
  const history = [];

  while (currentId) {
    const node = nodes.find((n: any) => n.id === currentId);
    if (!node) break;

    const res = await client.chat.completions.create({
      model: 'openrouter/free',
      temperature: 0,
      messages: [
        { role: 'system', content: 'Respond with exactly one word only: YES or NO. No punctuation, no explanation.' },
        { role: 'user', content: node.data.label },
      ],
    });
    const raw = res.choices[0].message.content?.trim().toUpperCase() || '';
    const decision = raw.includes('YES') ? 'YES' : 'NO';

    history.push({ nodeId: currentId, prompt: node.data.label, decision });

    const nextEdge = edges.find((e: any) => e.source === currentId && e.sourceHandle === decision.toLowerCase());
    currentId = nextEdge ? nextEdge.target : null;
  }

  return NextResponse.json({ history });
}