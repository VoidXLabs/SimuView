import { Link, useNavigate } from "react-router";
import { Brain, User, LogOut, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = false }: HeaderProps) {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-900/60 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/40">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-shadow">
              <Brain className="h-6 w-6 text-white" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900"></div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white bg-clip-text">
              SimuView
            </span>
          </Link>

          {showNav && (
            <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
              <Link 
                to="/" 
                className="px-5 py-2 text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                首页
              </Link>
              <Link 
                to="/setup" 
                className="px-5 py-2 text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2"
              >
                模拟面试
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20">HOT</span>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-5">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white leading-none">{user.email}</p>
                <p className="text-xs text-slate-300 mt-1">免费计划</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 overflow-hidden border-2 border-white/10 hover:border-emerald-500/50 transition-colors shadow-lg">
                    <Avatar className="h-full w-full">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.email} className="h-full w-full object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-neutral-200 font-bold text-lg">
                        {user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl rounded-2xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm font-bold leading-none text-white">{user.email}</p>
                      <p className="text-xs leading-none text-slate-300">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem className="cursor-pointer rounded-xl text-neutral-300 hover:bg-white/10 hover:text-white p-3 transition-colors">
                      <User className="mr-3 h-4 w-4 text-emerald-400" />
                      <span className="font-medium">个人资料</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-xl text-red-400 focus:text-red-400 focus:bg-red-500/10 p-3 transition-colors m-1"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="bg-white text-black hover:bg-neutral-200 px-6 py-5 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
