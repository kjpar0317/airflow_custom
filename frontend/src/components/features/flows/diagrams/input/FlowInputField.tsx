"use client";

import type { ReactElement, ChangeEvent } from "react";
import type { Node } from "reactflow";

import { useState, useCallback } from "react";
import { useNodes, useNodeId } from "reactflow";

import useFlow from "@/service/useFlow";

interface IFlowInputField {
  // key: React.Key;
  label: string;
}

export default function FlowInputField({
  label,
}: Readonly<IFlowInputField>): ReactElement {
  const flow = useFlow();
  const [value, setValue] = useState(label);
  const nodes: Node[] = useNodes();
  const nodeId: string | null = useNodeId();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget) {
        const targetNodes =
          flow.cloneNodes && flow.cloneNodes.length > 0
            ? flow.cloneNodes
            : nodes;
        const targetValue = e.currentTarget.value;
        setValue(targetValue);
        flow.setCloneNodes(
          targetNodes.map((node: Node) => {
            if (node.id === nodeId) {
              // it's important that you create a new object here
              // in order to notify react flow about the change
              node.data = {
                ...node.data,
                label: targetValue,
              };
            }

            return node;
          }) ?? []
        );
      }
    },
    [flow, nodeId, nodes]
  );

  return (
    <input
      type="text"
      className="w-[180px] input input-sm"
      value={value}
      // defaultValue={label}
      onChange={handleChange}
    />
  );
}
