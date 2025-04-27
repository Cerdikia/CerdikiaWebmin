import { lazy } from "react";

const UserList = lazy(() => import("../pages/UserList"));
const UserDetail = lazy(() => import("../pages/UserDetail"));

export default [
  {
    path: '/users',
    element: <UserList />,
  },
  {
    path: '/users/:id',
    element: <UserDetail />,
  },
];
