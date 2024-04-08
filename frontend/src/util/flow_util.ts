import type { Edge } from "reactflow";

export function convertFlowToAirflowPipeline(edges: Edge[]) {
  const start_edges = edges.filter((edge) => edge.source === "start");
  const target_edges = edges
    .filter((edge) => edge.source !== "start")
    .filter((edge) => edge.target !== "end");

  console.log("조립");
  // console.log(start_edges);
  console.log(target_edges);

  let pipelines: Array<string> = start_edges.map((edge) => {
    return edge.target + recursivePipeline("", edge, target_edges);
  });

  // console.log("파이프라인");
  // console.log(pipelines);

  // console.log("조합");

  for (let i = 0; i < pipelines.length; i++) {
    let pipeline = pipelines[i];

    if (pipeline.includes(", >>")) {
      const split_parallels = pipeline.split(", >>");
      const inner_pipelines = pipeline.split(" >> ");

      if (split_parallels.length > 0) {
        split_parallels.forEach((parallel, index) => {
          if (index === 0) {
            pipelines[i] = split_parallels[0];
          } else {
            pipelines.push(inner_pipelines[0] + " >> " + parallel.trim());
          }
        });
      }
    }
  }

  console.log(pipelines);
  return pipelines;
}

function recursivePipeline(
  pipeline: string,
  source_edge: Edge,
  target_edges: Edge[]
): string {
  const next_edges = target_edges.filter(
    (edge) => edge.source === source_edge.target
  );

  if (next_edges.length === 1) {
    const new_pipeline: string = pipeline + " >> " + next_edges[0].target;
    return recursivePipeline(new_pipeline, next_edges[0], target_edges);
  } else if (next_edges.length > 1) {
    return next_edges
      .map((edge) => {
        const new_pipeline: string = pipeline + " >> " + edge.target;
        return recursivePipeline(new_pipeline, edge, target_edges);
      })
      .join(",");
  }
  return pipeline;
}
