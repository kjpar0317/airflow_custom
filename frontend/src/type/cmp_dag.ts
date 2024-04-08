interface ICmpDag {
  dag_id: string;
  dag_name?: string;
  dag_nodes?: any;
  dag_edges?: any;
  fileloc?: string;
  description?: string;
  creator?: string;
  updater?: string;
}

interface BigInt {
  /** Convert to BigInt to string form in JSON.stringify */
  toJSON: () => string;
}
BigInt.prototype.toJSON = function () {
  return this.toString();
};
