import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import connection from "@/util/dbconn_util";

export const POST = async (req: NextRequest) => {
  try {
    const params: IAirflowTask = await req.json();

    const selectQuery = `SELECT dag_id FROM airflow_task where dag_id = '${params.dag_id}' and task_id = '${params.task_id}'`;
    const selectResult = await connection.query(selectQuery);

    let query = `INSERT INTO airflow_task (dag_id, task_id, task_type, code, creator) VALUES ('${
      params.dag_id
    }', '${params.task_id}', '${params.task_type}', '${params.code?.replaceAll(
      "'",
      '"'
    )}', 'admin')`;

    if (selectResult && selectResult.length > 0) {
      query = `UPDATE airflow_task
        SET
          task_type = '${params.task_type}',
          code = '${params.code?.replaceAll("'", '"')}',
          updater = 'admin',
          update_dt = current_timestamp()
        WHERE dag_id = '${params.dag_id}'
        and task_id = '${params.task_id}'
        `;
    }

    console.log(query);

    // MARIADB
    const result = await connection.query(query);

    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error);
  }
};
