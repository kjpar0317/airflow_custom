import type { Node, Edge } from "reactflow";

import { useCallback } from "react";
import useSWR from "swr";

import { FlowUtil } from "@/util/flow_util";

let _currentNode: Node;
let _cloneNodes: Node[];

export default function useFlow() {
  const { data: currentNode, mutate: currentNodeMutate } = useSWR<Node>(
    "currentNode",
    () => _currentNode
  );
  const { data: cloneNodes, mutate: cloneNodesMutate } = useSWR<Node[]>(
    "cloneNodes",
    () => _cloneNodes
  );

  const setCurrentNode = useCallback(
    (currentNode: Node) => {
      _currentNode = currentNode;
      return currentNodeMutate();
    },
    [currentNodeMutate]
  );

  const setCloneNodes = useCallback(
    (currentNodes: Node[]) => {
      _cloneNodes = currentNodes;
      return cloneNodesMutate();
    },
    [cloneNodesMutate]
  );

  const getChildNodes = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (!currentNode || !nodes || !edges) return;

      const currentChildEdges: Edge[] = edges.filter(
        (edge: Edge) => edge.source === currentNode.id
      );

      return nodes
        .filter(
          (node: Node) =>
            currentChildEdges.filter((edge: Edge) => node.id === edge.target)[0]
        )
        .map((node: Node) => {
          const target = currentChildEdges.filter(
            (edge: Edge) => node.id === edge.target
          )[0];

          if (target?.sourceHandle) {
            node.data.type = target.sourceHandle;
          }

          return node;
        });
    },
    [currentNode]
  );

  const convertFlowToAirflowPipeline = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (!nodes || !edges) return;

      let flow = new FlowUtil(nodes, edges);

      return flow.convertNodePipeline();
    },
    []
  );

  return {
    currentNode,
    cloneNodes,
    setCurrentNode,
    setCloneNodes,
    getChildNodes,
    convertFlowToAirflowPipeline,
  };
}
