import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import connection from "@/util/dbconn_util";

export const PUT = async (
  req: NextRequest,
  { params }: { params: ICmpDag }
) => {
  try {
    const body = await req.json();

    // POSTGRES
    // const query = `UPDATE cmp_dag
    //     SET
    //       dag_name = '${body.dag_name}',
    //       dag_nodes = to_json(json '${JSON.stringify(
    //         body.dag_nodes ?? "",
    //         null
    //       )}'),
    //       dag_edges = to_json(json '${JSON.stringify(
    //         body.dag_edges ?? "",
    //         null
    //       )}')
    //     WHERE dag_id = '${params.dag_id}'
    //     `;

    // MARIADB
    const query = `UPDATE cmp_dag
        SET
          dag_name = '${body.dag_name}',
          dag_nodes = '${JSON.stringify(body.dag_nodes ?? "", null)}',
          dag_edges = '${JSON.stringify(body.dag_edges ?? "", null)}'
        WHERE dag_id = '${params.dag_id}'
        `;

    console.log(query);

    const result = await connection.query(query);
    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error);
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: ICmpDag }
) => {
  try {
    const query = `DELETE FROM cmp_dag WHERE dag_id = '${params.dag_id}'`;

    // console.log(query);
    const result = await connection.query(query);
    return NextResponse.json({});
  } catch (error: any) {
    console.log(error);
  }
};
