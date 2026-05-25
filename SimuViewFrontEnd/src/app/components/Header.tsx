import { Link, useNavigate, useLocation } from "react-router";
import { Brain, User, LogOut, Activity, Cpu, Terminal, Network, ShieldCheck, Sun, Moon } from "lucide-react";
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
import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = false }: HeaderProps) {
  const { user, isLoggedIn, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  // 模拟终端时钟
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const navLinks = [
    { name: "首页", path: "/", icon: <Terminal className="w-4 h-4" /> },
    { name: "开始面试", path: "/setup", icon: <Cpu className="w-4 h-4" />, highlight: true },
    { name: "面试记录", path: "/my-interviews", icon: <Network className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/5 bg-white/60 dark:bg-[#030014]/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-[#030014]/40">
      {/* 顶部激光扫描线 */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* 左侧：Logo & 系统标识 */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-4 transition-opacity hover:opacity-80 group">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-600/10"></div>
              <Brain className="h-6 w-6 text-cyan-500 dark:text-cyan-400 relative z-10" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 border-2 border-white dark:border-[#030014] animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none mb-1">
                SimuView
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-500/70 tracking-widest uppercase">智能模拟面试</span>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </div>
            </div>
          </Link>

          {/* 中间：导航链接 */}
          {showNav && (
            <nav className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-[#0a0a14]/50 p-1.5 rounded-2xl border border-black/5 dark:border-white/5 ml-4">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 group overflow-hidden ${
                      isActive 
                        ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-cyan-500 dark:bg-cyan-400 rounded-t-full shadow-[0_0_10px_rgba(34,211,238,1)]"></div>
                    )}
                    <span className={`transition-colors ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                      {link.icon}
                    </span>
                    <span className="tracking-wide">{link.name}</span>
                    {link.highlight && (
                      <span className="absolute top-1.5 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* 右侧：状态与用户面板 */}
        <div className="flex items-center gap-6">
          {/* 主题切换按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          {/* 系统时间与状态 (仅在大屏幕显示) */}
          <div className="hidden lg:flex flex-col items-end mr-4 border-r border-black/10 dark:border-white/10 pr-6">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>UPLINK SECURE</span>
            </div>
            <div className="font-mono text-slate-500 dark:text-slate-400 text-xs tracking-widest">
              SYS.T: {formatTime(time)}
            </div>
          </div>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none tracking-wide">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Activity className="w-3 h-3 text-cyan-600 dark:text-cyan-500" />
                  <p className="text-[10px] text-cyan-600/70 dark:text-cyan-500/70 font-mono tracking-widest uppercase">Node Active</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 overflow-hidden border-2 border-black/10 dark:border-white/10 hover:border-cyan-500/50 transition-all duration-300 shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <Avatar className="h-full w-full">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.email} className="h-full w-full object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-slate-100 dark:bg-[#0a0a14] text-cyan-600 dark:text-cyan-400 font-black text-lg border border-cyan-500/30">
                        {user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 bg-white dark:bg-[#0a0a14]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 p-2 shadow-2xl rounded-2xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl mb-2 border border-black/5 dark:border-white/5">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">Online</p>
                      </div>
                      <p className="text-sm font-black leading-none text-slate-900 dark:text-white tracking-wide">{user.name || "User"}</p>
                      <p className="text-xs font-mono leading-none text-slate-500 truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem className="cursor-pointer rounded-xl text-slate-600 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 p-3 transition-colors mb-1 font-medium">
                      <User className="mr-3 h-4 w-4" />
                      <span>个人中心</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-xl text-slate-600 dark:text-slate-300 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 p-3 transition-colors font-medium">
                      <Cpu className="mr-3 h-4 w-4" />
                      <span>我的设置</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5 my-1" />
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-xl text-rose-500 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400 focus:bg-rose-500/10 p-3 transition-colors m-1 font-bold"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="tracking-widest uppercase text-xs">退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 px-8 py-5 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] tracking-widest uppercase text-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">立即登录</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}