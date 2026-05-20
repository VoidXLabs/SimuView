import { useState } from "react";
import { useNavigate } from "react-router";
import { Brain, User, Lock, Mail, ArrowRight, Eye, EyeOff, Network } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import apiClient from "../api/apiClient";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/api/v1/user/register', {
        username: username,
        email: email,
        password: password,
        name: username // For now using username as name
      });

      if (response.data.success) {
        toast.success("Account created successfully! Please login.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 relative overflow-hidden flex items-center justify-center p-6 font-sans selection:bg-cyan-500/30">
      {/* 极光背景特效 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px] mix-blend-screen animate-[pulse_12s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[150px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.10]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] mb-6 backdrop-blur-xl">
            <Network className="h-7 w-7 text-purple-400" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">注册账号</h1>
          <p className="text-slate-400 font-light tracking-wide">加入 SimuView，开启您的 AI 模拟面试之旅</p>
        </div>

        <div className="rounded-[2rem] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-slate-300 font-semibold text-xs uppercase tracking-widest ml-1">
                用户名
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="username"
                  placeholder="请输入您的用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-14 pl-12 bg-[#030014]/50 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-slate-300 font-semibold text-xs uppercase tracking-widest ml-1">
                邮箱地址
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 bg-[#030014]/50 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-slate-300 font-semibold text-xs uppercase tracking-widest ml-1">
                设置密码
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请设置您的登录密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 pr-12 bg-[#030014]/50 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-white text-black hover:bg-slate-200 disabled:bg-white/10 disabled:text-slate-500 font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden text-base tracking-widest uppercase"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      正在注册...
                    </>
                  ) : (
                    <>
                      立即注册
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-slate-500 text-sm font-light">
              已有账号？{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-purple-400 hover:text-purple-300 font-bold tracking-wide transition-colors uppercase ml-1"
              >
                立即登录
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}