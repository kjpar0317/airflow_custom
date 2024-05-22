// import { Pool } from "pg";
import mariadb from "mariadb";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// const connection: Pool = new Pool({
//   host: "localhost",
//   database: "airflow",
//   user: "airflow",
//   password: "airflow",
//   port: 5432,
// });

const connection = mariadb.createPool({
  host: "127.0.0.1",
  user: "coininfos",
  password: "kocodebank",
  database: "coininfos",
});

export default connection;
