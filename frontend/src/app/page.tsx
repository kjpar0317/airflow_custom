"use client";

import type { IColDef, TData } from "@/type/aggrid";

import { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ReactFlowProvider } from "reactflow";
import { ToastContainer } from "react-toastify";

import FlowGridDetail from "@/components/features/flows/FlowGridDetail";

// json stringfy 시 bigint 문제
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default function Home() {
  const [rowData, setRowData] = useState<ICmpDag[]>();
  const [gridRow, setGridRow] = useState<ICmpDag>();
  const [open, setOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<string>("EDIT");
  const columnDefs = useMemo(
    () => [
      { headerName: "DAG ID", field: "dag_id" },
      { headerName: "DAG 명", field: "dag_name" },
      { headerName: "파일위치", field: "fileloc" },
      { headerName: "생성일", field: "create_dt", sort: "desc" },
    ],
    []
  ) as IColDef[];

  useEffect(() => {
    getCmpDag();
  }, []);

  async function getCmpDag() {
    const data = await fetch(`/api/flows`);
    const response = await data.json();
    setRowData(response);
  }

  function handleGridClick(grid: TData) {
    setGridRow(grid.data);
    setMode("EDIT");
    setOpen(true);
  }

  function handleOpen() {
    setGridRow(undefined);
    setMode("ADD");
    setOpen(true);
  }
  function handleClose(redraw: boolean) {
    redraw && getCmpDag();
    setOpen(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 w-full">
      <ReactFlowProvider>
        <div className="flex justify-end w-full">
          <button className="btn btn-primary btn-sm" onClick={handleOpen}>
            추가
          </button>
        </div>
        <div className="drawer drawer-end contents">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
          <div className="ag-theme-alpine w-full h-[650px]">
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              className="w-full h-full"
              onRowClicked={handleGridClick}
            ></AgGridReact>
          </div>
          <FlowGridDetail
            key={`${open}`}
            open={open}
            mode={mode}
            row={gridRow}
            onClose={handleClose}
          />
        </div>
      </ReactFlowProvider>
      <ToastContainer position="bottom-right" autoClose={2000} closeOnClick />
    </main>
  );
}
