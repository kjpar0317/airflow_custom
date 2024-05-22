import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import connection from "@/util/dbconn_util";

export const GET = async (req: NextRequest, { params }: { params: any }) => {
  try {
    // ...params 남겨 두자... 테스트니까.
    // const query = `SELECT dag_id, task_id, task_type, code FROM workflow_task where dag_id = '${params.params[0]}' and task_id = '${params.params[1]}'`;
    const query = `SELECT dag_id, task_id, task_type, code FROM workflow_task where dag_id = '${params.params[0]}'`;
    const result = await connection.query(query);

    // console.log(query);

    if (result && result.length > 0) {
      // return NextResponse.json(result[0]);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(null);
    }
  } catch (error: any) {
    console.log(error);
    return NextResponse.error();
  }
};
