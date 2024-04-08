import type { NodeProps, Node } from "reactflow";

import { useCallback, memo } from "react";
import { Handle, Position, NodeResizer, useNodeId, useNodes } from "reactflow";

import useFlow from "@/service/useFlow";

function TextNode({ data }: any) {
  const flow = useFlow();
  const nodes: Node[] = useNodes();
  const nodeId: string | null = useNodeId();

  const handleClickNode = useCallback(() => {
    if (nodeId) {
      flow.setCurrentNode(nodes.filter((node) => node.id === nodeId)[0]);
    }
  }, [flow, nodeId, nodes]);

  return (
    <>
      <NodeResizer isVisible={true} minWidth={100} minHeight={45} />
      <div
        className="px-4 py-2 shadow-md rounded-md bg-base-100 border-1 border-base-content w-full h-full text-xs"
        // onClick={handleOpen}
      >
        <div className="flex w-full h-full">
          {/* <div className="rounded-full w-12 h-12 flex justify-center items-center bg-base-200">
            {data.emoji}
          </div> */}
          {/* <div className="ml-2">
            <div className="text-lg font-bold">{data.dag_name}</div>
            <div className="text-gray-500">{data.description}</div>
          </div> */}
          <div className="text-lg font-bold">{nodeId}</div>
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500">{data.description}</div>
          <label
            htmlFor="my-drawer-4"
            className="drawer-button btn btn-primary btn-xs"
            onClick={handleClickNode}
          >
            Open
          </label>
        </div>

        <Handle
          type="target"
          position={Position.Top}
          className="w-4 !bg-teal-500"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-4 !bg-teal-500"
        />
      </div>
      {/* <GsapModal background="bg-secondary" open={open} onClose={handleClose}>
        <MonacoEditor />
      </GsapModal> */}
    </>
  );
}

export default memo(TextNode);
