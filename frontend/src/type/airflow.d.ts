interface IAirflowDag {
  dag_id: string;
  dag_name?: string;
  dag_nodes?: any;
  dag_edges?: any;
  creator?: string;
  updater?: string;
}

interface IAirflowTask {
  dag_id: string;
  task_id: string;
  task_type: string;
  code?: string;
  creator?: string;
  updater?: string;
}

interface IAirflowPipeline {
  dag_id: string;
  order: number;
  pipeline?: string;
  creator?: string;
}
