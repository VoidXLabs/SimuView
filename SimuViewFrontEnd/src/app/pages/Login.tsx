import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, User, Lock, Eye, EyeOff, ArrowRight, Github, Linkedin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import apiClient from "../api/apiClient";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Please fill in both username and password");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/api/v1/user/login', {
        username: username,
        password: password
      });

      const data = response.data;

      if (response.status === 200 && data.success) {
        if (data.data) {
          setUser({
            id: String(data.data.userId),
            email: data.data.username,
            name: data.data.name
          });
          // 保存 token 到 localStorage
          if (data.data.token) {
            localStorage.setItem('token', data.data.token);
          }
        }

        toast.success("Login successful!");
        
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Login failed';
        
        if (status === 401) {
          toast.error("Invalid username or password");
        } else if (status === 403) {
          toast.error("Account is disabled");
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

  const handleDemoLogin = () => {
    setUsername("demo");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex items-center justify-center p-6">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 mb-4">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SimuView</h1>
          <p className="text-slate-300">AI 驱动的面试练习平台</p>
        </div>

        {/* 登录卡片 */}
        <div className="rounded-3xl bg-slate-700/50 backdrop-blur-md border border-slate-600/30 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            欢迎回来
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-neutral-300 font-medium">
                用户名
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入您的用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 pl-12 bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-neutral-300 font-medium">
                  密码
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {showPassword ? "隐藏" : "显示"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-12 bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                {showPassword ? (
                  <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer" />
                ) : (
                  <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer" />
                )}
              </div>
            </div>

            {/* 记住我和忘记密码 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span className="text-sm text-slate-300">记住我</span>
              </label>
              <button
                type="button"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                忘记密码？
              </button>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  登录中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  登录
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* 分隔线 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-500"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-700 text-slate-300">或通过以下方式继续</span>
            </div>
          </div>

          {/* 社交登录按钮 */}
          {/* <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 border-slate-500 hover:border-slate-400 hover:bg-slate-600/50 text-white"
            >
              <Github className="mr-3 w-5 h-5" />
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 border-slate-500 hover:border-slate-400 hover:bg-slate-600/50 text-white"
            >
              <Linkedin className="mr-3 w-5 h-5" />
              Continue with LinkedIn
            </Button>
          </div> */}

          {/* 注册链接 */}
          <p className="text-center text-slate-300 mt-8">
            还没有账号？{" "}
            <button 
              onClick={() => navigate("/register")}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              立即注册
            </button>
          </p>

          {/* 演示账号提示 */}
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-sm text-emerald-300">
              <span className="font-semibold">演示账号：</span>
              <button
                onClick={handleDemoLogin}
                className="text-emerald-400 hover:text-emerald-300 ml-1 underline underline-offset-2"
              >
                一键填充测试凭据
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}