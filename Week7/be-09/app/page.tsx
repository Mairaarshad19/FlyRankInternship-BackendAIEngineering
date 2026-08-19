'use client';

import 'reactflow/dist/style.css';
import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
} from 'reactflow';

import 'reactflow/dist/style.css';

import PromptNode from '@/components/PromptNode';

const nodeTypes = {
  promptNode: PromptNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 250, y: 100 },
    data: {
      label: 'Is this a support request?',
    },
    type: 'promptNode',
  },
];

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection: any) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const updateNodeLabel = useCallback(
    (id: string, value: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  label: value,
                },
              }
            : node
        )
      );
    },
    []
  );

  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onChange: updateNodeLabel,
    },
  }));

  const addNode = () => {
    const id = String(nodes.length + 1);

    setNodes((nds) => [
      ...nds,
      {
        id,
        position: {
          x: 250,
          y: nds.length * 150,
        },
        data: {
          label: 'New prompt',
        },
        type: 'promptNode',
      },
    ]);
  };

const [logs, setLogs] = useState<any[]>([]);
const [running, setRunning] = useState(false);

    const runFlow = async () => {
      setRunning(true);
      const res = await fetch('/api/run-flow', {
        method: 'POST',
        body: JSON.stringify({ nodes, edges, startNodeId: nodes[0].id }),
      });
      const data = await res.json();
      setLogs(data.history);
      setRunning(false);
    };
  return (
      <div style={{ height: '100vh', position: 'relative' }}>
    <button onClick={addNode} style={{ position: 'absolute', zIndex: 50, margin: 10, padding: '8px 12px' }}>
      + Add Node
    </button>
    <button onClick={runFlow} disabled={running} style={{ position: 'absolute', zIndex: 50, margin: 10, left: 120 }}>
      {running ? '⏳ Running...' : '▶ Run Flow'}
    </button>

     <div style={{ position: 'absolute', top: 60, left: 10, zIndex: 50, background: 'white', padding: 10, border: '1px solid #ccc', borderRadius: 6, maxWidth: 300, maxHeight: 400, overflowY: 'auto' }}>
      <strong>Execution Log</strong>
      {logs.map((log, i) => (
        <div key={i} style={{ marginTop: 8, fontSize: 12 }}>
          <div><b>Node {log.nodeId}:</b> {log.prompt}</div>
          <div style={{ color: log.decision === 'YES' ? 'green' : 'red' }}>→ {log.decision}</div>
        </div>
      ))}
    </div>

      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}