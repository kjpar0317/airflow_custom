import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import connection from "@/util/dbconn_util";

export const GET = async (req: NextRequest) => {
  try {
    const query =
      "SELECT dag_id, dag_name, dag_nodes, dag_edges, fileloc, description, creator, create_dt FROM cmp_dag";

    const result = await connection.query(query);
    // POSTGRES
    // return NextResponse.json(result.rows);
    // MARIADB
    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const params = await req.json();

    // POSTGRES
    // const query = `INSERT INTO cmp_dag (dag_id, dag_name, dag_nodes, dag_edges, fileloc, description, creator) VALUES (
    //     '${params.dag_id}', '${
    //   params.dag_name
    // }', to_json(json '${JSON.stringify(
    //   params.dag_nodes ?? "",
    //   null
    // )}'), to_json(json '${JSON.stringify(params.dag_edges ?? "", null)}'), '${
    //   params.fileloc
    // }', '${params.description}', 'admin'
    //     )`;

    // MARIADB
    const query = `INSERT INTO cmp_dag (dag_id, dag_name, dag_nodes, dag_edges, fileloc, description, creator) VALUES (
          '${params.dag_id}', '${params.dag_name}', '${JSON.stringify(
      params.dag_nodes ?? "",
      null
    )}', '${JSON.stringify(params.dag_edges ?? "", null)}', '${
      params.fileloc
    }', '${params.description}', 'admin'
          )`;
    // console.log(query);

    const result = await connection.query(query);
    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error);
  }
};
