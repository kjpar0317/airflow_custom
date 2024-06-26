"use client";

import type { ReactElement, ReactNode } from "react";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactFlowProvider } from "reactflow";
import { ToastContainer } from "react-toastify";
import { SWRConfig } from "swr";

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
  const { theme, doAnimatePageIn } = useLayout();
  const pathname = usePathname();

  useEffect(() => {
    doAnimatePageIn("#transition-element");
  }, [doAnimatePageIn, pathname]);

  return (
    <div data-theme={theme} className="w-full h-full bg-base-200">
      <Header />
      <main className="flex flex-col justify-between items-center w-full h-[calc(100vh_-_63px)]">
        <SWRConfig
          value={{
            revalidateOnFocus: false,
            revalidateIfStale: false,
          }}
        >
          <ReactFlowProvider>{children}</ReactFlowProvider>
        </SWRConfig>
      </main>
      <ToastContainer />
      <TransitionPage />
    </div>
  );
}
