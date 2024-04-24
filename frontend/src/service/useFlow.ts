import type { Node, Edge } from "reactflow";

import { useCallback } from "react";
import useSWR from "swr";

import { FlowUtil } from "@/util/flow_util";

let _currentNode: Node; // Drawer에 쓰일라나.... 일단 나둬보자..
let _editedNodeId: string = "";

export default function useFlow() {
  const { data: currentNode, mutate: currentNodeMutate } = useSWR<Node>(
    "currentNode",
    () => _currentNode
  );
  const { data: editedNodeId, mutate: editedNodeIdMutate } = useSWR<string>(
    "editedNodeId",
    () => _editedNodeId
  );

  const setCurrentNode = useCallback(
    (currentNode: Node) => {
      _currentNode = currentNode;
      return currentNodeMutate();
    },
    [currentNodeMutate]
  );

  const setEditedNodeId = useCallback(
    (editedNodeId: string) => {
      _editedNodeId = editedNodeId;
      return editedNodeIdMutate();
    },
    [editedNodeIdMutate]
  );

  /**
   * drawer에 쓰일려고 했는데.. 지금은 안쓰임
   *
   */
  const getChildNodes = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (!currentNode || !nodes || !edges) return;

      const currentChildEdges: Edge[] = edges.filter(
        (edge: Edge) => edge.source === currentNode.id
      );

      return nodes
        .filter((node: Node) =>
          currentChildEdges.find((edge: Edge) => node.id === edge.target)
        )
        .map((node: Node) => {
          const target = currentChildEdges.find(
            (edge: Edge) => node.id === edge.target
          );

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
    editedNodeId,
    setCurrentNode,
    setEditedNodeId,
    getChildNodes,
    convertFlowToAirflowPipeline,
  };
}
