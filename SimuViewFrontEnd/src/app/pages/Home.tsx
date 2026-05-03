import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, Plus, Briefcase, Calendar, ChevronRight, Loader2 } from "lucide-react";
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
    navigate("/setup");
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
        return 'Pending';
      case 1:
        return 'In Progress';
      case 2:
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans">
      {/* 复杂的背景装饰层 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-teal-500 opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        <Header showNav />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* 中部主卡片 */}
        <section className="mb-20 mt-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-800/60 backdrop-blur-xl p-12 shadow-2xl border border-white/5 group">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
              <div className="absolute top-10 right-20 w-4 h-4 rounded-full bg-emerald-400 animate-pulse"></div>
              <div className="absolute top-32 right-40 w-3 h-3 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-20 right-32 w-5 h-5 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  AI 驱动的智能面试系统
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    从容应对你的
                  </span>
                  <br />
                  <span className="text-white">下一次技术面试</span>
                </h1>
                <p className="text-lg text-slate-300 max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
                  通过高度真实的 AI 模拟面试提升您的面试技巧。获得量身定制的专属问题、实时语音交互以及专业的评估报告。
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={handleStartInterview}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-7 text-lg font-semibold rounded-2xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] transition-all hover:scale-105 active:scale-95"
                  >
                    立即开始练习
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-slate-600 text-neutral-300 hover:bg-slate-700 hover:text-white px-8 py-7 text-lg font-semibold rounded-2xl transition-all"
                  >
                    查看演示
                  </Button>
                </div>
              </div>

              {/* 装饰性图标区域 */}
              <div className="relative w-72 h-72 hidden lg:block perspective-1000">
                <div className="absolute inset-0 flex items-center justify-center transform-gpu hover:rotate-y-12 transition-transform duration-700">
                  <div className="w-56 h-56 rounded-[2rem] bg-gradient-to-br from-emerald-600/20 to-teal-600/20 flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-2xl">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        <Brain className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-white font-bold text-lg tracking-wide">AI 面试官</p>
                      <p className="text-emerald-300 text-sm font-medium mt-1">全维度智能评估</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 特性展示区 */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "智能职位解析", desc: "即时分析职位描述，为您生成高度相关的定制化面试问题。", icon: "🎯", color: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-400" },
              { title: "全真语音交互", desc: "提供实时语音识别和流畅的语音合成，带来自然专注的对话体验。", icon: "🎙️", color: "from-emerald-500/20 to-emerald-500/20", text: "text-emerald-400" },
              { title: "深度评估报告", desc: "获得关于您的面试表现、核心优势和改进方向的全面反馈及评分。", icon: "📊", color: "from-teal-500/20 to-pink-500/20", text: "text-teal-400" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-800/40 border border-white/5 rounded-3xl p-6 hover:bg-slate-700/40 transition-colors">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 border border-white/5`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 面试历史区域 */}
        <section className="relative">
          <div className="absolute -inset-x-6 -inset-y-6 bg-slate-800/30 blur-2xl -z-10 rounded-[3rem]"></div>
          
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-emerald-500" />
                你的面试旅程
              </h2>
              <p className="text-slate-300 mt-2">追踪您的面试进度和历史表现</p>
            </div>
            {hasInterviews && (
              <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full">
                查看全部 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          <div className="rounded-[2rem] bg-slate-800/60 border border-white/5 p-8 backdrop-blur-xl shadow-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <span className="text-slate-300 font-medium animate-pulse">正在加载您的历史记录...</span>
              </div>
            ) : hasInterviews ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interviews.map((interview) => (
                  <div
                    key={interview.interviewId}
                    onClick={() => navigate(`/interview-detail/${interview.interviewId}`)}
                    className="group bg-slate-700/40 rounded-3xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-slate-700/80 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border border-white/5 shadow-inner">
                        <Briefcase className="w-6 h-6 text-emerald-400" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        interview.status === 2 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        interview.status === 1 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-600 text-neutral-300'
                      }`}>
                        {getStatusText(interview.status)}
                      </span>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-300 transition-colors">模拟面试场次</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{formatDate(interview.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <div className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-600 text-[10px] font-bold">JD</div>
                          <span className="font-mono text-slate-400">#{interview.jdId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                  <button
                    onClick={handleStartInterview}
                    className="relative w-full h-full rounded-3xl bg-slate-700 border-2 border-dashed border-slate-500 flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-500/10 transition-all group cursor-pointer shadow-lg"
                  >
                    <Plus className="w-10 h-10 text-slate-300 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300" />
                  </button>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">暂无面试记录</h3>
                <p className="text-slate-300 max-w-md mb-8 leading-relaxed">
                  您的面试历史为空。立即开始您的第一次 AI 模拟面试，开启您的成功之旅。
                </p>
                <Button
                  onClick={handleStartInterview}
                  className="bg-white text-black hover:bg-neutral-200 px-8 py-6 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-xl"
                >
                  开启您的第一次面试
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}