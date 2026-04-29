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
    <header className="sticky top-0 z-50 w-full border-b border-neutral-700/50 bg-neutral-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              SimuView
            </span>
          </Link>

          {showNav && (
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                to="/" 
                className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/setup" 
                className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
              >
                Start Interview
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn && user ? (
            <>
              <span className="text-sm text-neutral-400">{user.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-neutral-600 hover:border-neutral-500 transition-colors">
                    <Avatar className="h-full w-full">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-neutral-700 text-neutral-300">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 bg-neutral-800 border-neutral-700" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-white">{user.name}</p>
                      <p className="text-xs leading-none text-neutral-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-700" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer text-neutral-300 hover:bg-neutral-700 hover:text-white">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-neutral-700" />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              variant="outline"
              size="sm"
              className="text-neutral-300 border-neutral-600 hover:border-neutral-500 hover:text-white hover:bg-neutral-800"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}