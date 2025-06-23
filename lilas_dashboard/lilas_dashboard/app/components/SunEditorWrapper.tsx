"use client";
import React, { useEffect, useRef } from "react";
import SunEditorCore from "suneditor";
import "suneditor/dist/css/suneditor.min.css";
import plugins from "suneditor/src/plugins";

interface SunEditorWrapperProps {
  value?: string;
  onChange?: (content: string) => void;
  height?: number | string; 
  buttonList?: any[][]; 
  setOptions?: {
    minHeight?: string;
    resizingBar?: boolean;
  };
}

function SunEditorWrapper({
  value,
  onChange,
  height = 300,
  buttonList = [
    ["undo", "redo"],
    ["bold", "italic", "underline", "strike"],
    ["fontColor", "hiliteColor"],
    ["align", "list", "table"],
    ["link", "image", "video"],
    ["removeFormat"],
  ],
  setOptions = {
    minHeight: "300px",
    resizingBar: false,
  },
}: SunEditorWrapperProps) {
  const editorRef = useRef<HTMLDivElement | null>(null); 
  const editorInstanceRef = useRef<any>(null); 

  useEffect(() => {
    if (!editorRef.current) return;

    // editor
    const editor = SunEditorCore.create(editorRef.current, {
      height: typeof height === "number" ? `${height}px` : height,
      buttonList,
      plugins: plugins, 
      defaultStyle: "font-size: 16px; font-family: Arial, sans-serif; line-height: 1.6;", 
      imageUploadUrl: "", // upload ảnh
      videoFileInput: true, // input video
      iframe: false,
      linkProtocol: "https", // link HTTPS
      minHeight: setOptions.minHeight,
      resizingBar: setOptions.resizingBar,
    });

    // save instance in ref 
    editorInstanceRef.current = editor;
    if (value) {
      editor.setContents(value);
    }

    editor.onChange = (content: string) => {
      if (onChange) onChange(content);
    };

    // cleanup unmount
    return () => {
      editor.destroy();
    };
  }, [value, onChange, height, buttonList, setOptions]);

  return <div ref={editorRef} />;
}

export default SunEditorWrapper;
