import type {
  ReactFlowInstance,
  Edge,
  Node,
  Connection,
  XYPosition,
} from "reactflow";
import type { ReactElement, DragEvent } from "react";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

import useFlow from "@/service/useFlow";
import useAirflow from "@/service/useAirflow";
import GsapModal, { type IGsapModalOut } from "@/components/modal/GsapModal";
import FlowSidebar from "../layout/FlowSidebar";
import CustomEdge from "../diagrams/edge/CustomEdge";
import {
  CmpOperatorNode,
  TextNode,
  BranchNode,
  CodeEditorNode,
} from "../diagrams/nodes";
import InputField from "@/components/ui/forms/fields/InputField";

import "@/assets/style/react-flow.css";

interface IFlowGridModal {
  key: React.Key;
  open: boolean;
  mode?: string;
  row?: IAirflowDag;
  onClose?: (redraw: boolean) => void;
}

const registerSchema = z.object({
  dag_id: z.string().min(1, { message: "DAG ID는 필수 값 입니다." }),
  dag_name: z.string(),
});
// .refine((data) => data.password === data.passwordCheck, {
//   path: ["passwordCheck"],
//   message: "비밀번호가 일치하지 않습니다.",
// });

type RegisterSchemaType = z.infer<typeof registerSchema>;

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

export default function FlowGridModal({
  open,
  mode = "EDIT",
  row,
  onClose,
}: Readonly<IFlowGridModal>): ReactElement {
  const { convertFlowToAirflowPipeline } = useFlow();
  const {
    preservedEditTasks,
    deleteDagFlow,
    setEditDagId,
    setPreservedEditTasks,
    delEditTask,
    cleanedPreservedEditTasks,
  } = useAirflow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();
  const {
    register,
    trigger,
    getValues,
    formState: { errors }, // 버전 6라면 errors라고 작성함.
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });
  const flowContainer = useRef(null);
  const modalRef = useRef<IGsapModalOut>(null);

  let id = nodes.length;

  useEffect(() => {
    setNodes(row?.dag_nodes ?? initialNodes);
  }, [row?.dag_nodes, setNodes]);

  useEffect(() => {
    setEdges(row?.dag_edges ?? []);
  }, [row?.dag_edges, setEdges]);

  const getId = useCallback(() => `dndnode_${id++}`, [id]);

  const nodeTypes = useMemo(
    () => ({
      cmp: CmpOperatorNode,
      custom: TextNode,
      branch: BranchNode,
      codeEditor: CodeEditorNode,
    }),
    []
  );
  const edgeTypes = useMemo(
    () => ({
      cmp: CustomEdge,
      custom: CustomEdge,
      branch: CustomEdge,
      codeEditor: CustomEdge,
    }),
    []
  );
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "custom",
      markerEnd: "edge-circle",
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges(
        deleted.reduce((acc: Edge[], node: Node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          delEditTask(node.data.label);

          const remainingEdges = acc.filter(
            (edge: Edge) => !connectedEdges.includes(edge)
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
    [setEdges, edges, nodes, delEditTask]
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

      let newNode: Node;

      if (type === "branch") {
        newNode = {
          id: getId(),
          type: type,
          position: position,
          data: { label: `branch_${getId()}` },
        };
      } else {
        newNode = {
          id: getId(),
          type: type,
          position: position,
          data: { label: `new_task` },
        };
      }

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [getId, reactFlowInstance, setNodes]
  );

  function handleTest() {
    console.log(convertFlowToAirflowPipeline(nodes, edges));
  }
  async function handleSave() {
    const data = getValues();

    if (!(await trigger())) return;

    const taskList = cleanedPreservedEditTasks(nodes);
    const noCodeTask = taskList?.find((task: IAirflowTask) => !task.code);

    if (noCodeTask) {
      toast.warn(`task: ${noCodeTask.task_id} 에 코드가 없습니다.`);
      return;
    }

    // DAG 저장
    if (mode === "EDIT") {
      await fetch(`/api/flows/dag/${data?.dag_id}`, {
        method: "PUT",
        body: JSON.stringify({
          dag_name: data.dag_name,
          dag_nodes: nodes,
          dag_edges: edges,
        }),
      });
    } else {
      await fetch("/api/flows/dag", {
        method: "POST",
        body: JSON.stringify({
          dag_id: data?.dag_id,
          dag_name: data?.dag_name,
          dag_nodes: nodes,
          dag_edges: edges,
        }),
      });
    }

    if (preservedEditTasks) {
      // TASK (예약된) list 저장
      await fetch("/api/flows/task/list", {
        method: "POST",
        body: JSON.stringify(taskList),
      });
    } else {
      const newTasks: IAirflowTask[] = nodes
        .filter((node: Node) => !["START", "END"].includes(node.data.label))
        .map((node: Node) => ({
          dag_id: data?.dag_id,
          task_id: node.data.label,
          task_type: node.type ?? "custom",
          code: "",
        }));
      await fetch("/api/flows/task/list", {
        method: "POST",
        body: JSON.stringify(newTasks),
      });
    }

    // 파이프라인 저장
    await fetch(`/api/flows/pipeline/${data?.dag_id}`, {
      method: "PUT",
      body: JSON.stringify(convertFlowToAirflowPipeline(nodes, edges)),
    });

    toast("저장을 완료하였습니다.");

    modalRef.current?.modalClose?.();
    initDag();
    onClose?.(true);
  }
  async function handleDelete() {
    if (!row?.dag_id) return;

    // await fetch(`/api/flows/dag/${row?.dag_id}`, {
    //   method: "DELETE",
    // });

    await deleteDagFlow({ dagId: row.dag_id } as any);

    toast("삭제를 완료하였습니다.");

    modalRef.current?.modalClose?.();
    initDag();
    onClose?.(true);
  }
  function initDag() {
    setPreservedEditTasks(null);
    setEditDagId("");
  }
  function handleClose() {
    initDag();
    onClose?.(false);
  }

  return (
    <GsapModal
      open={open}
      className="min-w-[450px] w-full lg:w-[1200px] h-[700px]"
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
                register={{
                  ...register("dag_id", {
                    required: true,
                    // onChange: (e: any) => {
                    //   console.log(e);
                    // },
                    onBlur: (e: any) => setEditDagId(e.target?.value),
                  }),
                }}
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
  );
}
