import type { DragEvent, ReactElement } from "react";

import { useCallback } from "react";

import { cn } from "@/util/comm_util";

interface IFlowSideber {
  className?: string;
}

export default function FlowSidebar({
  className,
}: Readonly<IFlowSideber>): ReactElement {
  const onDragStart = useCallback((event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  return (
    <aside className={cn(className, "flex pt-3")}>
      <ul>
        <li
          className="dndnode input text-xs md:text-sm"
          onDragStart={(event: DragEvent) => onDragStart(event, "cmp")}
          draggable
        >
          Cmp Operator
        </li>
        <li
          className="dndnode input text-xs md:text-sm"
          onDragStart={(event: DragEvent) => onDragStart(event, "codeEditor")}
          draggable
        >
          SQL Operator
        </li>
        <li
          className="dndnode input text-xs md:text-sm"
          onDragStart={(event: DragEvent) => onDragStart(event, "codeEditor")}
          draggable
        >
          Http Operator
        </li>
        <li
          className="dndnode input text-xs md:text-sm"
          onDragStart={(event: DragEvent) => onDragStart(event, "branch")}
          draggable
        >
          Branch Operator
        </li>
      </ul>
    </aside>
  );
}
