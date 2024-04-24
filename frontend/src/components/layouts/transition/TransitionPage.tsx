"use client";

import { useEffect } from "react";

import useLayout from "@/service/useLayout";

export default function TransitionPage() {
  const { doAnimatePageIn } = useLayout();

  useEffect(() => {
    doAnimatePageIn("#transition-element");
  }, [doAnimatePageIn]);

  return (
    <div
      id="transition-element"
      className="w-screen h-screen bg-primary/60 to-white fixed top-0 left-0"
    ></div>
  );
}
