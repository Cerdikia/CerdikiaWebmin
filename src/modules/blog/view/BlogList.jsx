import { Link } from "react-router-dom";

export default function BlogList() {
  // Contoh data blog dummy
  const blogs = [
    { id: 1, title: "Belajar React" },
    { id: 2, title: "Mengenal Vite" },
    { id: 3, title: "Dynamic Routing di React" },
  ];

  return (
    <div>
      <h1>Blog List</h1>
      <ul>
        {blogs.map((blog) => (
          <li key={blog.id}>
            <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
