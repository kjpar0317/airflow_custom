import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import connection from "@/util/dbconn_util";

export const POST = async (req: NextRequest) => {
  try {
    const params: IAirflowTask[] = await req.json();

    if (params && params.length > 0) {
      const prevTasksDeleteQuery = `DELETE FROM workflow_task WHERE dag_id = '${params[0].dag_id}'`;
      await connection.query(prevTasksDeleteQuery);

      params.forEach(async (task: IAirflowTask) => {
        let query = `INSERT INTO workflow_task (dag_id, task_id, task_type, code, creator) VALUES ('${
          task.dag_id
        }', '${task.task_id}', '${task.task_type}', '${task.code?.replaceAll(
          "'",
          '"'
        )}', 'admin')`;

        // MARIADB
        await connection.query(query);
      });
    }

    return NextResponse.json("OK");
  } catch (error: any) {
    console.log(error);
    return NextResponse.error();
  }
};
