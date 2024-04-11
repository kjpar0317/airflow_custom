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
  host: "192.168.130.215",
  user: "tabcloudit",
  password: "tabcloudit",
  database: "tabcloudit",
});

export default connection;
