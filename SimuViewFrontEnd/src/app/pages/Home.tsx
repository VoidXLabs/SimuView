import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, Target, Mic, BarChart3, ChevronRight, ChevronLeft, Sparkles, Activity, FileSearch, Gauge, Radar, Archive, Network } from "lucide-react";
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
  const [activeSession, setActiveSession] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const guideSlides = [
    { id: 1, image: "/img/step_1_insert_information.png", title: "导入数据档案", desc: "解析简历与目标职位描述 (JD)，为您量身定制面试题库" },
    { id: 2, image: "/img/step_2_interview.png", title: "全息语音交互", desc: "沉浸式拟真对答演练，直面高压核心问题，实时语音识别" },
    { id: 3, image: "/img/step_3_chek_report.png", title: "量化评估报告", desc: "生成多维度能力图谱，精准复盘每次表现，助力快速提升" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % guideSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [guideSlides.length]);

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
      const records = data.data?.records || data.data?.content || data.data?.list || [];
      if (data.success && records.length > 0) {
        setInterviews(records);
        
        // 自动检查最近的面试的状态
        const latest = records[0];
        const latestId = latest.interviewId || latest.id || latest.sessionId;
        
        if (latestId) {
          try {
            const statusRes = await apiClient.get(`/api/v1/sessions/${latestId}/status`);
            const statusData = statusRes.data?.data;
            const status = statusData?.status;
            
            // 如果最新会话不是已评估/失败等结束状态，则弹窗提示继续
            if (status && status !== 'EVALUATED' && status !== 'COMPLETED' && status !== 'EVALUATION_FAILED') {
              setActiveSession({
                ...latest,
                resolvedId: latestId
              });
            }
          } catch (e) {
            console.error("检查最近会话状态失败", e);
          }
        }
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
        {/* 未完成会话提示栏 */}
        {activeSession && (
          <div className="mb-12 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Activity className="w-7 h-7 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-cyan-400 font-bold text-xl tracking-wide">检测到活跃中的神经链接</h3>
                <p className="text-cyan-500/70 text-sm mt-1.5 font-light">
                  系统记录显示您有一个未完成的面试会话 (标识码: #{activeSession.resolvedId})。
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/interview", { state: { sessionId: activeSession.resolvedId, jdId: activeSession.jdId, resumeId: activeSession.resumeId } })}
              className="bg-cyan-500 text-black hover:bg-cyan-400 font-black px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] tracking-widest uppercase"
            >
              继续面试
            </Button>
          </div>
        )}

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

        {/* 核心矩阵 Bento Box */}
        <div className="mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]">
            {/* 1. 大主块 - 核心宣言 */}
            <div className="md:col-span-2 md:row-span-2 rounded-[2rem] bg-gradient-to-br from-[#0a0a14] to-cyan-950/30 border border-white/10 p-8 lg:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-cyan-400/20 transition-colors duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] group-hover:bg-purple-400/20 transition-colors duration-700"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/20">
                    <Brain className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                    重新定义<br />AI 面试标准
                  </h2>
                  <p className="text-slate-400 text-lg max-w-md leading-relaxed font-light">
                    不仅仅是一个题库，而是一个拥有逻辑思考与情绪感知的数字孪生导师。
                    通过全链路的数据流转，打破传统面试的局限，深度挖掘你的真实潜力。
                  </p>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <div className="flex items-center gap-2 text-sm text-cyan-400 font-mono tracking-widest">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>SYSTEM ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 智能双向解析 */}
            <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 relative overflow-hidden group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileSearch className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">智能双向解析</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light mt-auto">
                导入岗位 JD 与个人简历，毫秒级提取核心考点，告别千篇一律的通用题库。
              </p>
              
              {/* 配图动画 */}
              <div className="absolute right-[-20px] bottom-[-20px] opacity-20 group-hover:opacity-40 transition-opacity">
                <Network className="w-32 h-32 text-indigo-400" strokeWidth={0.5} />
              </div>
            </div>

            {/* 3. 沉浸式语音流 */}
            <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 relative overflow-hidden group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">沉浸式语音流</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light mt-auto">
                真实还原线上面试场景。全双工语音交互，体验真人般的交互压迫感。
              </p>
              
              {/* 配图动画 */}
              <div className="absolute right-4 bottom-8 flex gap-1 items-end opacity-30 group-hover:opacity-60 transition-opacity">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 bg-cyan-400 rounded-full animate-bounce" style={{ height: `${Math.random() * 24 + 8}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>

            {/* 4. 多维压力场 */}
            <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 relative overflow-hidden group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Gauge className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">多维压力场</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light mt-auto">
                温和引导、标准校准、极致高压。自定义 AI 严苛程度，匹配不同训练需求。
              </p>
              
              {/* 配图动画 */}
              <div className="absolute -right-4 -bottom-4 w-28 h-28 border-[8px] border-rose-500/10 rounded-full border-t-rose-500/40 rotate-45 group-hover:rotate-[225deg] transition-transform duration-1000"></div>
            </div>

            {/* 5. 专家级诊断流 */}
            <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 relative overflow-hidden group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Radar className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">专家级诊断流</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light mt-auto">
                拒绝只打分不指导。自动生成包含能力雷达图、薄弱点剖析及高分回答范例。
              </p>
              
              {/* 配图动画 */}
              <div className="absolute right-2 bottom-2 w-24 h-24 border border-blue-400/20 rounded-full opacity-50 group-hover:opacity-100 flex items-center justify-center">
                 <div className="w-16 h-16 border border-blue-400/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-400/10 rounded-full animate-ping"></div>
                 </div>
              </div>
            </div>

            {/* 6. 长条块 - 云端面试档案 */}
            <div className="md:col-span-2 lg:col-span-4 rounded-[2rem] bg-gradient-to-r from-white/[0.02] to-transparent border border-white/5 p-8 md:p-10 relative overflow-hidden group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Archive className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">云端面试档案</h3>
                <p className="text-slate-400 text-base leading-relaxed font-light max-w-2xl">
                  系统自动归档历史会话，随时回溯过往表现，见证每一次能力进阶。你的个人面霸成长史，每一行代码、每一次发音都被安全记录。
                </p>
              </div>
              
              <div className="shrink-0 flex gap-4 w-full md:w-auto overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-32 h-20 rounded-lg bg-white/5 border border-white/10 p-3 transform group-hover:-translate-y-2 transition-transform" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="w-1/2 h-2 bg-white/20 rounded-full mb-2"></div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mb-1"></div>
                    <div className="w-3/4 h-1.5 bg-white/10 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 操作导引轮播 (Guide Carousel) */}
        <div className="mt-32 mb-10 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-wide mb-4">核心作业流程</h2>
            <p className="text-slate-400 font-light">只需简单三步，重塑你的面试状态</p>
          </div>
          
          <div className="relative w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0a14] backdrop-blur-xl shadow-2xl h-[500px] md:h-[600px] lg:h-[750px]">

            {guideSlides.map((slide, idx) => (
              <div 
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col justify-between ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover md:object-contain opacity-50 md:opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/60 to-transparent z-10"></div>
                  
                  <div className="absolute bottom-10 left-8 right-8 z-20 text-center">
                     <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest backdrop-blur-md">STEP {slide.id}</span>
                     <h3 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-wide">{slide.title}</h3>
                     <p className="text-slate-300 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed">{slide.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* 左右控制箭头 */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + guideSlides.length) % guideSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 border border-white/10 text-white/50 hover:text-white hover:bg-black/60 hover:scale-110 backdrop-blur-md transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % guideSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 border border-white/10 text-white/50 hover:text-white hover:bg-black/60 hover:scale-110 backdrop-blur-md transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* 底部点状指示器 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {guideSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
