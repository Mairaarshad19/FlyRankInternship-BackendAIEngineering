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

   const runFlow = async () => {
    await fetch('/api/inngest', { method: 'PUT' });
    const res = await fetch('http://localhost:8288/e/local', {
      method: 'POST',
      body: JSON.stringify({ name: 'flow/run', data: { nodes, edges, startNodeId: nodes[0].id } }),
    });
  };

  return (
    <div style={{ height: '100vh' }}>
      <button
        onClick={addNode}
        style={{
          position: 'absolute',
          zIndex: 50,
          margin: 10,
          padding: '8px 12px',
          pointerEvents: 'auto',
        }}
      >
        + Add Node
      </button>

     <button 
        onClick={runFlow} 
        style={{ 
          position: 'absolute', 
          zIndex: 50,        // pehle 10 tha, badha diya
          margin: 10, 
          left: 120,
          padding: '8px 12px',
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        ▶ Run Flow
      </button>

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