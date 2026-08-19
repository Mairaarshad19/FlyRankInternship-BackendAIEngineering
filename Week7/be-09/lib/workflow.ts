import { inngest } from './inngest';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const runWorkflow = inngest.createFunction(
  {
    id: 'run-decision-flow',
    triggers: {
      event: 'flow/run',
    },
  },
  async ({ event, step }) => {
    const { nodes, edges, startNodeId } = event.data;

    let currentId = startNodeId;

    const history: any[] = [];

    while (currentId) {
      const node = nodes.find((n: any) => n.id === currentId);

      if (!node) {
        break;
      }

      const decision = await step.run(`decide-${currentId}`, async () => {
        const res = await client.chat.completions.create({
          model: 'openrouter/free',
          temperature: 0,
          messages: [
            { role: 'system', content: 'Respond with exactly one word only: YES or NO. No punctuation, no explanation, no other text of any kind.' },
            { role: 'user', content: node.data.label },
          ],
        });
        const raw = res.choices[0].message.content?.trim().toUpperCase() || '';
        return raw.includes('YES') ? 'YES' : 'NO';
      });

      history.push({
        nodeId: currentId,
        prompt: node.data.label,
        decision,
      });

      const nextEdge = edges.find(
        (e: any) =>
          e.source === currentId &&
          e.sourceHandle === decision?.toLowerCase()
      );

      currentId = nextEdge ? nextEdge.target : null;
    }

    return {
      history,
    };
  }
);