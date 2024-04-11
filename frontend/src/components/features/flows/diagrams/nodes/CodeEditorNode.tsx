import type { NodeProps, Node } from "reactflow";

import { useCallback, memo } from "react";
import { Handle, Position, NodeResizer, useNodeId, useNodes } from "reactflow";

import useFlow from "@/service/useFlow";
// import GsapModal from "@/components/modal/GsapModal";
// import { MonacoEditor } from "@/components/editor/MonacoEditor";
import FlowInputField from "../input/FlowInputField";

function CodeEditorNode({ data }: NodeProps) {
  const flow = useFlow();
  const nodes: Node[] = useNodes();
  const nodeId: string | null = useNodeId();

  const handleClickNode = useCallback(() => {
    if (nodeId) {
      const targetNodes: Node[] =
        flow.cloneNodes && flow.cloneNodes.length > 0 ? flow.cloneNodes : nodes;

      const convNodes = targetNodes
        .filter((node: Node) => node.id === nodeId)
        .map((node: Node) => {
          node.type = "reset";
          node.data = {
            ...node.data,
            target: "codeEditor",
          };
          return node;
        })[0];
      flow.setCurrentNode(convNodes);
    }
  }, [flow, nodeId, nodes]);

  return (
    <>
      <NodeResizer isVisible={true} minWidth={100} minHeight={45} />
      <div
        className="px-4 py-2 shadow-md rounded-md bg-base-200 border-1 border-base-content w-full h-full"
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
          <div className="text-lg font-bold w-full pr-3">
            {/* <input
              type="text"
              className="w-[180px]"
              defaultValue={data.label}
            /> */}
            <FlowInputField label={data.label} />
          </div>
          <label
            htmlFor="my-drawer-4"
            className="drawer-button btn btn-primary btn-xs"
            onClick={handleClickNode}
          >
            Open2
          </label>
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
      {/* <GsapModal background="bg-secondary" open={open} onClose={handleClose}>
        <MonacoEditor />
      </GsapModal> */}
    </>
  );
}

export default memo(CodeEditorNode);
