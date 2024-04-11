"use client";

import type { ReactElement, Ref } from "react";

import { useState, useImperativeHandle, forwardRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

interface IMonacoEditor {
  className?: string;
  text?: string;
}

export interface IMonacoEditorOut {
  editText: string | undefined;
  clear: () => void;
}

export const MonacoEditor = forwardRef(function MonacoEditor(
  { className = "w-[500px]", text }: IMonacoEditor,
  ref: Ref<IMonacoEditorOut>
): ReactElement {
  // const monaco = useMonaco();
  const [editText, setEditText] = useState("");

  useImperativeHandle(
    ref,
    () => {
      return {
        editText,
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
        height="90vh"
        defaultLanguage="python"
        defaultValue={text}
        value={editText}
        onChange={handleChange}
      />
    </div>
  );
});
