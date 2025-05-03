import React, { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CobaQuil() {
  const quillRef = useRef(null);
  const [value, setValue] = useState("");

  const insertImage = () => {
    const quill = quillRef.current.getEditor(); // pastikan ini tidak null
    const imageUrl =
      "https://kp-golang-mysql2-container.raffimrg.my.id/uploads/bc1b7549-da8f-4c5f-85ac-b769edc48a00.png";

    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(
        range ? range.index : quill.getLength(),
        "image",
        imageUrl
      );
      console.log("Image inserted:", imageUrl);
    } else {
      console.warn("Editor belum siap");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Debug Quill Image Insert</h1>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={setValue}
        theme="snow"
        style={{ height: "200px", marginBottom: "20px" }}
      />
      <button
        onClick={insertImage}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Insert Test Image
      </button>
    </div>
  );
}
