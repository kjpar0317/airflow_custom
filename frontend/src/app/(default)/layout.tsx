"use client";

import type { ReactElement, ReactNode } from "react";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactFlowProvider } from "reactflow";
import { ToastContainer } from "react-toastify";

import useLayout from "@/service/useLayout";
import Header from "@/components/layouts/common/Header";
import TransitionPage from "@/components/layouts/transition/TransitionPage";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "reactflow/dist/style.css";
import "react-toastify/dist/ReactToastify.css";

import "@/app/globals.css";
import "@/assets/style/aggrid.css";

interface IRootProps {
  children: ReactNode;
}

export default function DefaultLayout({
  children,
}: Readonly<IRootProps>): ReactElement {
  const layout = useLayout();
  const pathname = usePathname();

  useEffect(() => {
    layout.doAnimatePageIn("#transition-element");
  }, [layout, pathname]);

  return (
    <div data-theme={layout.theme} className="w-full h-full bg-base-200">
      <Header />
      <main className="flex flex-col justify-between items-center w-full h-[calc(100vh_-_63px)]">
        <ReactFlowProvider>{children}</ReactFlowProvider>
      </main>
      <ToastContainer />
      <TransitionPage />
    </div>
  );
}
