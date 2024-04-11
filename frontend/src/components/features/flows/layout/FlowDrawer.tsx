import type { ReactElement } from "react";
import type { Node, Edge } from "reactflow";

import { useMemo } from "react";
import { useNodes, useEdges } from "reactflow";

import useFlow from "@/service/useFlow";
import InputSimpleField from "@/components/ui/forms/fields/InputSimpleField";

export default function FlowDrawer(): ReactElement {
  const flow = useFlow();
  const nodes: Node[] = useNodes();
  const edges: Edge[] = useEdges();
  const childNodes = useMemo(
    () =>
      flow.cloneNodes && flow.cloneNodes.length > 0 ? flow.cloneNodes : nodes,
    [flow.cloneNodes, nodes]
  );

  const trueChild: Node | undefined = useMemo(
    () =>
      flow
        .getChildNodes(childNodes, edges)
        ?.filter((node: Node) => node.data.type === "bottom")[0],
    [flow, childNodes, edges]
  );
  const falseChild: Node | undefined = useMemo(
    () =>
      flow
        .getChildNodes(childNodes, edges)
        ?.filter((node: Node) => node.data.type === "right")[0],
    [flow, childNodes, edges]
  );

  return (
    <>
      {flow.currentNode?.type === "branch" && (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          <li>
            <InputSimpleField
              key={trueChild?.data.label}
              id="trueField"
              title="True"
              defaultValue={trueChild?.data.label}
              readOnly
            />
          </li>
          <li>
            <InputSimpleField
              key={falseChild?.data.label}
              id="falseField"
              title="False"
              defaultValue={falseChild?.data.label}
              readOnly
            />
          </li>
        </ul>
      )}
      {flow.currentNode?.type === "custom" && (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          <li>
            <a>{flow.currentNode?.id}</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      )}
      {flow.currentNode?.type === "codeEditor" && (
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          <li>
            <a>{flow.currentNode?.id}</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      )}
      <div className="absolute bottom-5 pr-5">
        <button className="btn btn-input btn-primary btn-sm">테스트</button>
      </div>
    </>
  );
}
