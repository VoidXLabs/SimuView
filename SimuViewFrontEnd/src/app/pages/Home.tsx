import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, Target, Mic, BarChart3, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";
import apiClient from '../api/apiClient';
import { toast } from "sonner";

// 面试记录类型定义
interface InterviewRecord {
  interviewId: number;
  userId: number;
  jdId: number;
  resumeId: number;
  status: number;
  startTime: string;
  endTime: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取用户ID
  const getUserId = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || null;
    }
    return null;
  };

  // 查询面试记录
  const fetchInterviewRecords = async () => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/interview-records/page', {
        userId: parseInt(userId),
        pageNum: 1,
        pageSize: 10
      });

      const data = response.data;
      if (data.success && data.data?.records) {
        setInterviews(data.data.records);
      }
    } catch (error: any) {
      console.error("Failed to fetch interview records", error);
      toast.error(error.response?.data?.message || "Failed to load interview history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewRecords();
  }, []);

  const hasInterviews = interviews.length > 0;

  const handleStartInterview = () => {
    if (!getUserId()) {
      navigate("/login");
    } else {
      navigate("/setup");
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // 获取状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return '待处理';
      case 1:
        return '进行中';
      case 2:
        return '已完成';
      default:
        return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 selection:bg-cyan-500/30 relative overflow-hidden font-sans">
      {/* 极光/深空背景特效 (Midnight Galaxy & Tech Innovation) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[150px] mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl">
        <Header showNav />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        {/* 英雄区域 (Hero) */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium tracking-wide text-cyan-200">下一代 AI 面试引擎</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[1.1]">
              <span className="text-white">重塑你的</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                面试体验
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-400 max-w-2xl leading-relaxed font-light">
              沉浸式 AI 模拟面试，结合深度职位解析与实时语音交互。
              在星辰大海般的挑战中，精准定位你的核心竞争力。
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4 w-full sm:w-auto">
              <Button
                onClick={handleStartInterview}
                className="relative group h-14 px-8 rounded-full bg-white text-black hover:bg-slate-200 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center font-bold text-lg">
                  开启智能模拟
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
              <Button
                variant="outline"
                className="h-14 px-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-lg backdrop-blur-md transition-all duration-300"
              >
                查看分析报告
              </Button>
            </div>
          </div>

          {/* 右侧视觉元素 */}
          <div className="flex-1 w-full max-w-lg relative hidden lg:block">
            <div className="relative aspect-square">
              {/* 光晕与旋转边框 */}
              <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-3xl animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute inset-8 rounded-full border border-dashed border-white/20 animate-[spin_40s_linear_infinite_reverse]"></div>
              <div className="absolute inset-16 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 blur-2xl animate-pulse"></div>
              
              {/* 核心卡片 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-80 bg-[#0a0a14]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 flex flex-col transform transition-transform hover:scale-105 duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI 智能评估</h3>
                  <p className="text-sm text-slate-400 mb-auto">深度解析你的每一个回答，构建多维度的能力图谱。</p>
                  
                  <div className="space-y-3 mt-6">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-[85%] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[62%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 w-[90%] rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 特性展示区 (Features) */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { title: "精准 JD 匹配", desc: "极速解构职位要求，生成直击痛点的高频面试题", icon: Target, color: "text-cyan-400", shadow: "shadow-cyan-500/20" },
            { title: "拟真语音对白", desc: "超低延迟语音交互，还原高压真实的线上面试场景", icon: Mic, color: "text-purple-400", shadow: "shadow-purple-500/20" },
            { title: "全息雷达诊断", desc: "全景式能力评测报告，指出核心短板与制胜优势", icon: BarChart3, color: "text-blue-400", shadow: "shadow-blue-500/20" }
          ].map((feature, idx) => (
            <div key={idx} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg ${feature.shadow}`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed font-light relative z-10">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
