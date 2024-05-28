import type { Node, Edge } from "reactflow";

import {
  DIVID_PIPELINE,
  DIVID_FLOW_ARRAY,
  DIVID_FLOW_IN_ARRAY,
  WRONG_DIVID_FLOW_ARRAY,
} from "@/constant/flow";

export class FlowUtil {
  nodes: Node[];
  edges: Edge[];

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * edge 순서 정한것을 노드의 id -> name
   *
   * @returns
   */
  convertNodePipeline() {
    const pipelines: string[] = this.convertPipeline();

    return pipelines.map((pipeline: string) => {
      let conv_pipeline: string = "";
      const sep_pipelines: string[] = pipeline.split(DIVID_PIPELINE);

      conv_pipeline += sep_pipelines
        .map((sep_pipeline: string) => {
          if (sep_pipeline.startsWith("[")) {
            const s_s_pipelines = sep_pipeline
              .replace("[", "")
              .replace("]", "")
              .split(DIVID_FLOW_IN_ARRAY);
            return (
              "[" +
              s_s_pipelines
                .map(
                  (s_s_pipeline: string) =>
                    this.nodes.find((node: Node) => node.id === s_s_pipeline)
                      ?.data.label
                )
                .join(DIVID_FLOW_ARRAY) +
              "]"
            );
          } else {
            return this.nodes.find((node: Node) => node.id === sep_pipeline)
              ?.data.label;
          }
        })
        .join(DIVID_PIPELINE);

      return conv_pipeline;
    });
  }

  /**
   * edge 순서 정하기
   *
   * @returns
   */
  convertPipeline() {
    const start_edges: Edge[] = this.edges.filter(
      (edge: Edge) => edge.source === "start"
    );
    const target_edges: Edge[] = this.edges
      .filter((edge: Edge) => edge.source !== "start")
      .filter((edge: Edge) => edge.target !== "end");

    // console.log("조립");
    // console.log(target_edges);

    let pipelines: string[] = start_edges.map((edge: Edge) => {
      return edge.target + this.recursivePipeline("", edge, target_edges);
    });

    // console.log("파이프라인");
    // console.log(pipelines);

    // console.log("조합");

    for (let i = 0; i < pipelines.length; i++) {
      let pipeline: string = pipelines[i];

      if (pipeline.includes(DIVID_FLOW_ARRAY)) {
        pipeline = pipeline.replace(WRONG_DIVID_FLOW_ARRAY, DIVID_FLOW_ARRAY);
        const split_parallels: string[] = pipeline.split(DIVID_FLOW_ARRAY);

        split_parallels.forEach((parallel: string, index: number) => {
          if (index === 0) {
            pipelines[i] = split_parallels[0];
          } else if (parallel.trim()) {
            pipelines.push(parallel.trim());
          }
        });
      }
    }

    return pipelines;
  }

  /**
   *  재귀 파이프 라인
   *
   * @param current_pipeline
   * @param source_edge
   * @param target_edges
   * @returns
   */
  private recursivePipeline(
    current_pipeline: string,
    source_edge: Edge,
    target_edges: any
  ): string | null | undefined {
    const next_edges: Edge[] = target_edges.filter(
      (edge: Edge) => edge.source === source_edge?.target
    );
    if (next_edges.length === 1) {
      const new_pipeline: string =
        current_pipeline + DIVID_PIPELINE + next_edges[0].target;
      return this.recursivePipeline(new_pipeline, next_edges[0], target_edges);
    } else if (next_edges.length > 1) {
      const target_nodes: Node | undefined = this.nodes.find(
        (node: Node) => node.id === source_edge.target
      );

      // 으아 어렵다
      if (target_nodes?.type === "branch") {
        let branch_pipeline: string = current_pipeline + DIVID_PIPELINE;

        branch_pipeline +=
          "[" +
          next_edges
            .map((next_edge) => next_edge.target)
            .join(DIVID_FLOW_IN_ARRAY) +
          "]";

        return (
          branch_pipeline +
          DIVID_FLOW_ARRAY +
          next_edges
            .map((edge: Edge) => {
              const next_target_edge: Edge = target_edges.find(
                (edge: Edge) => edge.target === target_edges.target
              );

              return this.recursivePipeline(
                edge.target,
                next_target_edge,
                target_edges
              );
            })
            .join(DIVID_FLOW_ARRAY)
        );
      } else {
        let new_pipeline: string | null | undefined = "";

        next_edges.forEach((edge: Edge, index: number) => {
          if (index === 0) {
            const _pipeline: string =
              current_pipeline + DIVID_PIPELINE + edge.target;
            new_pipeline +=
              this.recursivePipeline(_pipeline, edge, target_edges) ?? "";
          } else {
            const _pipeline: string =
              DIVID_FLOW_ARRAY + edge.source + DIVID_PIPELINE + edge.target;
            new_pipeline +=
              this.recursivePipeline(_pipeline, edge, target_edges) ?? "";
          }
        });

        return new_pipeline;
      }
    }

    const sep_current_pipeline: string[] =
      current_pipeline.split(DIVID_PIPELINE);

    if (sep_current_pipeline.length === 1) {
      const remain_target: Edge = target_edges.find(
        (edge: Edge) => edge.source === sep_current_pipeline[0]
      );

      if (remain_target) {
        const next_edge: Edge = target_edges.find(
          (edge: Edge) => edge.target === remain_target.source
        );
        return this.recursivePipeline(
          sep_current_pipeline[0],
          next_edge,
          target_edges
        );
      } else {
        // [] 다음 프로세스가 없는 경우 생략
        return "";
      }
    }

    return current_pipeline;
  }
}
