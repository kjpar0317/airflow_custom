"use client";

import type { IColDef, TData, TSizeColumn } from "@/type/aggrid";

import { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import FlowGridDetail from "@/components/features/flows/FlowGridDetail";

export default function DagTask() {
  const [rowData, setRowData] = useState<IAirflowDag[]>();
  const [gridRow, setGridRow] = useState<IAirflowDag>();
  const [open, setOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<string>("EDIT");
  const container = useRef(null);
  const columnDefs = useMemo(
    () => [
      { headerName: "DAG ID", field: "dag_id" },
      { headerName: "DAG 명", field: "dag_name" },
      { headerName: "생성자", field: "creator" },
      { headerName: "생성일", field: "create_dt", sort: "desc" },
    ],
    []
  ) as IColDef[];
  const autoSizeStrategy = useMemo(
    () => ({
      type: "fitGridWidth",
      defaultMinWidth: 100,
    }),
    []
  ) as TSizeColumn;

  gsap.registerPlugin(useGSAP);

  useEffect(() => {
    getAirflowDag();
  }, []);

  useGSAP(
    () => {
      let timeline = gsap.timeline({});

      timeline.fromTo(
        container.current,
        { scale: 0.5, opacity: 0 },
        {
          ease: "power3.inOut",
          duration: 0.8,
          scale: 1,
          stagger: 0.2,
          opacity: 1,
        }
      );
    },
    { scope: container }
  );

  async function getAirflowDag() {
    const data = await fetch(`/api/flows/dag`);
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
    redraw && getAirflowDag();
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
        <div ref={container} className="ag-theme-alpine w-full h-[650px]">
          <AgGridReact
            pagination
            paginationAutoPageSize
            rowData={rowData}
            headerHeight={38}
            rowHeight={38}
            columnDefs={columnDefs}
            autoSizeStrategy={autoSizeStrategy}
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
