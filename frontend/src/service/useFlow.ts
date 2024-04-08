import type { Node } from "reactflow";

import { useCallback } from "react";
import useSWR from "swr";

let _currentNode: Node;

export default function useFlow() {
  const { data: currentNode, mutate: currentNodeMutate } = useSWR<Node>(
    "currentNode",
    () => _currentNode
  );

  const setCurrentNode = useCallback(
    (currentNode: Node) => {
      _currentNode = currentNode;
      return currentNodeMutate();
    },
    [currentNodeMutate]
  );

  return {
    currentNode,
    setCurrentNode,
  };
}
