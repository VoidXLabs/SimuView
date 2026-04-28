import { Outlet } from "react-router";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}