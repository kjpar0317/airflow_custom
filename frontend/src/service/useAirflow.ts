import type { Node } from "reactflow";

import { useCallback } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { includes, isEmpty } from "lodash-es";

import {
  getAirflowFetch,
  getTabclouditTextFetch,
  fetchTabcloudit,
} from "@/util/fetch_util";

let _errorDagId: string | null;
let _editDagId: string | null;
let _preservedEditTasks: IAirflowTask[] | null;

const PYTHON_START_TASK_CODE = "def ";

export default function useAirflow() {
  const { data: errorDagId, mutate: errorDagIdMutate } = useSWR<string | null>(
    "errorDagId",
    () => _errorDagId
  );
  const { data: editDagId, mutate: editDagIdMutate } = useSWR<string | null>(
    "editDagId",
    () => _editDagId
  );
  const { data: preservedEditTasks, mutate: preservedEditTasksMutate } = useSWR<
    IAirflowTask[] | null
  >("preservedEditTasks", () => _preservedEditTasks);
  // app route 만 쓰려고 했는데.. 안되겠다.
  const { data: dagList } = useSWR(`/airflow-api/dags`, getAirflowFetch, {
    refreshInterval: 10000, // 10초 마다 갱신
  });
  const { data: importError } = useSWR(
    `/airflow-api/importErrors`,
    getAirflowFetch,
    {
      refreshInterval: 5000, // 5초 마다 갱신
    }
  );
  const { data: dagCode } = useSWR(
    `dag_id_${_errorDagId}`,
    () =>
      _errorDagId &&
      getTabclouditTextFetch(`/cmp-api/airflow/dag/code?dagId=${_errorDagId}`)
  );
  // swr mutation 예제
  const { trigger: deleteDagFlow } = useSWRMutation(
    `/cmp-api/airflow/flow/dag/delete`,
    (key: string, options: any) => fetchTabcloudit(key, "POST", options)
  );

  const setErrorDagId = useCallback(
    (errorDagId: string | null) => {
      _errorDagId = errorDagId;
      return errorDagIdMutate();
    },
    [errorDagIdMutate]
  );

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

  const delEditTask = useCallback(
    (taskId: string) => {
      if (_preservedEditTasks) {
        const taskIndex = _preservedEditTasks.findIndex(
          (existTask) => existTask.task_id === taskId
        );

        if (taskIndex >= 0) {
          _preservedEditTasks.splice(taskIndex, 1);
        }
      }

      preservedEditTasksMutate();
    },
    [preservedEditTasksMutate]
  );

  const validEditTask = useCallback((newTaskId: string) => {
    const existNode = _preservedEditTasks?.find(
      (task: IAirflowTask) => task.task_id === newTaskId
    );

    if (isEmpty(existNode)) return true;
    return false;
  }, []);

  const cleanedPreservedEditTasks = useCallback((nodes: Node[]) => {
    if (_preservedEditTasks) {
      const firstPreservedEditTask = _preservedEditTasks[0];
      const preservedTasks = _preservedEditTasks.map(
        (task: IAirflowTask) => task.task_id
      );
      const nodeTasks = nodes.map((node) => node.data.label);

      // node에는 있지만 수정한 거에는 없는 경우 (지금은 필요한가... 일단 남겨보자)
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

      // taskid와 함수명을 맞춘다.
      _preservedEditTasks?.map((task: IAirflowTask, index: number) => {
        if (task.code) {
          const startUserInput = task.code.indexOf(PYTHON_START_TASK_CODE);
          const startCode = task.code.substring(startUserInput);

          const prevTaskId = startCode.substring(
            PYTHON_START_TASK_CODE.length,
            startCode.indexOf("(")
          );

          if (task.task_id !== prevTaskId) {
            task.code = task.code.replace(prevTaskId, task.task_id);
          }
        }
      });

      return _preservedEditTasks.filter((editTask: IAirflowTask) =>
        includes(nodeTasks, editTask.task_id)
      );
    }
    return null;
  }, []);

  return {
    dagList,
    importError,
    dagCode,
    errorDagId,
    editDagId,
    preservedEditTasks,
    deleteDagFlow,
    setEditDagId,
    setPreservedEditTasks,
    setMoveTaskCodeByChangeTaskId,
    setEditTask,
    delEditTask,
    setErrorDagId,
    validEditTask,
    cleanedPreservedEditTasks,
  };
}
