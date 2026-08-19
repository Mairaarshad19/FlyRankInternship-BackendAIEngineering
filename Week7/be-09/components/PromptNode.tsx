import { Handle, Position } from 'reactflow';

export default function PromptNode({ data, id }: any) {
  return (
    <div
      style={{
        padding: 10,
        border: '1px solid #ccc',
        borderRadius: 6,
        background: 'white',
        minWidth: 200,
      }}
    >
      <textarea
        value={data.label}
        onChange={(e) => data.onChange(id, e.target.value)}
        style={{
          width: '100%',
          border: 'none',
          resize: 'none',
          outline: 'none',
        }}
      />

      <Handle type="target" position={Position.Top} />

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{
          left: '30%',
          background: 'green',
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{
          left: '70%',
          background: 'red',
        }}
      />
    </div>
  );
}