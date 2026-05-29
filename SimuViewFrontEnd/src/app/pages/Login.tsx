import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Brain, User, Lock, Eye, EyeOff, ArrowRight, Network } from "lucide-react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Algorithmic Art Background: Emergent Synapses
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        initParticles();
      }
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        if (!canvas) throw new Error("Canvas not initialized");
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.radius = Math.random() * 1.5 + 0.5;
      }

      update() {
        if (!canvas) return;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.6)'; // purple-500
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      if (!canvas) return;
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Gradient cyan to transparent based on distance
            const opacity = 1 - dist / 120;
            ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.4})`; // cyan-400
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#030014] text-slate-900 dark:text-slate-200 font-sans flex selection:bg-cyan-500/30 transition-colors duration-300">
      {/* 左侧登录表单区 */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 relative z-10">
        
        {/* 背景光效 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/20 dark:bg-purple-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-100/20 dark:bg-cyan-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] dark:opacity-[0.10]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[0_0_20px_rgba(34,211,238,0.15)] mb-6 backdrop-blur-xl">
              <Network className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">登录 SimuView</h1>
            <p className="text-slate-500 dark:text-slate-400 font-light tracking-wide">AI 驱动的智能模拟面试平台</p>
          </div>

          {/* 登录表单 */}
          <div className="rounded-[2rem] bg-white/80 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 shadow-2xl dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {/* 用户名 */}
              <div className="space-y-3">
                <Label htmlFor="username" className="text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-widest ml-1">
                  账号 / 用户名
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入您的账号"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 pl-12 bg-slate-50 dark:bg-[#030014]/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-2xl focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>

              {/* 密码 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-widest">
                    密码
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors font-medium tracking-wide"
                  >
                    忘记密码？
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入您的密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-slate-50 dark:bg-[#030014]/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-2xl focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 outline-none"
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/5 peer-checked:bg-cyan-500 peer-checked:border-cyan-500 dark:peer-checked:border-cyan-400 transition-all flex items-center justify-center">
                      <svg className="w-3 h-3 text-white dark:text-[#030014] opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">记住我</span>
                </label>
              </div>

              {/* 登录按钮 */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 mt-4 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 disabled:bg-slate-200 dark:disabled:bg-white/10 disabled:text-slate-400 dark:disabled:text-slate-500 font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden text-base tracking-widest uppercase"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                      正在登录...
                    </>
                  ) : (
                    <>
                      立即登录
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </Button>
            </form>

            {/* 注册链接 */}
            <div className="mt-8 text-center">
              <span className="text-slate-500 text-sm">还没有账号？ </span>
              <button 
                onClick={() => navigate("/register")}
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-bold text-sm tracking-wide transition-colors uppercase"
              >
                立即注册
              </button>
            </div>

            {/* 演示账号提示 */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono bg-slate-50 dark:bg-[#030014]/50 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <span>// 测试环境覆盖</span>
                <button
                  onClick={handleDemoLogin}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors uppercase font-bold tracking-widest"
                >
                  [ 注入演示数据 ]
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧动态算法背景区 */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-100 dark:bg-[#05030f] border-l border-slate-200 dark:border-white/5 items-center justify-center">
        {/* Canvas 动画 */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        
        {/* 蒙层与光晕 */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 dark:from-[#030014] via-transparent to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,#030014_100%)] z-10 pointer-events-none opacity-80"></div>
        
        {/* 叠加文字层 */}
        <div className="relative z-20 max-w-lg text-center p-8">
          <div className="inline-block border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-6">
            <span className="text-cyan-600 dark:text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] font-bold">Algorithmic Emergence</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-wide leading-snug">
            神经网络晶化中...
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed text-sm">
            这不仅仅是随机散布的粒子，这是遵循欧几里得距离阈值动态生长的突触。
            每一次连线，都在隐喻候选人能力图谱与职位模型的精确匹配与共鸣。
          </p>
        </div>
      </div>
    </div>
  );
}