"use client";

import { useEffect } from "react";

import useLayout from "@/service/useLayout";

export default function TransitionPage() {
  const layout = useLayout();

  useEffect(() => {
    layout.doAnimatePageIn("#transition-element");
  }, [layout]);

  return (
    <div
      id="transition-element"
      className="w-screen h-screen bg-primary/60 to-white fixed top-0 left-0"
    ></div>
  );
}
