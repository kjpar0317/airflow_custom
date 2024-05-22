import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import connection from "@/util/dbconn_util";

export const PUT = async (
  req: NextRequest,
  { params }: { params: IAirflowDag }
) => {
  try {
    const body: IAirflowDag = await req.json();

    if (!params.dag_id) return;

    // MARIADB
    const query = `UPDATE workflow_dag
        SET
          dag_name = '${body.dag_name}',
          dag_nodes = '${JSON.stringify(body.dag_nodes ?? "", null)}',
          dag_edges = '${JSON.stringify(body.dag_edges ?? "", null)}',
          updater = 'admin',
          update_dt = current_timestamp()
        WHERE dag_id = '${params.dag_id}'
        `;

    // console.log(query);

    const result = await connection.query(query);
    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error);
    return NextResponse.error();
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: IAirflowDag }
) => {
  try {
    const pipelineQuery = `DELETE FROM workflow_pipeline WHERE dag_id = '${params.dag_id}'`;
    await connection.query(pipelineQuery);

    const taskQuery = `DELETE FROM workflow_task WHERE dag_id = '${params.dag_id}'`;
    await connection.query(taskQuery);

    const dagQuery = `DELETE FROM workflow_dag WHERE dag_id = '${params.dag_id}'`;
    await connection.query(dagQuery);
    return NextResponse.json({});
  } catch (error: any) {
    console.log(error);
    return NextResponse.error();
  }
};
