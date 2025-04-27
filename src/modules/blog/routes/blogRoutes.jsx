import { lazy } from "react";

const BlogList = lazy(() => import("../view/BlogList"));
const BlogDetail = lazy(() => import("../view/BlogDetail"));

export default [
  {
    path: '/blog',
    element: <BlogList />,
  },
  {
    path: '/blog/:id',
    element: <BlogDetail />,
  },
];
