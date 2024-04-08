// import { Pool } from "pg";
import mariadb from "mariadb";

// const connection: Pool = new Pool({
//   host: "localhost",
//   database: "airflow",
//   user: "airflow",
//   password: "airflow",
//   port: 5432,
// });

const connection = mariadb.createPool({
  host: "localhost",
  user: "airflow",
  password: "airflow",
  database: "airflow",
});

export default connection;
