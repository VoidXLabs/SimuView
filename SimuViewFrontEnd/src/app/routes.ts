import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Interview from "./pages/Interview";

export const router = createBrowserRouter([
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
]);
