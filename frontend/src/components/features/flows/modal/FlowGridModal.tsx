import type {
  ReactFlowInstance,
  Edge,
  Node,
  Connection,
  XYPosition,
} from "reactflow";
import type { ReactElement, DragEvent } from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactFlow, {
  addEdge,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from "reactflow";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

import useFlow from "@/service/useFlow";
import GsapModal, { type IGsapModalOut } from "@/components/modal/GsapModal";
import {
  MonacoEditor,
  IMonacoEditorOut,
} from "@/components/editor/MonacoEditor";
import FlowSidebar from "../layout/FlowSidebar";
import CustomEdge from "../diagrams/edge/CustomEdge";
import { TextNode, BranchNode, CodeEditorNode } from "../diagrams/nodes";
import InputField from "@/components/ui/forms/fields/InputField";

import "@/assets/style/react-flow.css";

interface IFlowGridModal {
  key: React.Key;
  open: boolean;
  mode?: string;
  row?: ICmpDag;
  onClose?: (redraw: boolean) => void;
}

const schema = yup.object().shape({
  dag_id: yup.string().required("DAG ID는 필수 값 입니다."),
  dag_name: yup.string(),
});

const initialNodes: Node[] = [
  {
    id: "start",
    position: { x: 0, y: 0 },
    data: { label: "START" },
    type: "input",
    deletable: false,
  },
  {
    id: "end",
    position: { x: 0, y: 500 },
    data: { label: "END" },
    type: "output",
    deletable: false,
  },
];
const nodeTypes = {
  custom: TextNode,
  branch: BranchNode,
  codeEditor: CodeEditorNode,
};
const edgeTypes = {
  custom: CustomEdge,
  branch: CustomEdge,
  codeEditor: CustomEdge,
};
const defaultEdgeOptions = {
  type: "custom",
  markerEnd: "edge-circle",
};

export default function FlowGridModal({
  open,
  mode = "EDIT",
  row,
  onClose,
}: Readonly<IFlowGridModal>): ReactElement {
  const flow = useFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const {
    register,
    trigger,
    getValues,
    formState: { errors }, // 버전 6라면 errors라고 작성함.
  } = useForm({
    resolver: yupResolver(schema),
  });
  const flowContainer = useRef(null);
  const editRef = useRef<IMonacoEditorOut>(null);
  const modalRef = useRef<IGsapModalOut>(null);

  let id = nodes.length;

  useEffect(() => {
    setNodes(row?.dag_nodes ?? initialNodes);
  }, [row?.dag_nodes, setNodes]);

  useEffect(() => {
    setEdges(row?.dag_edges ?? []);
  }, [row?.dag_edges, setEdges]);

  const getId = useCallback(() => `dndnode_${id++}`, [id]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }: Node) => ({
              id: `${source}->${target}`,
              source,
              target,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [setEdges, edges, nodes]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position: XYPosition = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      }) ?? { x: 0, y: 0 };

      const newNode: Node = {
        id: getId(),
        type: type,
        position: position,
        data: { label: `${type} node` },
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [getId, reactFlowInstance, setNodes]
  );

  function handleTest() {
    if (flow.cloneNodes && flow.cloneNodes.length > 0) {
      console.log(flow.convertFlowToAirflowPipeline(flow.cloneNodes, edges));
    } else {
      console.log(flow.convertFlowToAirflowPipeline(nodes, edges));
    }
  }
  async function handleSave() {
    const data = getValues();

    if (!(await trigger())) return;

    if (mode === "EDIT") {
      await fetch(`/api/flows/${data?.dag_id}`, {
        method: "PUT",
        body: JSON.stringify({
          dag_name: data.dag_name,
          dag_nodes: flow.cloneNodes ?? nodes,
          dag_edges: edges,
        }),
      });

      toast("수정을 완료하였습니다.");
    } else {
      await fetch("/api/flows", {
        method: "POST",
        body: JSON.stringify({
          dag_id: data?.dag_id,
          dag_name: data?.dag_name,
          dag_nodes: flow.cloneNodes ?? nodes,
          dag_edges: edges,
        }),
      });

      toast("저장을 완료하였습니다.");
    }

    modalRef.current?.modalClose?.();
    flow.setCloneNodes([]);
    onClose?.(true);
  }
  async function handleDelete() {
    if (!row?.dag_id) return;

    await fetch(`/api/flows/${row?.dag_id}`, {
      method: "DELETE",
    });

    toast("삭제를 완료하였습니다.");

    modalRef.current?.modalClose?.();
    flow.setCloneNodes([]);
    onClose?.(true);
  }
  function handleClose() {
    setIsEditorOpen(false);
    flow.setCloneNodes([]);
    onClose?.(false);
  }

  function handleEditorSave() {
    console.log(editRef.current?.editText);
  }
  function handleEditorClose() {
    setIsEditorOpen(false);
    editRef.current?.clear();
  }

  return (
    <>
      <GsapModal
        id="modal1"
        open={open}
        className="min-w-[450px] w-full lg:w-[1200px] h-[750px]"
        onTest={handleTest}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={handleClose}
      >
        <div className="w-full h-full">
          <div ref={flowContainer} className="reactflow-wrapper w-full h-full">
            <div className="p-4 w-full md:justify-between justify-normal">
              <div className="w-full md:w-1/2 flex float-left">
                <InputField
                  title="DAG ID"
                  id="dag_id"
                  placeholder="DAG ID를 넣어주세요"
                  register={{ ...register("dag_id", { required: true }) }}
                  defaultValue={row?.dag_id}
                  readOnly={mode === "EDIT"}
                />
              </div>
              <div className="w-full md:w-1/2 flex">
                <InputField
                  title="DAG NAME"
                  id="dag_name"
                  placeholder="DAG 명을 넣어주세요."
                  register={{ ...register("dag_name", { required: true }) }}
                  defaultValue={row?.dag_name}
                />
              </div>
            </div>
            {errors.dag_id && (
              <p className="text-error ml-5 pb-2">{errors.dag_id?.message}</p>
            )}
            <div className="grid grid-cols-12 h-5/6">
              <FlowSidebar className="col-span-2 md:col-span-3 h-5/6" />

              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={(instance: ReactFlowInstance) =>
                  setReactFlowInstance(instance)
                }
                onDrop={onDrop}
                onDragOver={onDragOver}
                // onNodeClick={handleNodeClick}
                onNodesDelete={onNodesDelete}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                className="col-span-10 md:col-span-9 bg-base-200"
                deleteKeyCode={["Backspace", "Delete"]}
              >
                <Controls showInteractive={false} />
                <svg>
                  <defs>
                    <linearGradient id="edge-gradient">
                      <stop offset="0%" stopColor="#ae53ba" />
                      <stop offset="100%" stopColor="#2a8af6" />
                    </linearGradient>
                    <marker
                      id="edge-circle"
                      viewBox="-5 -5 10 10"
                      refX="0"
                      refY="0"
                      markerUnits="strokeWidth"
                      markerWidth="10"
                      markerHeight="10"
                      orient="auto"
                    >
                      <circle
                        stroke="#2a8af6"
                        strokeOpacity="0.75"
                        r="2"
                        cx="0"
                        cy="0"
                      />
                    </marker>
                  </defs>
                </svg>
                <Background
                  className="bg-base-200"
                  variant={BackgroundVariant.Dots}
                />
              </ReactFlow>
            </div>
          </div>
        </div>
      </GsapModal>
      <GsapModal
        ref={modalRef}
        id="modal2"
        open={isEditorOpen}
        onSave={handleEditorSave}
        onClose={handleEditorClose}
      >
        <MonacoEditor ref={editRef} />
      </GsapModal>
    </>
  );
}
