import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, User, Lock, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import apiClient from "../api/apiClient";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/api/v1/user/register', {
        username: username,
        password: password,
        name: name
      });

      const data = response.data;

      if (response.status === 200 && data.success) {
        toast.success("Registration successful! Please login.");
        
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Registration failed';
        
        if (status === 400) {
          toast.error(message || "Invalid input");
        } else if (status === 409) {
          toast.error("Username already exists");
        } else {
          toast.error(message);
        }
      } else if (error.request) {
        toast.error("Network error, please try again later");
      } else {
        toast.error("An error occurred, please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-purple-600 shadow-lg shadow-green-500/20 mb-4">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SimuView</h1>
          <p className="text-neutral-400">AI-powered interview practice platform</p>
        </div>

        {/* 注册卡片 */}
        <div className="rounded-3xl bg-neutral-800/50 backdrop-blur-md border border-neutral-700/30 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Create Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-neutral-300 font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 pl-12 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* 姓名输入 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-300 font-medium">
                Name
              </Label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 pl-12 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-12 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* 确认密码 */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-neutral-300 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 pl-12 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* 注册按钮 */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Registering...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* 登录链接 */}
          <p className="text-center text-neutral-400 mt-8">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}