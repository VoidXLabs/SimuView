import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, Target, Mic, BarChart3, ChevronRight, ChevronLeft, Sparkles, Activity, FileSearch, Gauge, Radar as RadarIcon, Archive, Network, MessageSquare, AudioLines, Award, FileText, Play, Square, Github, ExternalLink, Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";
import apiClient from '../api/apiClient';
import { toast } from "sonner";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';

const radarData = [
  { subject: '逻辑思维', A: 120, fullMark: 150 },
  { subject: '沟通表达', A: 98, fullMark: 150 },
  { subject: '专业知识', A: 86, fullMark: 150 },
  { subject: '架构设计', A: 99, fullMark: 150 },
  { subject: '压力承受', A: 85, fullMark: 150 },
  { subject: '问题分析', A: 65, fullMark: 150 },
];

const HeroVisual = () => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      {/* 背景光晕 (Glow) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-600/10 blur-[120px] rounded-full animate-pulse-glow"></div>
      
      {/* 旋转同心圆/雷达扫描 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[110%] h-[110%] rounded-full border border-black/5 dark:border-white/5 animate-radar-spin opacity-20"></div>
        <div className="w-[85%] h-[85%] rounded-full border border-black/5 dark:border-white/5 animate-[radar-spin_15s_linear_infinite_reverse] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(34,211,238,0.1)_180deg,transparent_200deg)] animate-radar-spin rounded-full"></div>
      </div>

      {/* 核心卡片 */}
      <div className="relative z-10 w-72 h-96 bg-white/60 dark:bg-[#0a0a14]/60 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col group transition-all duration-700 hover:border-cyan-500/40">
        <div className="p-6 pb-2 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-500 animate-pulse"></div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-600/70 dark:text-cyan-500/70 uppercase">能力矩阵评估</span>
          </div>
          <Award className="w-4 h-4 text-black/20 dark:text-white/20" />
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-hidden">
          {activeTab === 0 && (
            <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-700">
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="currentColor" className="text-black/5 dark:text-white/5" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} className="text-slate-500 dark:text-slate-400" />
                    <Radar
                      name="Candidate"
                      dataKey="A"
                      stroke="#0891b2"
                      fill="#0891b2"
                      fillOpacity={0.3}
                      className="dark:stroke-cyan-400 dark:fill-cyan-400"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2 shrink-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white tracking-widest uppercase">能力图谱解析</span>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl rounded-tl-none mr-4">
                <p className="text-[10px] text-cyan-700/70 dark:text-cyan-300/70 font-mono mb-1">AI_SYSTEM_LOG:</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">正在分析您的架构设计逻辑...</p>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl rounded-tr-none ml-4 text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">STATUS:</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
                <p className="text-xs text-slate-900 dark:text-white">逻辑清晰，方案闭环</p>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl rounded-tl-none mr-4">
                <p className="text-xs text-slate-600 dark:text-slate-300">请深入阐述高并发下的优化策略。</p>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="w-full flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-110 duration-700">
              <div className="flex gap-1.5 items-center h-24">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-cyan-600 dark:bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                    style={{ 
                      height: `${Math.random() * 60 + 20}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <div className="mt-6 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <p className="text-[10px] font-mono tracking-[0.2em] text-cyan-700 dark:text-cyan-400 uppercase flex items-center gap-2">
                  <AudioLines className="w-3 h-3" /> 语音同步中...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${activeTab === i ? 'w-6 bg-cyan-600 dark:bg-cyan-500' : 'w-2 bg-black/10 dark:bg-white/10'}`}
            />
          ))}
        </div>
      </div>

      {/* 悬浮卫星组件 (Floating Badges) */}
      <div className="absolute top-10 right-[-20px] p-3 glass-card rounded-2xl animate-float backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <span className="text-xs font-bold text-slate-900 dark:text-white tracking-widest uppercase">React / TS</span>
        </div>
      </div>

      <div className="absolute bottom-20 left-[-40px] p-4 glass-card rounded-3xl animate-float-delayed backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">综合评分</span>
          <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">95.4</span>
        </div>
      </div>

      <div className="absolute top-[20%] left-[-20px] w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-sm flex items-center justify-center animate-float-delayed">
        <MessageSquare className="w-5 h-5 text-cyan-600/50 dark:text-cyan-500/50" />
      </div>
    </div>
  );
};

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

const InteractiveDemo = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('idle'); // idle, speaking, recording, analyzing, result
  
  const handleStart = () => {
    setStage('speaking');
    setTimeout(() => setStage('recording'), 3000);
  };

  const handleStop = () => {
    setStage('analyzing');
    setTimeout(() => setStage('result'), 2500);
  };

  const handleReset = () => {
    setStage('idle');
  };

  return (
    <section className="mt-32 mb-20 relative z-10 px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-wide mb-4">
          立即体验 AI 面试对练
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-light max-w-2xl mx-auto">
          无需注册，直接感受 AI 导师的专业引导与实时反馈
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden border border-black/10 dark:border-white/10 bg-white/40 dark:bg-[#0a0a14]/60 backdrop-blur-3xl shadow-2xl p-8 md:p-12">
          {/* 终端顶部按钮 */}
          <div className="absolute top-6 left-8 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
          </div>
          <div className="absolute top-6 right-8 text-[10px] font-mono text-slate-400 tracking-widest uppercase">
            实战沙盒 v1.0
          </div>

          <div className="mt-10 min-h-[350px] flex flex-col items-center justify-center space-y-8">
            {stage === 'idle' && (
              <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 text-cyan-500 fill-cyan-500 ml-1" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">准备好开始了吗？</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  AI 导师将向你提问，你可以通过语音进行回答（模拟）。
                </p>
                <Button 
                  onClick={handleStart}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-10 h-14 rounded-2xl font-black tracking-widest uppercase shadow-lg shadow-cyan-500/20"
                >
                  进入对练
                </Button>
              </div>
            )}

            {stage === 'speaking' && (
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/30">
                    <Brain className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div className="flex-1 p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl rounded-tl-none">
                    <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed italic">
                      "你好！欢迎来到 SimuView。假设你正在应聘一个高级前端开发岗位，请简单介绍一下你自己，并说说你最引以为傲的一个项目。"
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-cyan-600/70 dark:text-cyan-400/70 uppercase tracking-tighter">AI 正在播报...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stage === 'recording' && (
              <div className="flex flex-col items-center space-y-8 w-full animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                  <span className="text-xs font-mono text-rose-500 animate-pulse tracking-widest uppercase mb-2 block">正在录音...</span>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">请开始你的回答</h3>
                </div>
                
                <div className="flex items-end justify-center gap-1.5 h-24 w-full max-w-xs">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-cyan-500 rounded-full animate-wave shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                      style={{ 
                        height: `${Math.random() * 80 + 20}%`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>

                <Button 
                  onClick={handleStop}
                  className="bg-rose-500 hover:bg-rose-400 text-white px-10 h-14 rounded-2xl font-black tracking-widest uppercase shadow-lg shadow-rose-500/20 group"
                >
                  <Square className="w-4 h-4 mr-2 fill-white" />
                  完成回答
                </Button>
              </div>
            )}

            {stage === 'analyzing' && (
              <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-cyan-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-widest">智能分析中</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-mono">
                    DEP-ANALYSIS: LOGIC_CONSISTENCY, KEYWORD_EXTRACTION...
                  </p>
                </div>
              </div>
            )}

            {stage === 'result' && (
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Award className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">分析完成</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">💡 核心建议：</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        你的自我介绍逻辑清晰。但在描述“傲人项目”时，建议加入具体的 **STAR 法则**，特别是针对性能优化部分，若能提及具体的百分比提升，会更具说服力。
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: '逻辑思维', score: '85', color: 'cyan' },
                        { label: '专业表达', score: '92', color: 'indigo' },
                        { label: '自信度', score: '88', color: 'emerald' },
                      ].map(stat => (
                        <div key={stat.label} className="p-3 text-center rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">{stat.label}</p>
                          <p className="text-xl font-black text-slate-800 dark:text-white">{stat.score}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={handleReset}
                    className="rounded-xl px-8"
                  >
                    重新体验
                  </Button>
                  <Button 
                    onClick={() => navigate("/setup")}
                    className="bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl px-8 font-bold"
                  >
                    开启完整面试
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="relative z-10 mt-32 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#030014]/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-cyan-500" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">SimuView</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-light">
              下一代 AI 模拟面试平台。通过全场景语音对练与深度报告分析，助力每一位求职者在真实的面试中脱颖而出。
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/VoidXLabs/SimuView" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:contact@voidxlabs.com" className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">产品功能</h4>
            <ul className="space-y-4">
              {['模拟面试', '简历解析', '能力报告', '简历管理'].map((item) => (
                <li key={item}>
                  <button onClick={() => navigate(item === '简历管理' ? '/resumes' : '/setup')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-light">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">开发者资源</h4>
            <ul className="space-y-4">
              <li>
                <a href="https://github.com/VoidXLabs/SimuView" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-light">
                  GitHub 仓库 <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-light">更新日志</a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-light">技术架构</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">加入我们</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-4">
              SimuView 是一个开源项目，欢迎提交 PR 或 Issue。
            </p>
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
              <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-2">Build with Love</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light">探索 AI 与职业发展的无限可能。</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            © 2026 SimuView AI. Project of VoidX Labs.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">隐私政策</a>
            <a href="#" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">服务条款</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

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
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#030014] text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30 relative overflow-hidden font-sans">
      {/* 极光/深空背景特效 (Midnight Galaxy & Tech Innovation) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-100/30 dark:bg-cyan-900/20 blur-[150px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-100/20 dark:bg-blue-900/10 blur-[150px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#030014]/50 backdrop-blur-xl">
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
                <h3 className="text-cyan-400 font-bold text-xl tracking-wide">您有一个未完成的面试</h3>
                <p className="text-cyan-500/70 text-sm mt-1.5 font-light">
                  系统记录显示您有一个正在进行中的面试会话 (ID: #{activeSession.resolvedId})。
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
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative">
          {/* 背景大面积光斑 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-600/5 blur-[180px] rounded-full pointer-events-none z-0"></div>

          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-12 relative z-10">
            {/* 文字背后的专属高光 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.02)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[10px] font-black tracking-[0.3em] text-cyan-700 dark:text-cyan-200/60 uppercase">下一代 AI 矩阵</span>
            </div>
            
            <h1 className="flex flex-col items-center lg:items-start py-2">
              <div className="flex items-center gap-4 animate-reveal-stagger [animation-delay:200ms]">
                <div className="hidden lg:block w-12 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/20 to-slate-400 dark:to-white/40"></div>
                <span className="text-4xl lg:text-5xl font-light tracking-widest text-slate-500 dark:text-white/70 uppercase">
                  重塑你的
                </span>
              </div>
              <div className="relative mt-4 animate-reveal-stagger [animation-delay:500ms]">
                <span className="text-7xl lg:text-9xl font-black tracking-tighter leading-none bg-gradient-to-r from-cyan-600 via-blue-600 via-purple-600 to-cyan-600 dark:from-cyan-400 dark:via-blue-500 dark:via-purple-500 dark:to-cyan-400 bg-clip-text text-transparent animate-text-flow drop-shadow-[0_0_30px_rgba(34,211,238,0.2)] dark:drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                  面试体验
                </span>
                
                {/* 霓虹发光底色 */}
                <span className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 blur-3xl opacity-10 dark:opacity-20 animate-text-flow"></span>
                
                {/* 数字化扫描线效果 */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-cyan-500/10 dark:via-white/10 to-transparent animate-scan-line-horizontal"></div>
                  <div className="absolute top-0 bottom-0 w-[1px] bg-cyan-600/20 dark:bg-cyan-400/30 animate-scan-line-horizontal"></div>
                </div>
              </div>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400/80 max-w-xl leading-[1.8] font-light text-balance">
              告别面试前的焦虑与紧张。通过 <span className="text-slate-900 dark:text-white font-medium">1:1 还原真实场景</span> 的 AI 语音对练，
              深度剖析你的每一次作答，大幅提升 <span className="text-cyan-600 dark:text-cyan-400/80">Offer 命中率</span>。
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-6 w-full sm:w-auto">
              <Button
                onClick={handleStartInterview}
                className="relative group h-16 px-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-50 transition-all duration-500 overflow-hidden shadow-lg dark:shadow-[0_8px_30px_rgba(34,211,238,0.15)]"
              >
                <span className="relative z-10 flex items-center font-black text-lg tracking-widest uppercase">
                  立即开始模拟面试
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/my-interviews")}
                className="h-16 px-10 rounded-2xl border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/30 text-slate-900 dark:text-white font-bold text-lg backdrop-blur-xl transition-all duration-500"
              >
                查看我的面试报告
              </Button>
            </div>
          </div>

          {/* 右侧视觉元素 */}
          <div className="flex-1 w-full max-w-lg relative hidden lg:block z-10">
            <HeroVisual />
          </div>
        </div>

        {/* 核心矩阵 Bento Box */}
        <div className="mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]">
            {/* 1. 大主块 - 核心宣言 */}
            <div className="md:col-span-2 md:row-span-2 rounded-[2rem] bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-[#0a0a14] dark:to-cyan-950/30 border border-black/5 dark:border-white/10 p-8 lg:p-12 relative overflow-hidden group shadow-sm dark:shadow-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-cyan-400/20 transition-colors duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] group-hover:bg-purple-400/20 transition-colors duration-700"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/10 dark:shadow-cyan-500/20">
                    <Brain className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                    重新定义<br />AI 面试标准
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md leading-relaxed font-light">
                    不仅仅是一个题库，而是一个拥有逻辑思考与专业见解的数字面试导师。
                    通过多维度的表现分析，为您提供精准的实战反馈。
                  </p>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <div className="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 font-mono tracking-widest">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>SYSTEM ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 智能双向解析 */}
            <div className="rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 relative overflow-hidden group hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-black/10 dark:hover:border-white/10 transition-all duration-500 flex flex-col shadow-sm dark:shadow-none">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileSearch className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">智能双向解析</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light mt-auto">
                解析岗位 JD 与个人简历，自动提取核心考点，让面试准备更加有的放矢。
              </p>
              
              {/* 配图动画 */}
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-40 transition-opacity">
                <Network className="w-32 h-32 text-indigo-600 dark:text-indigo-400" strokeWidth={0.5} />
              </div>
            </div>

            {/* 3. 沉浸式语音流 */}
            <div className="rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 relative overflow-hidden group hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-black/10 dark:hover:border-white/10 transition-all duration-500 flex flex-col shadow-sm dark:shadow-none">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">沉浸式语音流</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light mt-auto">
                真实还原线上面试场景。全双工语音交互，体验真人般的自然对话感。
              </p>
              
              {/* 配图动画 */}
              <div className="absolute right-4 bottom-8 flex gap-1 items-end opacity-20 dark:opacity-30 group-hover:opacity-40 dark:group-hover:opacity-60 transition-opacity">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce" style={{ height: `${Math.random() * 24 + 8}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>

            {/* 4. 专业级诊断 */}
            <div className="rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 relative overflow-hidden group hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-black/10 dark:hover:border-white/10 transition-all duration-500 flex flex-col shadow-sm dark:shadow-none">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Gauge className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">专业级诊断</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light mt-auto">
                自动生成包含能力雷达图、薄弱点剖析及改进建议，让每一次练习都有收获。
              </p>
              
              {/* 配图动画 */}
              <div className="absolute -right-4 -bottom-4 w-28 h-28 border-[8px] border-rose-500/5 dark:border-rose-500/10 rounded-full border-t-rose-500/20 dark:border-t-rose-500/40 rotate-45 group-hover:rotate-[225deg] transition-transform duration-1000"></div>
            </div>

            {/* 5. 专家回复范例 */}
            <div className="rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 relative overflow-hidden group hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-black/10 dark:hover:border-white/10 transition-all duration-500 flex flex-col shadow-sm dark:shadow-none">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <RadarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">多维实战模拟</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light mt-auto">
                从温柔引导到高压挑战。自定义面试风格，精准匹配您的训练强度需求。
              </p>
              
              {/* 配图动画 */}
              <div className="absolute right-2 bottom-2 w-24 h-24 border border-blue-500/10 dark:border-blue-400/20 rounded-full opacity-40 dark:opacity-50 group-hover:opacity-60 dark:group-hover:opacity-100 flex items-center justify-center">
                 <div className="w-16 h-16 border border-blue-500/20 dark:border-blue-400/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500/20 dark:bg-blue-400/10 rounded-full animate-ping"></div>
                 </div>
              </div>
            </div>

            {/* 6. 简历管理 - 新增模块 */}
            <div 
              onClick={() => navigate("/resumes")}
              className="md:col-span-1 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-8 relative overflow-hidden group hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-black/10 dark:hover:border-white/10 transition-all duration-500 flex flex-col shadow-sm dark:shadow-none cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">简历资产管理</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light mt-auto">
                集中管理您的多份简历，支持一键上传与解析，为不同岗位准备最合适的自己。
              </p>
            </div>

            {/* 7. 长条块 - 云端面试档案 */}
            <div className="md:col-span-2 lg:col-span-3 rounded-[2rem] bg-gradient-to-r from-black/[0.01] to-transparent dark:from-white/[0.02] dark:to-transparent border border-black/5 dark:border-white/5 p-8 md:p-10 relative overflow-hidden group hover:bg-black/[0.02] dark:hover:bg-white/[0.04] hover:border-black/10 dark:hover:border-white/10 transition-all duration-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm dark:shadow-none">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Archive className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">面试历史记录</h3>
                <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-light max-w-2xl">
                  系统自动保存您的面试会话，随时回溯复盘。记录您的每一次进步，见证从面试小白到拿到 Offer 的蜕变。
                </p>
              </div>
              
              <div className="shrink-0 flex gap-4 w-full md:w-auto overflow-hidden opacity-30 dark:opacity-50 group-hover:opacity-60 dark:group-hover:opacity-100 transition-opacity">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-32 h-20 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 transform group-hover:-translate-y-2 transition-transform" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="w-1/2 h-2 bg-black/10 dark:bg-white/20 rounded-full mb-2"></div>
                    <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full mb-1"></div>
                    <div className="w-3/4 h-1.5 bg-black/5 dark:bg-white/10 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 操作导引轮播 (Guide Carousel) */}
        <div className="mt-32 mb-10 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-wide mb-4">简单三步，开启对练</h2>
            <p className="text-slate-500 dark:text-slate-400 font-light">只需简单设置，即可获得专业的面试体验</p>
          </div>
          
          <div className="relative w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a14] backdrop-blur-xl shadow-2xl h-[500px] md:h-[600px] lg:h-[750px]">

            {guideSlides.map((slide, idx) => (
              <div 
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col justify-between ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 dark:from-[#0a0a14] dark:via-[#0a0a14]/40 to-transparent z-10"></div>
                  
                  <div className="absolute bottom-10 left-8 right-8 z-20 text-center">
                     <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-widest backdrop-blur-md">步骤 {slide.id}</span>
                     <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-wide">{slide.title}</h3>
                     <p className="text-slate-600 dark:text-slate-300 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed">{slide.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* 左右控制箭头 */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + guideSlides.length) % guideSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-black/60 hover:scale-110 backdrop-blur-md transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % guideSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-black/60 hover:scale-110 backdrop-blur-md transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* 底部点状指示器 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {guideSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]' : 'w-2 bg-black/10 dark:bg-white/20 hover:bg-black/20 dark:hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 互动演示 (Interactive Demo) */}
        <InteractiveDemo />

        {/* 常见问题解答 (FAQ) */}
        <div className="mt-32 mb-20 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-wide mb-4">常见问题解答</h2>
            <p className="text-slate-500 dark:text-slate-400 font-light">如果您还有其他疑问，欢迎随时探索更多功能</p>
          </div>

          <div className="max-w-5xl mx-auto space-y-4">
            <FAQItem 
              question="这个平台是如何工作的？" 
              answer="SimuView 通过分析您提供的简历和职位描述（JD），利用大语言模型生成针对性的面试问题。您可以进行实时的语音对练，系统会根据您的回答给出多维度的评估和改进建议。" 
            />
            <FAQItem 
              question="AI 面试的评估准确吗？" 
              answer="我们的 AI 引擎基于海量面试案例和行业标准构建，能够捕捉逻辑、表达和专业知识等多个维度的表现。它在模拟真实场景和发现潜在弱点方面非常高效，是您面试前的得力助手。" 
            />
            <FAQItem 
              question="支持哪些岗位的面试？" 
              answer="由于我们采用了动态解析技术，只要您提供相应的职位描述（JD），平台可以支持包括技术、管理、产品、市场在内的几乎所有岗位。" 
            />
            <FAQItem 
              question="我的隐私数据安全吗？" 
              answer="我们非常重视用户隐私。您的简历和面试记录仅用于生成个性化的面试体验，数据经过加密处理，不会泄露给任何第三方。" 
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-2xl border transition-all duration-500 overflow-hidden ${isOpen ? 'bg-black/[0.02] dark:bg-white/[0.05] border-black/10 dark:border-white/20 shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'bg-black/[0.01] dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left group"
      >
        <span className={`text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{question}</span>
        <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-90 text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
      </button>
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 pt-0 text-slate-500 dark:text-slate-400 font-light leading-relaxed border-t border-black/5 dark:border-white/5 mt-1 pt-4">
          {answer}
        </div>
      </div>
    </div>
  );
}
