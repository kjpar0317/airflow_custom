import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import connection from "@/util/dbconn_util";

export const GET = async (
  req: NextRequest,
  { params }: { params: IAirflowPipeline }
) => {
  try {
    const query = `SELECT dag_id, order, pipeline, creator FROM airflow_pipeline WHERE dag_id = ${params.dag_id}`;

    const result = await connection.query(query);

    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error);
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: IAirflowPipeline }
) => {
  try {
    if (!params.dag_id) return;

    const body: string[] = await req.json();

    const deleteQuery = `DELETE FROM airflow_pipeline WHERE dag_id = '${params.dag_id}'`;

    await connection.query(deleteQuery);

    body.forEach(async (pipeline: string, index: number) => {
      const query = `INSERT INTO airflow_pipeline (dag_id, pipeline_order, pipeline, creator) VALUES ('${
        params.dag_id
      }', ${index + 1}, '${pipeline}', 'admin')`;
      await connection.query(query);
    });

    return NextResponse.json("OK");
  } catch (error: any) {
    console.log(error);
  }
};
