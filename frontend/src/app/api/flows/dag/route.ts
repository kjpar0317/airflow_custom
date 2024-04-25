import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import connection from "@/util/dbconn_util";

export const GET = async (req: NextRequest) => {
  try {
    const query =
      "SELECT dag_id, dag_name, dag_nodes, dag_edges, creator, create_dt FROM airflow_dag";

    const result = await connection.query(query);

    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error);
    return NextResponse.error();
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const params: IAirflowDag = await req.json();

    // MARIADB
    const query = `INSERT INTO airflow_dag (dag_id, dag_name, dag_nodes, dag_edges, creator) VALUES (
          '${params.dag_id}', '${params.dag_name}', '${JSON.stringify(
      params.dag_nodes ?? "",
      null
    )}', '${JSON.stringify(params.dag_edges ?? "", null)}', 'admin')`;
    // console.log(query);

    const result = await connection.query(query);
    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error);
    return NextResponse.error();
  }
};
