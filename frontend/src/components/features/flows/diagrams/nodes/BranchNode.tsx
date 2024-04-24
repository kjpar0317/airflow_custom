import type { Node } from "reactflow";

import { useCallback, memo } from "react";
import {
  Handle,
  Position,
  useNodeId,
  useNodes,
  useNodesState,
} from "reactflow";

import useFlow from "@/service/useFlow";
import { BRANCH_NODE_TYPE } from "@/constant/flow";

import "@/assets/style/react-flow.css";

function BranchNode() {
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
            node.type = BRANCH_NODE_TYPE;
            return node;
          })
      );
    }
  }, [nodeId, setEditedNodeId, setNodes]);

  return (
    <div className="relative h-[60px] z-0 border-0">
      <div className="rhombus absolute h-[60px] z-1">
        {/* <label
          htmlFor="my-drawer-4"
          className="drawer-button btn btn-primary btn-xs z-[2] absolute -top-2.5 left-4"
          onClick={() => handleClickNode()}
        >
          Open
        </label> */}
        <button
          className="btn btn-primary btn-xs absolute -top-2.5 left-4 z-[3]"
          onClick={handleEditorOpen}
        >
          Open
        </button>
      </div>
      <div className="w-[80px] h-[60px] z-2">
        <Handle type="target" position={Position.Top} id="top" />
        <Handle type="source" position={Position.Right} id="right" />
        <Handle type="source" position={Position.Bottom} id="bottom" />
      </div>
    </div>
  );
}

export default memo(BranchNode);
