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
  user: "coininfos",
  password: "kocodebank",
  database: "coininfos",
});

export default connection;
