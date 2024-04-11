"use client";

import type { IColDef, TData } from "@/type/aggrid";

import { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";

import FlowGridDetail from "@/components/features/flows/FlowGridDetail";

export default function DagTask() {
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
    <div className="w-11/12 h-full content-center">
      <div className="flex justify-end w-full mb-2">
        <button className="btn btn-primary btn-sm" onClick={handleOpen}>
          추가
        </button>
      </div>
      <div className="drawer drawer-end contents w-full">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="ag-theme-alpine w-full h-[650px]">
          <AgGridReact
            pagination
            paginationAutoPageSize
            rowData={rowData}
            headerHeight={38}
            rowHeight={38}
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
    </div>
  );
}
