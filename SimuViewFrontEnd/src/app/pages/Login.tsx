import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, Github, Linkedin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import apiClient from "../api/apiClient";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState("");
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
    
    if (!email || !password) {
      toast.error("Please fill in both email and password");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email: email,
        password: password
      });

      const data = response.data;

      if (response.status === 200 && data.success) {
        if (data.data) {
          setUser(data.data);
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
          toast.error("Invalid email or password");
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
    setEmail("demo@example.com");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 mb-4">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SimuView</h1>
          <p className="text-neutral-400">AI-powered interview practice platform</p>
        </div>

        {/* 登录卡片 */}
        <div className="rounded-3xl bg-neutral-800/50 backdrop-blur-md border border-neutral-700/30 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* 邮箱输入 */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-12 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-neutral-300 font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-12 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
                {showPassword ? (
                  <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 cursor-pointer" />
                ) : (
                  <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 cursor-pointer" />
                )}
              </div>
            </div>

            {/* 记住我和忘记密码 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-blue-500 focus:ring-blue-500/20"
                />
                <span className="text-sm text-neutral-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* 分隔线 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-neutral-800 text-neutral-400">Or continue with</span>
            </div>
          </div>

          {/* 注册链接 */}
          <p className="text-center text-neutral-400 mt-8">
            Don't have an account?{" "}
            <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign up
            </button>
          </p>

          {/* 演示账号提示 */}
          <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300">
              <span className="font-semibold">Demo Account: </span>
              <button
                onClick={handleDemoLogin}
                className="text-blue-400 hover:text-blue-300 ml-1 underline underline-offset-2"
              >
                Fill demo credentials
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}