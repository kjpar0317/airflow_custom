import type { NodeProps, Node } from "reactflow";

import { useCallback, memo } from "react";
import {
  Handle,
  Position,
  useNodeId,
  useNodes,
  useNodesState,
} from "reactflow";

import useFlow from "@/service/useFlow";
import FlowInputField from "../input/FlowInputField";

function CmpOperatorNode({ data }: NodeProps) {
  const { setEditedNodeId } = useFlow();
  const currentNodes: Node[] = useNodes();
  const nodeId: string | null = useNodeId();
  const [, setNodes] = useNodesState(currentNodes);

  const handleEditorOpen = useCallback(() => {
    if (nodeId) {
      setEditedNodeId(nodeId);
      setNodes((nds: Node[]) =>
        nds
          .filter((node: Node) => node.id === nodeId)
          .map((node: Node) => {
            node.type = "cmp";
            return node;
          })
      );
    }
  }, [nodeId, setEditedNodeId, setNodes]);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-base-200 border-1 border-base-content w-full h-full">
      <div className="flex w-full h-full">
        <div className="text-lg font-bold w-full pr-3">
          <FlowInputField label={data.label} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleEditorOpen}>
          Open
        </button>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 !bg-teal-500"
      />
    </div>
  );
}

export default memo(CmpOperatorNode);
