import type { Node } from "reactflow";

import { useCallback, memo } from "react";
import { Handle, Position, useNodeId, useNodes } from "reactflow";

import useFlow from "@/service/useFlow";
import { BRANCH_NODE_TYPE } from "@/constant/flow";

import "@/assets/style/react-flow.css";

function BranchNode() {
  const flow = useFlow();
  const nodes: Node[] = useNodes();
  const nodeId: string | null = useNodeId();

  const handleClickNode = useCallback(() => {
    if (nodeId) {
      const targetNodes: Node[] =
        flow.cloneNodes && flow.cloneNodes.length > 0 ? flow.cloneNodes : nodes;

      flow.setCurrentNode(
        targetNodes
          .filter((node: Node) => node.id === nodeId)
          .map((node: Node) => {
            node.data = {
              ...node.data,
              target: BRANCH_NODE_TYPE,
            };
            return node;
          })[0]
      );
    }
  }, [flow, nodeId, nodes]);

  return (
    <div className="relative h-[60px] z-0">
      <div className="rhombus absolute h-[60px] z-1">
        <label
          htmlFor="my-drawer-4"
          className="drawer-button btn btn-primary btn-xs z-[2] absolute -top-2.5 left-4"
          onClick={() => handleClickNode()}
        >
          Open
        </label>
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
