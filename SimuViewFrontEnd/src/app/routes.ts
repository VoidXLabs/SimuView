import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Interview from "./pages/Interview";
import InterviewDetail from "./pages/InterviewDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "/",
        Component: Home,
      },
      {
        path: "/setup",
        Component: Setup,
      },
      {
        path: "/interview",
        Component: Interview,
      },
      {
        path: "/interview-detail/:id",
        Component: InterviewDetail,
      },
    ],
  },
]);