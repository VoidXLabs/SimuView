import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
