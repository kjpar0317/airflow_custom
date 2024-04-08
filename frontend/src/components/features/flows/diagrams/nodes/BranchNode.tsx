import React, { memo } from "react";
import { Handle, Position } from "reactflow";

import "@/assets/style/react-flow.css";

function BranchNode({ data }: any) {
  return (
    <div className="relative h-[60px] z-0">
      <div className="rhombus absolute h-[60px] z-1"></div>
      <div className="w-[80px] h-[60px] z-2">
        <Handle type="target" position={Position.Top} id="top" />
        <Handle type="source" position={Position.Right} id="right" />
        <Handle type="source" position={Position.Bottom} id="bottom" />
      </div>
    </div>
  );
}

export default memo(BranchNode);
