import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon, Loader2, CheckCircle2, Sparkles, FileText, Edit3, Network, Fingerprint, Activity, Zap, Cpu, Search, AlertTriangle, ShieldCheck, FileSearch, ListChecks } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Header } from "../components/Header";
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../api/apiClient';
import { toast } from "sonner";

const VisualizationHub = ({ state, data }: { state: string, data: any }) => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    if (state === 'parsing_url') {
      const pLogs = [
        "> 正在连接目标站点... 成功",
        "> 正在提取职位描述... 成功",
        "> 正在解析薪资结构...",
        "> 正在构建能力图谱...",
        "> 提取完成，进入待机状态"
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < pLogs.length) {
          setLogs(prev => [...prev.slice(-3), pLogs[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 800);
      return () => clearInterval(interval);
    } else if (state === 'analyzing_jd') {
      const aLogs = [
        "> 语义引擎启动...",
        "> 正在过滤无关词汇...",
        "> 提炼核心架构要求...",
        "> 识别关键技术栈...",
        "> 分析完成：匹配度预备"
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < aLogs.length) {
          setLogs(prev => [...prev.slice(-3), aLogs[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setLogs([]);
    }
  }, [state]);

  const renderContent = () => {
    switch (state) {
      case 'parsing_url':
      case 'analyzing_jd':
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Processing...</span>
              </div>
              <Cpu className="w-4 h-4 text-emerald-500/50" />
            </div>
            
            <div className="flex-1 relative border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden mb-6 p-4">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/4 w-full animate-scan-v z-10"></div>
              <div className="space-y-2 opacity-20 blur-[1px]">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-2 bg-white/10 rounded-full" style={{ width: `${Math.random() * 50 + 40}%` }}></div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col gap-2 p-6 justify-center items-center">
                {state === 'parsing_url' && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Java架构', '高并发', 'MySQL', '分布式', '消息中间件'].map((skill, i) => (
                      <div key={i} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-[10px] text-cyan-400 font-bold animate-in zoom-in duration-500" style={{ animationDelay: `${i * 200}ms` }}>
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] text-emerald-500/70 space-y-1">
              {logs.map((log, i) => <div key={i} className="animate-in slide-in-from-left-2">{log}</div>)}
            </div>
          </div>
        );

      case 'typing_jd':
        return (
          <div className="h-full flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl animate-pulse"></div>
              <Edit3 className="w-16 h-16 text-cyan-400 relative z-10" strokeWidth={1} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white tracking-tight">正在输入岗位信息</h3>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-mono">User Terminal Inputting...</p>
            </div>
            <div className="text-4xl font-black text-cyan-400 font-mono">
              {data.wordCount}
              <span className="text-[10px] text-slate-600 ml-2 uppercase tracking-tighter">Characters</span>
            </div>
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-10 h-1 bg-cyan-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400/40 animate-[progress-indeterminate_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.2}s` }}></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'uploading_resume':
        return (
          <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="absolute inset-0 border border-purple-500/30 rounded-full animate-radar-pulse" style={{ animationDelay: `${i * 0.6}s` }}></div>
              ))}
              <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <FileSearch className="w-10 h-10 text-purple-400" />
              </div>
            </div>
            <div className="w-full bg-black/40 rounded-xl p-4 h-32 overflow-hidden relative scanning-mask">
              <div className="animate-text-scroll-up font-mono text-[8px] text-purple-500/40 space-y-1">
                {[...Array(20)].map((_, i) => (
                  <div key={i}>0x{Math.random().toString(16).slice(2, 10).toUpperCase()} - EXTRACTING_FRAGMENT_DATA_LOAD_0{i}</div>
                ))}
              </div>
            </div>
            <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest animate-pulse">Scanning Bio-Profile...</p>
          </div>
        );

      case 'resume_ready':
        return (
          <div className="h-full flex flex-col p-4 animate-in fade-in duration-700">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">简历解析完成</span>
                <span className="text-[9px] text-emerald-500/60 font-mono">RESUME DECODED SUCCESS</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center space-y-10">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray="502.4"
                    strokeDashoffset="502.4"
                    style={{ '--offset': `${502.4 - (502.4 * 0.85)}` } as any}
                    className="text-cyan-400 animate-progress-circle" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">85%</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Match Rate</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[10px] text-rose-300 font-bold uppercase tracking-tight">缺失技能：微服务治理经验</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-tight">优势项：深度垂直技术沉淀</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'hover_mode':
        const modeParams = [
          { depth: 40, stress: 20, guide: 90 },
          { depth: 75, stress: 55, guide: 50 },
          { depth: 95, stress: 90, guide: 10 },
        ][data.style];
        return (
          <div className="h-full flex flex-col p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-wider">模式参数校准</h3>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>技术深度考查</span>
                  <span className="text-white">{modeParams.depth}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 transition-all duration-700 ease-out" style={{ width: `${modeParams.depth}%` }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>压力抗性测试</span>
                  <span className="text-white">{modeParams.stress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-700 ease-out" style={{ width: `${modeParams.stress}%` }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>引导式提示</span>
                  <span className="text-white">{modeParams.guide}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${modeParams.guide}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] text-slate-400 italic leading-relaxed">
              {data.style === 0 ? "系统将扮演和蔼的前辈，侧重于引导您发挥出真实水平。" : 
               data.style === 1 ? "标准企业面试场景，全维度考核技术能力与职场软技能。" :
               "极致的高压测试环境，系统会不断挑战您的技术边界与情绪稳定性。"}
            </div>
          </div>
        );

      case 'checklist':
        const isAllDone = data.isJdReady && data.isResumeReady;
        return (
          <div className="h-full flex flex-col p-6 animate-in fade-in duration-1000">
            <div className="flex items-center gap-3 mb-10">
              <ListChecks className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-wider">准备工作就绪度</h3>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className={`p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between ${data.isJdReady ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.isJdReady ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    <Network className="w-5 h-5" />
                  </div>
                  <span className={`font-bold text-sm tracking-widest uppercase ${data.isJdReady ? 'text-white' : 'text-slate-500'}`}>1. 解析岗位信息</span>
                </div>
                {data.isJdReady && <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in zoom-in" />}
              </div>

              <div className={`p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between ${data.isResumeReady ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.isResumeReady ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <span className={`font-bold text-sm tracking-widest uppercase ${data.isResumeReady ? 'text-white' : 'text-slate-500'}`}>2. 上传个人简历</span>
                </div>
                {data.isResumeReady && <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in zoom-in" />}
              </div>
            </div>

            {isAllDone && (
              <div className="mt-auto p-6 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-3xl text-center space-y-3 animate-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-pulse" />
                <h4 className="text-white font-black uppercase tracking-[0.2em]">准备工作已完成</h4>
                <p className="text-emerald-300/60 text-[10px] uppercase font-mono">Click the button below to initiate matrix</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full p-8 relative">
      {renderContent()}
    </div>
  );
};

export default function Setup() {
  const [view_id] = useState(() => uuidv4());
  const navigate = useNavigate();
  const [mode, setMode] = useState<'url' | 'form'>('url');
  const [jobUrl, setJobUrl] = useState("");
  const [isParsingJd, setIsParsingJd] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    jd_content: "",
    salary_range: "",
    work_experience: "",
    education: ""
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isJdReady, setIsJdReady] = useState(false);
  const [isResumeReady, setIsResumeReady] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [jdId, setJdId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [interviewStyle, setInterviewStyle] = useState<number>(1);

  // 可视化状态控制
  const [vizState, setVizState] = useState('idle');
  const [hoverStyle, setHoverStyle] = useState<number | null>(null);
  const [showResumeSuccess, setShowResumeSuccess] = useState(false);

  const wordCount = formData.jd_content.length;

  // 监听简历准备就绪，开启 5s 停留计时
  useEffect(() => {
    if (isResumeReady) {
      setShowResumeSuccess(true);
      const timer = setTimeout(() => {
        setShowResumeSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isResumeReady]);

  useEffect(() => {
    if (isParsingJd) setVizState('parsing_url');
    else if (isUploadingResume) setVizState('uploading_resume');
    else if (showResumeSuccess) setVizState('resume_ready');
    else if (hoverStyle !== null) setVizState('hover_mode');
    else if (wordCount > 0 && mode === 'form' && !isJdReady) setVizState('typing_jd');
    else setVizState('checklist');
  }, [isParsingJd, isUploadingResume, showResumeSuccess, hoverStyle, wordCount, mode, isJdReady]);

  // 解析招聘信息（URL模式）
  const analysisJobUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error("Please enter job URL!");
      return;
    }
    setIsParsingJd(true);
    try {
      const response = await apiClient.post('/api/v1/jd-information', {
        view_id,
        jdUrl: jobUrl,
        jdContent: ""
      });
      const data = response.data;
      if (data.success && data.data?.jd_id) {
        setJdId(data.data.jd_id);
        setIsJdReady(true);
        toast.success("Job description parsed successfully!");
      } else {
        toast.error(data.message || "Failed to parse job description");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to parse job description");
    } finally {
      setIsParsingJd(false);
    }
  };

  // 提交岗位信息（表单模式）
  const submitJobForm = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter job title!");
      return;
    }
    if (!formData.jd_content.trim()) {
      toast.error("Please enter job description!");
      return;
    }
    setVizState('analyzing_jd');
    setIsParsingJd(true);
    try {
      const response = await apiClient.post('/api/v1/jd-information', {
        view_id,
        title: formData.title,
        jdContent: formData.jd_content,
        jdUrl: "",
        salaryRange: formData.salary_range,
        workExperience: formData.work_experience,
        education: formData.education
      });
      const data = response.data;
      if (data.success && data.data) {
        setJdId(String(data.data));
        setIsJdReady(true);
        toast.success("Job information saved successfully!");
      } else {
        toast.error(data.message || "Failed to save job information");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save job information");
    } finally {
      setIsParsingJd(false);
    }
  };

  // 上传简历接口
  const uploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
      toast.error("Only PDF and Word documents are supported");
      return;
    }
    setResumeFile(selectedFile);
    setIsUploadingResume(true);
    const form = new FormData();
    form.append('file', selectedFile);
    try {
      const response = await apiClient.post('/api/v1/resume/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data;
      if (data.success && data.data) {
        const resumeIdValue = data.data.resumeId !== undefined ? data.data.resumeId : data.data;
        setResumeId(String(resumeIdValue));
        setIsResumeReady(true);
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error(data.message || "Failed to upload resume");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleStartInterview = async () => {
    if (!isJdReady || !isResumeReady) {
      toast.error("Please complete job description and resume upload first!");
      return;
    }
    setIsCreatingSession(true);
    try {
      const response = await apiClient.post('/api/v1/sessions', {
        jdId: parseInt(jdId),
        resumeId: parseInt(resumeId),
        style: interviewStyle,
        questionCount: 5
      });
      const data = response.data;
      if (data.success && data.data?.sessionId) {
        navigate("/interview", {
          state: {
            sessionId: data.data.sessionId,
            questionCount: data.data.questionCount,
            jdId,
            resumeId
          },
        });
      } else {
        toast.error(data.message || "Failed to create interview session");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create interview session");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const resetJd = () => {
    setIsJdReady(false);
    setJdId("");
    setJobUrl("");
    setFormData({
      title: "",
      jd_content: "",
      salary_range: "",
      work_experience: "",
      education: ""
    });
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15]"></div>
      </div>

      <div className="relative z-10 border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl">
        <Header showNav />
      </div>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-xs font-black tracking-[0.2em] uppercase"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回主控台 BACK TO CORE
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-10">
          {/* 左侧配置卡片 */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-cyan-500/10 to-purple-600/10 rounded-[2.5rem] blur-xl opacity-50"></div>
            <div className="relative rounded-[2rem] bg-[#0a0a14]/90 backdrop-blur-2xl border border-white/10 p-8 md:p-12 shadow-2xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Network className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">面试设置</h2>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-mono">Interview Setup v1.0</p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="mb-10 p-1.5 bg-[#030014] border border-white/5 rounded-2xl flex relative overflow-hidden">
                <div 
                  className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white/10 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-transform duration-500 ease-out"
                  style={{ transform: mode === 'url' ? 'translateX(0)' : 'translateX(calc(100% + 12px))', left: '6px' }}
                ></div>
                <button
                  onClick={() => { setMode('url'); resetJd(); }}
                  className={`relative z-10 flex-1 py-4 font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${mode === 'url' ? 'text-white' : 'text-slate-500'}`}
                >
                  粘贴职位链接
                </button>
                <button
                  onClick={() => { setMode('form'); resetJd(); }}
                  className={`relative z-10 flex-1 py-4 font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${mode === 'form' ? 'text-white' : 'text-slate-500'}`}
                >
                  手动输入岗位
                </button>
              </div>

              <div className="space-y-12">
                {mode === 'url' && (
                  <div className="space-y-4">
                    <Label className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
                      岗位链接 JOB SOURCE
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1 group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                        <Input
                          type="url"
                          placeholder="粘贴 Boss直聘、拉勾等招聘链接..."
                          value={jobUrl}
                          onChange={(e) => setJobUrl(e.target.value)}
                          className="pl-12 h-14 bg-black/40 border-white/10 text-white rounded-2xl focus:border-cyan-500/50 transition-all"
                        />
                      </div>
                      <Button 
                        onClick={analysisJobUrl}
                        disabled={isParsingJd || isJdReady}
                        className="h-14 px-8 font-black rounded-2xl transition-all shadow-lg active:scale-95 bg-white text-black hover:bg-slate-200 tracking-widest uppercase text-xs"
                      >
                        {isJdReady ? '已就绪 ✅' : (isParsingJd ? '解析中...' : '开始解析')}
                      </Button>
                    </div>
                  </div>
                )}

                {mode === 'form' && (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
                        岗位名称 TITLE
                      </Label>
                      <Input
                        placeholder="例如：高级前端开发工程师"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="h-14 bg-black/40 border-white/10 text-white rounded-2xl focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
                        岗位描述 / 要求 DESCRIPTION
                      </Label>
                      <textarea
                        placeholder="请输入该岗位的具体职责和技能要求..."
                        value={formData.jd_content}
                        onChange={(e) => setFormData({...formData, jd_content: e.target.value})}
                        rows={5}
                        className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 focus:border-cyan-500/50 transition-all text-sm resize-none focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={submitJobForm} disabled={isParsingJd || isJdReady} className="h-12 px-8 font-black rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 tracking-widest uppercase text-[10px]">
                        {isJdReady ? '保存成功 ✅' : '提交保存'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></div>
                    个人简历 RESUME
                  </Label>
                  <div className={`group relative border border-dashed rounded-3xl p-10 text-center transition-all duration-500 ${isUploadingResume ? "bg-cyan-500/5 border-cyan-500/30" : isResumeReady ? "bg-emerald-500/5 border-emerald-500/30" : "border-white/10 bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer"}`}>
                    <input type="file" id="resume-upload" accept=".pdf,.doc,.docx" onChange={uploadResume} className="hidden" />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border ${isUploadingResume ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : isResumeReady ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/10 text-slate-500 group-hover:text-cyan-400"}`}>
                          {isUploadingResume ? <Loader2 className="w-7 h-7 animate-spin" /> : isResumeReady ? <CheckCircle2 className="w-7 h-7" /> : <Fingerprint className="w-7 h-7" />}
                        </div>
                        <p className={`text-sm font-bold tracking-widest uppercase transition-colors ${isResumeReady ? "text-emerald-400" : "text-slate-400"}`}>
                          {resumeFile ? resumeFile.name : "上传我的简历"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-yellow-500"></div>
                    面试难度 / 风格 MODE
                  </Label>
                  <div className="flex bg-[#030014] border border-white/5 rounded-2xl p-1.5 relative overflow-hidden">
                    <div 
                      className="absolute inset-y-1.5 rounded-xl border border-white/10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{
                        width: 'calc((100% - 12px) / 3)',
                        transform: `translateX(calc(${interviewStyle * 100}%))`,
                        left: '6px',
                        background: interviewStyle === 0 ? 'rgba(16, 185, 129, 0.1)' : interviewStyle === 1 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        borderColor: interviewStyle === 0 ? 'rgba(16, 185, 129, 0.4)' : interviewStyle === 1 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(244, 63, 94, 0.4)'
                      }}
                    />
                    {['温柔引导', '常规面试', '高压挑战'].map((label, idx) => (
                      <button
                        key={idx}
                        onMouseEnter={() => setHoverStyle(idx)}
                        onMouseLeave={() => setHoverStyle(null)}
                        onClick={() => setInterviewStyle(idx)}
                        className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 relative z-10 ${interviewStyle === idx ? 'text-white' : 'text-slate-600 hover:text-slate-300'}`}
                      >
                        <span className="font-black text-[10px] tracking-[0.2em] uppercase">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleStartInterview}
                    disabled={!(isJdReady && isResumeReady) || isCreatingSession}
                    className="w-full h-16 bg-white text-black hover:bg-slate-200 rounded-2xl text-xl font-black transition-all hover:scale-[1.02] shadow-[0_15px_40px_rgba(255,255,255,0.1)] relative overflow-hidden group tracking-[0.2em] uppercase"
                  >
                    <span className="relative z-10">开始模拟面试</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧可视化中枢容器 */}
          <div className="hidden lg:block relative">
            <div className="sticky top-24 h-[calc(100vh-8rem)] min-h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-600/5 rounded-[2.5rem] blur-2xl"></div>
              <div className="relative h-full rounded-[2.5rem] bg-[#0a0a14]/60 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden">
                <VisualizationHub state={vizState} data={{ wordCount, style: hoverStyle !== null ? hoverStyle : interviewStyle, isJdReady, isResumeReady }} />
              </div>

              {/* 装饰元素 */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 border-r border-b border-white/20 rounded-br-[3rem]"></div>
              <div className="absolute -left-2 top-[40%] w-1 h-20 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}