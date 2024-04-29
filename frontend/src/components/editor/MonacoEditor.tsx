"use client";

import type { ReactElement, Ref } from "react";

import { useState, useImperativeHandle, forwardRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

import useLayout from "@/service/useLayout";

interface IMonacoEditor {
  className?: string;
  text?: string;
  readOnly?: boolean;
}

export interface IMonacoEditorOut {
  editText: string | undefined;
  setEditText: (text: string) => void;
  clear: () => void;
}

export const MonacoEditor = forwardRef(function MonacoEditor(
  { className = "w-[500px]", text, readOnly }: IMonacoEditor,
  ref: Ref<IMonacoEditorOut>
): ReactElement {
  const { theme } = useLayout();
  // const monaco = useMonaco();
  const [editText, setEditText] = useState("");

  useImperativeHandle(
    ref,
    () => {
      return {
        editText,
        setEditText,
        clear() {
          setEditText("");
        },
      };
    },
    [editText]
  );

  function handleChange(value: string | undefined) {
    setEditText(value ?? "");
  }

  return (
    <div className={className}>
      <Editor
        // height="90vh"
        theme={theme === "light" ? theme : "vs-dark"}
        defaultLanguage="python"
        defaultValue={text}
        value={editText}
        options={{ readOnly: readOnly }}
        onChange={handleChange}
      />
    </div>
  );
});
