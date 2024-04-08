import type { DragEvent, ReactElement } from "react";

import React from "react";
import clsx from "clsx";

interface IFlowSideber {
  className?: string;
}

export default function FlowSidebar({ className }: IFlowSideber): ReactElement {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className={clsx(className, "flex")}>
      <ul>
        <li
          className="dndnode input text-xs md:text-sm"
          onDragStart={(event: DragEvent) => onDragStart(event, "custom")}
          draggable
        >
          SQL Operator
        </li>
        <li
          className="dndnode input text-xs md:text-sm"
          onDragStart={(event: DragEvent) => onDragStart(event, "custom")}
          draggable
        >
          Http Operator
        </li>
        <li
          className="dndnode input text-xs md:text-sm"
          onDragStart={(event: DragEvent) => onDragStart(event, "custom")}
          draggable
        >
          Python Operator
        </li>
        <li
          className="dndnode input text-xs md:text-sm"
          onDragStart={(event: DragEvent) => onDragStart(event, "branch")}
          draggable
        >
          Branch
        </li>
      </ul>
    </aside>
  );
}
