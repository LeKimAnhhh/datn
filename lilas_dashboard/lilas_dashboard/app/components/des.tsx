import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type TextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const TestTextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline"],
      ["link"],
      [{ align: [] }],
      ["image"],
      ["video"],
      [{ color: [] }, { background: [] }],
      ["blockquote"],
    ],
  };

  return (

    <div className="rounded-lg w-full h-[400px]">
      <ReactQuill
        className="w-full h-[344px] mt-6"
        theme="snow"
        value={value}
        onChange={onChange} 
        modules={modules}
      />
    </div>
  );
};

export default TestTextEditor;
