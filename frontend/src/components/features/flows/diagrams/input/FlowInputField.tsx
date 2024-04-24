"use client";

import type { ReactElement, ChangeEvent } from "react";
import type { Node } from "reactflow";

import { useState, useCallback, useMemo } from "react";
import { useNodes, useNodeId, useNodesState } from "reactflow";

import useAirflow from "@/service/useAirflow";

interface IFlowInputField {
  // key: React.Key;
  label: string;
}

export default function FlowInputField({
  label,
}: Readonly<IFlowInputField>): ReactElement {
  const [value, setValue] = useState(label);
  const currentNodes: Node[] = useNodes();
  const nodeId: string | null = useNodeId();
  const [, setNodes] = useNodesState(currentNodes);
  const { setMoveTaskCodeByChangeTaskId } = useAirflow();
  const currentNode = useMemo(
    () => currentNodes.find((node: Node) => node.id === nodeId),
    [currentNodes, nodeId]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget) {
        const targetValue = e.currentTarget.value;

        setValue(targetValue);
        setMoveTaskCodeByChangeTaskId(currentNode?.data.label, targetValue);

        setNodes((nds: Node[]) =>
          nds
            .filter((node: Node) => node.id === nodeId)
            .map((node: Node) => {
              node.data.label = targetValue;
              return node;
            })
        );
      }
    },
    [currentNode?.data.label, nodeId, setMoveTaskCodeByChangeTaskId, setNodes]
  );

  return (
    <input
      type="text"
      className="w-[180px] input input-sm"
      value={value}
      // defaultValue={label}
      onChange={handleChange}
      // onBlur={handleChange}
    />
  );
}
