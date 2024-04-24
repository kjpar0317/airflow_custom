"use client";

import type { IGsapModalOut } from "@/components/modal/GsapModal";
import type { Node } from "reactflow";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNodes } from "reactflow";
import { toast } from "react-toastify";

import useFlow from "@/service/useFlow";
import useAirflow from "@/service/useAirflow";
import GsapModal from "@/components/modal/GsapModal";
import {
  MonacoEditor,
  IMonacoEditorOut,
} from "@/components/editor/MonacoEditor";
import FlowGridModal from "./modal/FlowGridModal";
import FlowDrawer from "./layout/FlowDrawer";

interface IFlowGridDetail {
  key: React.Key;
  open: boolean;
  mode: string;
  row: IAirflowDag | undefined;
  onClose: (redraw: boolean) => void;
}

const getTemplate = (task_id: string) => `
def ${task_id.replace(
  " ",
  ""
)}(session: Session, http: CmpHttpHook, params: Dict[str, Any]):
  """
  변수 사용법 예시
  dag_id = params['dag_id']
  쿼리 사용법 예시
  results = session.execute('SELECT ID, IP, STATUS FROM ip_pool_address').fetchall()
  http 사용법 예시
  results = http.get(url = '/system/ip-pool', params = params)
  """
  print("${task_id} start")        
`;

const getBranchTemplate = (task_id: string) => `
def ${task_id.replace(
  " ",
  ""
)}(session: Session, http: CmpHttpHook, params: Dict[str, Any]):
    """
    !! 함수명은 바꾸지 마세요. !!

    !! 원하는 분기 task명(string) 리턴 !!

    변수 사용법 예시 (restapi 시 보낸 파라메터)
    dag_id = params['dag_id']
    쿼리 사용법 예시
    results = session.execute('SELECT ID, IP, STATUS FROM ip_pool_address').fetchall()
    http 사용법 예시
    results = http.get(url = '/system/ip-pool', params = dict({ "limit": 100000}))
    """
    print("${task_id} start")

    return "!!task명!!"
`;

export default function FlowGridDetail({
  open,
  mode,
  row,
  onClose,
}: Readonly<IFlowGridDetail>) {
  const { editedNodeId, setEditedNodeId } = useFlow();
  const { editDagId, preservedEditTasks, setEditTask, setPreservedEditTasks } =
    useAirflow();
  const nodes: Node[] = useNodes();
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const modalRef = useRef<IGsapModalOut>(null);
  const editorRef = useRef<IMonacoEditorOut>(null);

  const fetchLoadData = useCallback(
    async (dag_id: string) => {
      const data = await fetch(`/api/flows/task/${dag_id}`);

      const result = await data.json();

      setPreservedEditTasks(result);
    },
    [setPreservedEditTasks]
  );

  const findTaskTemplate = useCallback(
    (dag_id: string, task_id: string) => {
      const editTask = preservedEditTasks?.find(
        (task: IAirflowTask) =>
          task.dag_id === dag_id && task.task_id === task_id
      );
      const currentNode = nodes.find((node: Node) => node.id === editedNodeId);

      editorRef.current?.setEditText(
        editTask?.code ?? currentNode?.type === "branch"
          ? (preservedEditTasks &&
              getBranchTemplate(currentNode?.data.label)) ||
              ""
          : getTemplate(task_id)
      );
    },
    [editedNodeId, nodes, preservedEditTasks]
  );

  useEffect(() => {
    const dagId = row?.dag_id ?? editDagId;

    if (dagId && !preservedEditTasks) {
      fetchLoadData(dagId);
    }
  }, [preservedEditTasks, fetchLoadData, row?.dag_id, editDagId]);

  useEffect(() => {
    const dagId = row?.dag_id ?? editDagId;

    if (!editedNodeId) {
      setIsEditorOpen(false);
      return;
    }

    if (!dagId) {
      toast.warn("DAG_ID가 없습니다.");
      setEditedNodeId("");
      setIsEditorOpen(false);
      return;
    }

    const currentNode = nodes.find((node: Node) => node.id === editedNodeId);

    if (currentNode) {
      findTaskTemplate(dagId, currentNode.data?.label);
      setIsEditorOpen(true);
    }
  }, [
    findTaskTemplate,
    nodes,
    editedNodeId,
    row?.dag_id,
    editDagId,
    setEditedNodeId,
  ]);

  function handleEditorClose() {
    setEditedNodeId("");
    setIsEditorOpen(false);
  }

  async function handleEditorSave() {
    const info = nodes.find((node: Node) => node.id === editedNodeId);
    const dagId = row?.dag_id ?? editDagId;

    if (!info?.data.label || !dagId) return;

    setEditTask({
      dag_id: dagId,
      task_id: info.data.label,
      task_type: info.type ?? "custom",
      code: editorRef.current?.editText,
    });

    modalRef.current?.modalSaveClose?.();
  }

  return (
    <>
      <div className="drawer-content">
        <FlowGridModal
          key={`${open}`}
          mode={mode}
          open={open}
          row={row}
          onClose={onClose}
        />
      </div>
      <div className="drawer-side z-[9999]">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <FlowDrawer />
      </div>
      <GsapModal
        ref={modalRef}
        id="edit_modal"
        open={isEditorOpen}
        onSave={handleEditorSave}
        onClose={handleEditorClose}
      >
        <MonacoEditor ref={editorRef} className="md:w-[1024px] h-[768px]" />
      </GsapModal>
    </>
  );
}
