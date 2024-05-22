"use client";

import type { IColDef, TSizeColumn } from "@/type/aggrid";

import { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import useAirflow from "@/service/useAirflow";
import DagImportError from "./airflow/DagImportError";

export default function DagList() {
  const { dagList } = useAirflow();
  const [rowData, setRowData] = useState<IAirflowDag[]>();
  const container = useRef(null);
  const columnDefs = useMemo(
    () => [
      { headerName: "DAG ID", field: "dag_id" },
      { headerName: "파일위치", field: "fileloc", width: 350 },
      {
        headerName: "실행시간",
        field: "last_parsed_time",
        width: 270,
        sort: "desc",
      },
      { headerName: "다음DAG", field: "next_dagrun" },
      { headerName: "DAG 에러", field: "has_import_errors", width: 80 },
      { headerName: "활성화", field: "is_active", width: 80 },
      { headerName: "정지", field: "is_paused", width: 80 },
      {
        headerName: "타임테이블",
        field: "timetable_description",
      },
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

  // gsap.registerPlugin(useGSAP);

  useEffect(() => {
    dagList && setRowData(dagList.dags);
  }, [dagList]);

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

  return (
    <div className="w-11/12 h-full content-center">
      <div className="flex justify-end w-full mb-2">
        <DagImportError />
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
          ></AgGridReact>
        </div>
      </div>
    </div>
  );
}
