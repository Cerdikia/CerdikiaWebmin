import { useParams } from "react-router-dom";

export default function BlogDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>Blog Detail</h1>
      <p>Menampilkan detail blog dengan ID: {id}</p>
    </div>
  );
}
