import type { Node } from "reactflow";

import { useCallback } from "react";
import useSWR from "swr";
import { includes } from "lodash-es";

import { getAirflowFetch } from "@/util/fetch_util";

let _editDagId: string | null;
let _preservedEditTasks: IAirflowTask[] | null;

export default function useAirflow() {
  const { data: editDagId, mutate: editDagIdMutate } = useSWR<string | null>(
    "editDagId",
    () => _editDagId
  );
  const { data: preservedEditTasks, mutate: preservedEditTasksMutate } = useSWR<
    IAirflowTask[] | null
  >("preservedEditTasks", () => _preservedEditTasks);
  // app route 만 쓰려고 했는데.. 안되겠다.
  const { data: dagList } = useSWR(`/airflow-api/dags`, getAirflowFetch);

  const setEditDagId = useCallback(
    (editDagId: string | null) => {
      _editDagId = editDagId;
      return editDagIdMutate();
    },
    [editDagIdMutate]
  );

  const setPreservedEditTasks = useCallback(
    (preservedEditTasks: IAirflowTask[] | null) => {
      _preservedEditTasks = preservedEditTasks;
      return preservedEditTasksMutate();
    },
    [preservedEditTasksMutate]
  );

  const setMoveTaskCodeByChangeTaskId = useCallback(
    (prevTaskId: string, newTaskId: string) => {
      if (prevTaskId === newTaskId) return;

      const index: number | undefined = _preservedEditTasks?.findIndex(
        (task: IAirflowTask) => task.task_id === prevTaskId
      );

      if (index && index >= 0 && _preservedEditTasks) {
        _preservedEditTasks[index] = {
          ..._preservedEditTasks[index],
          task_id: newTaskId,
        };
      }

      preservedEditTasksMutate();
    },
    [preservedEditTasksMutate]
  );

  const setEditTask = useCallback(
    (preservedEditTask: IAirflowTask | null) => {
      if (_preservedEditTasks && preservedEditTask) {
        const taskIndex = _preservedEditTasks.findIndex(
          (existTask) => existTask.task_id === preservedEditTask.task_id
        );

        if (taskIndex >= 0) {
          _preservedEditTasks[taskIndex] = preservedEditTask;
        } else {
          _preservedEditTasks.push(preservedEditTask);
        }
      } else if (preservedEditTask) {
        _preservedEditTasks = [preservedEditTask];
      } else {
        _preservedEditTasks = null;
      }

      preservedEditTasksMutate();
    },
    [preservedEditTasksMutate]
  );

  const cleanedPreservedEditTasks = useCallback((nodes: Node[]) => {
    if (_preservedEditTasks) {
      const firstPreservedEditTask = _preservedEditTasks[0];
      const preservedTasks = _preservedEditTasks.map(
        (task: IAirflowTask) => task.task_id
      );
      const nodeTasks = nodes.map((node) => node.data.label);

      nodes
        .filter((node: Node) => !["START", "END"].includes(node.data.label))
        .filter((node: Node) => !includes(preservedTasks, node.data.label))
        .forEach((node: Node) =>
          _preservedEditTasks?.push({
            dag_id: firstPreservedEditTask.dag_id,
            task_type: node.type ?? "custom",
            task_id: node.data.label,
            code: "",
          })
        );

      return _preservedEditTasks.filter((editTask: IAirflowTask) =>
        includes(nodeTasks, editTask.task_id)
      );
    }
    return null;
  }, []);

  return {
    dagList,
    editDagId,
    preservedEditTasks,
    setEditDagId,
    setPreservedEditTasks,
    setEditTask,
    setMoveTaskCodeByChangeTaskId,
    cleanedPreservedEditTasks,
  };
}