import { useParams } from "react-router-dom";
import React, { useState, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";
// Import dan daftarkan resize image module
import ResizeImage from "quill-resize-image";
Quill.register("modules/resizeImage", ResizeImage);

function resizeImage(ref, size) {
  const quill = ref.current?.getEditor();
  const range = quill?.getSelection();
  if (!range) return;

  const [leaf] = quill.getLeaf(range.index);
  const domNode = leaf?.domNode;

  if (domNode?.tagName === "IMG") {
    domNode.style.width = size;
  } else {
    alert("Pilih gambar terlebih dahulu untuk mengatur ukurannya.");
  }
}

export default function UploadSoal() {
  const navigate = useNavigate();
  const { id } = useParams();

  const quillSoalRef = useRef();
  const quillOpsiARef = useRef();
  const quillOpsiBRef = useRef();
  const quillOpsiCRef = useRef();
  const quillOpsiDRef = useRef();

  const [soalContent, setSoalContent] = useState("");
  const [opsiAContent, setOpsiAContent] = useState("");
  const [opsiBContent, setOpsiBContent] = useState("");
  const [opsiCContent, setOpsiCContent] = useState("");
  const [opsiDContent, setOpsiDContent] = useState("");
  const [selectedJawaban, setSelectedJawaban] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // const createModules = (editorRef) => ({
  //   toolbar: {
  //     container: [
  //       [{ header: [1, 2, false] }],
  //       ["bold", "italic", "underline"],
  //       [{ list: "ordered" }, { list: "bullet" }],
  //       ["link", "image"],
  //       ["clean"],
  //     ],
  //     handlers: {
  //       image: () => imageHandler(editorRef),
  //     },
  //   },
  // });

  const createModules = (editorRef) => ({
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        [{ align: [] }, { direction: "rtl" }],
        ["clean"],
      ],
      handlers: {
        image: () => imageHandler(editorRef),
      },
    },
    // Tambahkan ini
    resizeImage: {
      displaySize: true,
    },
  });

  console.log(localStorage.getItem("access_token"));

  const modulesSoal = useMemo(() => createModules(quillSoalRef), []);
  const modulesA = useMemo(() => createModules(quillOpsiARef), []);
  const modulesB = useMemo(() => createModules(quillOpsiBRef), []);
  const modulesC = useMemo(() => createModules(quillOpsiCRef), []);
  const modulesD = useMemo(() => createModules(quillOpsiDRef), []);

  const imageHandler = async (editorRef) => {
    const quill = editorRef?.current?.getEditor();
    if (!quill) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // // Insert loading gif
      const range = quill.getSelection(true);
      // const loadingId = `loading-${Date.now()}`;
      // quill.insertEmbed(range.index, "image", `/img/loading.gif`);
      // quill.insertText(range.index + 1, "\n"); // spasi jika diperlukan

      const delta = quill.getContents();
      const loadingUrl = "/img/loading.gif";

      // Simpan posisi index untuk nanti ditimpa
      const insertIndex = range.index;

      // Sisipkan loading image
      quill.insertEmbed(insertIndex, "image", loadingUrl);
      // ================== mulai post image ========================
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (data.Data && data.Data.url) {
          // // Cari dan hapus loading.gif
          // const editorContents = quill.getContents();
          // const newDelta = editorContents.ops.filter((op) => {
          //   return !(
          //     op.insert &&
          //     typeof op.insert === "string" &&
          //     op.insert.includes("/img/loading.gif")
          //   );
          // });
          // quill.setContents({ ops: newDelta });

          // Hapus loading image
          // const delta = quill.getContents();

          // Hapus loading GIF (yang baru disisipkan)
          quill.deleteText(insertIndex, 1); // hanya 1 embed image = panjang 1

          // const range = quill.getSelection(true);
          quill.insertEmbed(
            range ? range.index : quill.getLength(),
            "image",
            data.Data.url
          );
        } else {
          alert("Gagal mengunggah gambar.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload gagal.");
      } finally {
        setIsLoading(false);
      }
    };
  };

  const handleSubmit = async () => {
    if (
      !soalContent ||
      !opsiAContent ||
      !opsiBContent ||
      !opsiCContent ||
      !opsiDContent ||
      !["a", "b", "c", "d"].includes(selectedJawaban)
    ) {
      alert("Lengkapi semua isian dan pilih jawaban.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/upload-soal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            id_module: parseInt(id, 10),
            soal: soalContent,
            jenis: "pilihan_ganda",
            opsi_a: opsiAContent,
            opsi_b: opsiBContent,
            opsi_c: opsiCContent,
            opsi_d: opsiDContent,
            jawaban: selectedJawaban,
          }),
        }
      );

      // const data = JSON.stringify({
      //   id_module: parseInt(id, 10),
      //   soal: soalContent,
      //   jenis: "pilihan_ganda",
      //   opsi_a: opsiAContent,
      //   opsi_b: opsiBContent,
      //   opsi_c: opsiCContent,
      //   opsi_d: opsiDContent,
      //   jawaban: selectedJawaban,
      // });

      const data = await response.json();
      console.log(data);

      // alert(data.message || "Soal berhasil ditambahkan!");
      // const storedId = localStorage.getItem("idMapel");
      // navigate(`/list-soal/${storedId}`);

      console.log(data);
    } catch (err) {
      console.error("Simpan error:", err);
      alert("Gagal menyimpan soal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 w-full">
      <button
        onClick={() => navigate(`/list-soal/${id}`)}
        className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
      >
        ← Kembali
      </button>

      <h1 className="text-2xl font-bold mb-6">Tambah Soal Baru</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Kolom Soal */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Soal:</label>
          <div className="border rounded">
            <ReactQuill
              ref={quillSoalRef}
              value={soalContent}
              onChange={setSoalContent}
              modules={modulesSoal}
              placeholder="Tulis soal di sini..."
              style={{ height: "50vh", marginBottom: "40px" }}
            />
          </div>
        </div>

        {/* Kolom Opsi A dan B */}
        <div className="flex flex-col gap-4">
          {["a", "b"].map((opt, idx) => {
            const refs = [quillOpsiARef, quillOpsiBRef];
            const modulesList = [modulesA, modulesB];
            const stateList = [opsiAContent, opsiBContent];
            const setStateList = [setOpsiAContent, setOpsiBContent];

            return (
              <div key={opt}>
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="jawaban"
                    id={`jawaban-${opt}`}
                    value={opt}
                    checked={selectedJawaban === opt}
                    onChange={(e) => setSelectedJawaban(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor={`jawaban-${opt}`} className="font-bold">
                    Opsi {opt.toUpperCase()}:
                  </label>
                </div>
                <div className="border rounded">
                  <ReactQuill
                    ref={refs[idx]}
                    value={stateList[idx]}
                    onChange={setStateList[idx]}
                    modules={modulesList[idx]}
                    placeholder={`Tulis opsi ${opt.toUpperCase()}...`}
                    style={{ height: "25vh", marginBottom: "40px" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Kolom Opsi C dan D */}
        <div className="flex flex-col gap-4">
          {["c", "d"].map((opt, idx) => {
            const refs = [quillOpsiCRef, quillOpsiDRef];
            const modulesList = [modulesC, modulesD];
            const stateList = [opsiCContent, opsiDContent];
            const setStateList = [setOpsiCContent, setOpsiDContent];

            return (
              <div key={opt}>
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="jawaban"
                    id={`jawaban-${opt}`}
                    value={opt}
                    checked={selectedJawaban === opt}
                    onChange={(e) => setSelectedJawaban(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor={`jawaban-${opt}`} className="font-bold">
                    Opsi {opt.toUpperCase()}:
                  </label>
                </div>
                <div className="border rounded">
                  <ReactQuill
                    ref={refs[idx]}
                    value={stateList[idx]}
                    onChange={setStateList[idx]}
                    modules={modulesList[idx]}
                    placeholder={`Tulis opsi ${opt.toUpperCase()}...`}
                    style={{ height: "25vh", marginBottom: "40px" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2">Soal:</label>
        <div className="border rounded">
          <ReactQuill
            ref={quillSoalRef}
            value={soalContent}
            onChange={setSoalContent}
            modules={modulesSoal}
            placeholder="Tulis soal di sini..."
            style={{ height: "200px", marginBottom: "40px" }}
          />
        </div>
      </div>

      {["a", "b", "c", "d"].map((opt, idx) => {
        const refs = [
          quillOpsiARef,
          quillOpsiBRef,
          quillOpsiCRef,
          quillOpsiDRef,
        ];
        const modulesList = [modulesA, modulesB, modulesC, modulesD];
        const stateList = [
          opsiAContent,
          opsiBContent,
          opsiCContent,
          opsiDContent,
        ];
        const setStateList = [
          setOpsiAContent,
          setOpsiBContent,
          setOpsiCContent,
          setOpsiDContent,
        ];

        return (
          <div className="mb-6" key={opt}>
            <div className="flex items-center mb-2">
              <input
                type="radio"
                name="jawaban"
                id={`jawaban-${opt}`}
                value={opt}
                checked={selectedJawaban === opt}
                onChange={(e) => setSelectedJawaban(e.target.value)}
                className="mr-2"
              />
              <label htmlFor={`jawaban-${opt}`} className="font-bold">
                Opsi {opt.toUpperCase()}:
              </label>
            </div>
            <div className="border rounded">
              <ReactQuill
                ref={refs[idx]}
                value={stateList[idx]}
                onChange={setStateList[idx]}
                modules={modulesList[idx]}
                placeholder={`Tulis opsi ${opt.toUpperCase()}...`}
                style={{ height: "100px", marginBottom: "40px" }}
              />
            </div>
          </div>
        );
      })} */}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Menyimpan..." : "Simpan Soal"}
      </button>
    </div>
  );
}
