import { useState } from "react";
import { useNavigate } from "react-router";
import { Brain, User, Lock, Mail, ArrowRight, Github, Linkedin, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-6 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
        <div className="absolute right-1/4 bottom-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-teal-500 opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-6">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Join SimuView</h1>
          <p className="text-slate-300 font-medium">Start your AI-powered interview journey</p>
        </div>

        <div className="rounded-[2.5rem] bg-slate-800/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50"></div>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-neutral-300 font-bold ml-1">Username</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-14 pl-12 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:border-emerald-500 focus:ring-0 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300 font-bold ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:border-emerald-500 focus:ring-0 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300 font-bold ml-1">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:border-emerald-500 focus:ring-0 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-white text-black hover:bg-neutral-200 font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? "Creating Account..." : "Create Free Account"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 font-medium">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors ml-1"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}