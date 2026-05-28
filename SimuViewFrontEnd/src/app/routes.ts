import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Interview from "./pages/Interview";
import InterviewDetail from "./pages/InterviewDetail";
import MyInterviews from "./pages/MyInterviews";
import Resumes from "./pages/Resumes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TtsTest from "./pages/TtsTest";
import AsrTest from "./pages/AsrTest";
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
    path: "/tts-test",
    Component: TtsTest,
  },
  {
    path: "/asr-test",
    Component: AsrTest,
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
        path: "/resumes",
        Component: Resumes,
      },
      {
        path: "/interview",
        Component: Interview,
      },
      {
        path: "/interview-detail/:id",
        Component: InterviewDetail,
      },
      {
        path: "/my-interviews",
        Component: MyInterviews,
      }
    ],
  },
]);