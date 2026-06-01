import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon, Loader2, CheckCircle2, Sparkles, FileText, Edit3, Network, Fingerprint, Activity, Zap, Cpu, Search, AlertTriangle, ShieldCheck, FileSearch, ListChecks, Plus, ChevronDown } from "lucide-react";
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
    const contentKey = state;
    switch (state) {
      case 'parsing_url':
      case 'analyzing_jd':
        return (
          <div key={contentKey} className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Processing...</span>
              </div>
              <Cpu className="w-4 h-4 text-emerald-500/50" />
            </div>
            
            <div className="flex-1 relative border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl overflow-hidden mb-6 p-4">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/4 w-full animate-scan-v z-10"></div>
              <div className="space-y-2 opacity-20 dark:opacity-20 blur-[1px]">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-2 bg-slate-300 dark:bg-white/10 rounded-full" style={{ width: `${Math.random() * 50 + 40}%` }}></div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col gap-2 p-6 justify-center items-center">
                {state === 'parsing_url' && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Java架构', '高并发', 'MySQL', '分布式', '消息中间件'].map((skill, i) => (
                      <div key={i} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-[10px] text-cyan-600 dark:text-cyan-400 font-bold animate-in zoom-in duration-500" style={{ animationDelay: `${i * 200}ms` }}>
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/90 dark:bg-black/40 rounded-xl p-4 font-mono text-[10px] text-emerald-400 dark:text-emerald-500/70 space-y-1">
              {logs.map((log, i) => <div key={i} className="animate-in slide-in-from-left-2">{log}</div>)}
            </div>
          </div>
        );

      case 'typing_jd':
        return (
          <div key={contentKey} className="h-full flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl animate-pulse"></div>
              <Edit3 className="w-16 h-16 text-cyan-500 dark:text-cyan-400 relative z-10" strokeWidth={1} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">正在输入岗位信息</h3>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-mono">User Terminal Inputting...</p>
            </div>
            <div className="text-4xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
              {data.wordCount}
              <span className="text-[10px] text-slate-400 dark:text-slate-600 ml-2 uppercase tracking-tighter">Characters</span>
            </div>
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-10 h-1 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500/40 dark:bg-cyan-400/40 animate-[progress-indeterminate_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.2}s` }}></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'uploading_resume':
        return (
          <div key={contentKey} className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="absolute inset-0 border border-purple-500/30 rounded-full animate-radar-pulse" style={{ animationDelay: `${i * 0.6}s` }}></div>
              ))}
              <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <FileSearch className="w-10 h-10 text-purple-500 dark:text-purple-400" />
              </div>
            </div>
            <div className="w-full bg-slate-900/90 dark:bg-black/40 rounded-xl p-4 h-32 overflow-hidden relative scanning-mask">
              <div className="animate-text-scroll-up font-mono text-[8px] text-purple-400/60 dark:text-purple-500/40 space-y-1">
                {[...Array(20)].map((_, i) => (
                  <div key={i}>0x{Math.random().toString(16).slice(2, 10).toUpperCase()} - EXTRACTING_FRAGMENT_DATA_LOAD_0{i}</div>
                ))}
              </div>
            </div>
            <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest animate-pulse">Scanning Bio-Profile...</p>
          </div>
        );

      case 'resume_ready':
        return (
          <div key={contentKey} className="h-full flex flex-col p-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">简历解析完成</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-500/60 font-mono">RESUME DECODED SUCCESS</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center space-y-10">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-white/5" />
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray="502.4"
                    strokeDashoffset="502.4"
                    style={{ '--offset': `${502.4 - (502.4 * 0.85)}` } as any}
                    className="text-cyan-500 dark:text-cyan-400 animate-progress-circle" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">85%</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Match Rate</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                {/* 移除占位提示 */}
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
          <div key={contentKey} className="h-full flex flex-col p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">模式参数校准</h3>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <span>技术深度考查</span>
                  <span className="text-slate-900 dark:text-white">{modeParams.depth}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 transition-all duration-700 ease-out" style={{ width: `${modeParams.depth}%` }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <span>压力抗性测试</span>
                  <span className="text-slate-900 dark:text-white">{modeParams.stress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-700 ease-out" style={{ width: `${modeParams.stress}%` }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <span>引导式提示</span>
                  <span className="text-slate-900 dark:text-white">{modeParams.guide}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${modeParams.guide}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
              {data.style === 0 ? "系统将扮演和蔼的前辈，侧重于引导您发挥出真实水平。" : 
               data.style === 1 ? "标准企业面试场景，全维度考核技术能力与职场软技能。" :
               "极致的高压测试环境，系统会不断挑战您的技术边界与情绪稳定性。"}
            </div>
          </div>
        );

      case 'checklist':
        const isAllDone = data.isJdReady && data.isResumeReady;
        return (
          <div key={contentKey} className="h-full flex flex-col p-6 animate-in fade-in duration-1000">
            <div className="flex items-center gap-3 mb-10">
              <ListChecks className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">准备工作</h3>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className={`p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between ${data.isJdReady ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.isJdReady ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400' : 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-500'}`}>
                    <Network className="w-5 h-5" />
                  </div>
                  <span className={`font-bold text-sm tracking-widest uppercase ${data.isJdReady ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>1. 解析岗位信息</span>
                </div>
                {data.isJdReady && <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-in zoom-in" />}
              </div>

              <div className={`p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between ${data.isResumeReady ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.isResumeReady ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400' : 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-500'}`}>
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <span className={`font-bold text-sm tracking-widest uppercase ${data.isResumeReady ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>2. 选择个人简历</span>
                </div>
                {data.isResumeReady && <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-in zoom-in" />}
              </div>
            </div>

            {isAllDone && (
              <div className="mt-auto p-6 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-3xl text-center space-y-3 animate-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-2 animate-pulse" />
                <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em]">准备工作已完成</h4>
                <p className="text-emerald-600 dark:text-emerald-300/60 text-[10px] uppercase font-mono">Click the button below to initiate matrix</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full p-8 relative transition-all duration-700 ease-in-out">
      {renderContent()}
    </div>
  );
};

export default function Setup() {
  const [view_id] = useState(() => uuidv4());
  const navigate = useNavigate();
  const [mode, setMode] = useState<'url' | 'form'>('url');
  const [jobUrl, setJobUrl] = useState("");
  const [jobList, setJobList] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isParsingJd, setIsParsingJd] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    jd_content: "",
    salary_range: "",
    work_experience: "",
    education: ""
  });
  const [resumeFile, setResumeFile] = useState<any>(null);
  const [isJdReady, setIsJdReady] = useState(false);
  const [isResumeReady, setIsResumeReady] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [jdId, setJdId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [interviewStyle, setInterviewStyle] = useState<number>(1);
  const [userResumes, setUserResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [isResumeDropdownOpen, setIsResumeDropdownOpen] = useState(false);

  // 可视化状态控制
  const [vizState, setVizState] = useState('idle');
  const [hoverStyle, setHoverStyle] = useState<number | null>(null);
  const [showResumeSuccess, setShowResumeSuccess] = useState(false);

  const wordCount = formData.jd_content.length;

  // 获取用户已上传的简历
  const fetchUserResumes = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const userId = user.id || user.userId;
    if (!userId) return;

    setLoadingResumes(true);
    try {
      const response = await apiClient.post('/api/v1/resume/page', {
        userId: parseInt(userId),
        pageNum: 1,
        pageSize: 100
      });
      if (response.data.success && response.data.data?.records) {
        setUserResumes(response.data.data.records);
      }
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    fetchUserResumes();
  }, []);

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
    // 只有在没有进行重要任务时才显示模式参数，防止干扰
    const isProcessing = isParsingJd || isUploadingResume || isCreatingSession;

    if (isParsingJd) setVizState('parsing_url');
    else if (isUploadingResume) setVizState('uploading_resume');
    else if (showResumeSuccess) setVizState('resume_ready');
    else if (hoverStyle !== null && !isProcessing) setVizState('hover_mode');
    else if (wordCount > 0 && mode === 'form' && !isJdReady) setVizState('typing_jd');
    else setVizState('checklist');
  }, [isParsingJd, isUploadingResume, isCreatingSession, showResumeSuccess, hoverStyle, wordCount, mode, isJdReady]);

  // 获取爬虫基础地址
  const getSpiderBaseUrl = () => {
    let spiderBaseUrl = import.meta.env.VITE_SPIDER_API_BASE_URL || "";
    if (window.location.protocol === 'https:' && spiderBaseUrl.startsWith('http:')) {
      return '/spider-api';
    }
    return spiderBaseUrl;
  };

  // 搜索岗位列表
  const searchJobs = async (keywords: string = "") => {
    setIsSearching(true);
    try {
      let baseUrl = getSpiderBaseUrl();
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      
      const targetUrl = `${baseUrl}/jobs?keywords=${encodeURIComponent(keywords)}`;
      console.log("Calling spider API:", targetUrl);
      
      const response = await fetch(targetUrl);
      const text = await response.text();
      
      if (!response.ok) {
        console.error("API Response Error:", response.status, text);
        throw new Error(`搜索失败 (${response.status})`);
      }
      
      try {
        const result = JSON.parse(text);
        if (result.success) {
          setJobList(result.data);
        }
      } catch (e) {
        console.error("返回内容不是 JSON 格式，收到内容前100字:", text.substring(0, 100));
        throw new Error("接口响应格式错误，请检查 Nginx 代理配置");
      }
    } catch (error: any) {
      console.error("Search jobs error:", error);
      toast.error(error.message || "搜索岗位失败，请确认爬虫服务已启动");
    } finally {
      setIsSearching(false);
    }
  };

  // 获取岗位详情
  const fetchJobDetail = async (job: any) => {
    setIsFetchingDetail(true);
    setSelectedJob(job);
    try {
      let baseUrl = getSpiderBaseUrl();
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      
      const response = await fetch(`${baseUrl}/job-detail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: job.detailUrl })
      });
      
      if (!response.ok) throw new Error(`获取详情失败 (${response.status})`);
      const result = await response.json();
      if (result.success) {
        setSelectedJob({ ...job, ...result.data });
      }
    } catch (error: any) {
      console.error("Fetch job detail error:", error);
      toast.error("获取岗位详情失败");
    } finally {
      setIsFetchingDetail(false);
    }
  };

  // 确认选择岗位
  const confirmJobSelection = async () => {
    if (!selectedJob) return;
    
    setIsParsingJd(true);
    setVizState('parsing_url');
    
    try {
      // 将爬取到的数据同步到后端数据库
      const response = await apiClient.post('/api/v1/jd-information', {
        view_id,
        title: selectedJob.title || selectedJob.jobTitle,
        jdContent: `薪资: ${selectedJob.salary}\n地点: ${selectedJob.location}\n要求: ${selectedJob.education}\n公司: ${selectedJob.company}\n\n职位描述:\n${selectedJob.description}`,
        jdUrl: selectedJob.detailUrl,
        salaryRange: selectedJob.salary,
        workExperience: selectedJob.experience || "",
        education: selectedJob.education || selectedJob.requirement
      });

      const data = response.data;
      if (data.success && data.data) {
        setJdId(String(data.data));
        setIsJdReady(true);
        setIsSearchModalOpen(false); // 确定完岗位之后悬浮窗消失
        toast.success("岗位信息确认成功！");
      } else {
        toast.error(data.message || "同步到服务器失败");
      }
    } catch (error: any) {
      console.error("Confirm job error:", error);
      toast.error(error.message || "确认失败");
    } finally {
      setIsParsingJd(false);
    }
  };

  // 兼容旧的分析逻辑（如果需要保留，但现在逻辑已变）
  const analysisJobUrl = async () => {
    // 逻辑已经迁移到 searchJobs 和 fetchJobDetail
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

  const handleResumeSelect = (resume: any) => {
    setResumeId(String(resume.resumeId));
    setIsResumeReady(true);
    setResumeFile({ name: resume.fileName || resume.fileUrl.split('/').pop() || 'Selected Resume' });
    setIsResumeDropdownOpen(false);
    toast.success("已选择简历");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (file.type !== 'application/pdf') {
      toast.error("目前仅支持 PDF 格式的简历");
      return;
    }

    setIsUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/api/v1/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("简历上传成功并已解析");
        await fetchUserResumes();
        // 自动选中刚刚上传的简历
        const newResumesData = response.data.data;
        const newId = newResumesData.resumeId || newResumesData.id;
        if (newId) {
          setResumeId(String(newId));
          setIsResumeReady(true);
          setResumeFile({ name: file.name });
        }
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      toast.error(error.response?.data?.message || "上传失败");
    } finally {
      setIsUploadingResume(false);
      e.target.value = '';
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#030014] text-slate-600 dark:text-slate-200 font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/20 dark:bg-purple-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-200/20 dark:bg-cyan-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] dark:opacity-[0.15]"></div>
      </div>

      <div className="relative z-10 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#030014]/50 backdrop-blur-xl">
        <Header showNav={false} />
      </div>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors text-xs font-black tracking-[0.2em] uppercase"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回主控台 BACK TO CORE
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-10">
          {/* 左侧配置卡片 */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-cyan-500/10 to-purple-600/10 rounded-[2.5rem] blur-xl opacity-50"></div>
            <div className="relative rounded-[2rem] bg-white/90 dark:bg-[#0a0a14]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 md:p-12 shadow-2xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                  <Network className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">面试设置</h2>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-mono">Interview Setup v1.0</p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="mb-10 p-1.5 bg-slate-100 dark:bg-[#030014] border border-slate-200 dark:border-white/5 rounded-2xl flex relative overflow-hidden">
                <div 
                  className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white dark:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-transform duration-500 ease-out"
                  style={{ transform: mode === 'url' ? 'translateX(0)' : 'translateX(calc(100% + 12px))', left: '6px' }}
                ></div>
                <button
                  onClick={() => { setMode('url'); resetJd(); }}
                  className={`relative z-10 flex-1 py-4 font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${mode === 'url' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  搜寻岗位
                </button>
                <button
                  onClick={() => { setMode('form'); resetJd(); }}
                  className={`relative z-10 flex-1 py-4 font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${mode === 'form' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  手动输入岗位 <span className="ml-1 text-[8px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full border border-cyan-500/20">推荐使用</span>
                </button>
              </div>

              <div className="space-y-12">
                {mode === 'url' && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.02] transition-all hover:border-cyan-500/30">
                      <Search className="w-10 h-10 text-slate-300 dark:text-white/10 mb-3" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                        {isJdReady ? '岗位已确认' : '开始搜寻岗位'}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 max-w-xs text-center leading-relaxed">
                        {isJdReady 
                          ? `已成功锁定【${selectedJob?.title || "所选岗位"}】。如果不满意，您可以点击下方按钮重新搜寻。`
                          : '点击下方按钮开启岗位搜索，我们将为您从上海本地宝实时获取最新的招聘信息。'}
                      </p>
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => {
                            setIsSearchModalOpen(true);
                            if (jobList.length === 0) searchJobs("");
                          }}
                          disabled={isJdReady}
                          className={`h-12 px-8 font-black rounded-2xl tracking-widest uppercase text-[10px] transition-all shadow-xl ${
                            isJdReady 
                              ? 'bg-emerald-500 text-white opacity-80 cursor-default' 
                              : 'bg-slate-900 dark:bg-white dark:text-black hover:scale-105 active:scale-95'
                          }`}
                        >
                          {isJdReady ? '岗位已选择 ✅' : '立即搜寻岗位 SEARCH JOBS'}
                        </Button>
                        {isJdReady && (
                          <Button 
                            onClick={() => {
                              resetJd();
                              setSelectedJob(null);
                            }}
                            variant="outline"
                            className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/20"
                          >
                            重新选择
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 px-4 py-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-500/80 uppercase tracking-wider">支持范围限制 Notice</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">目前仅支持爬取 <span className="font-mono text-amber-600/80">m.sh.bendibao.com</span> (上海本地宝) 的岗位详情。建议使用手动输入模式以获得最佳体验。</p>
                      </div>
                    </div>

                    {isSearchModalOpen && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        {/* 优化背景模糊，不再使用纯黑模糊 */}
                        <div className="absolute inset-0 bg-slate-500/10 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsSearchModalOpen(false)}></div>
                        <div className="relative w-full max-w-6xl h-[85vh] bg-white dark:bg-[#0a0a14] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                          {/* Modal Header - 解决关闭按钮重叠问题 */}
                          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <Search className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">岗位搜寻中心</h2>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-mono">Real-time Job Aggregator v2.0</p>
                              </div>
                            </div>

                            <div className="flex gap-3 flex-1 max-w-xl lg:mr-12">
                              <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                  placeholder="搜索岗位关键字，例如：Java, 前端, 服务员..."
                                  value={searchKeywords}
                                  onChange={(e) => setSearchKeywords(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && searchJobs(searchKeywords)}
                                  className="pl-12 h-14 bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl focus:border-cyan-500/50"
                                />
                              </div>
                              <Button 
                                onClick={() => searchJobs(searchKeywords)}
                                disabled={isSearching}
                                className="h-14 px-8 font-black rounded-2xl tracking-widest uppercase text-xs bg-slate-900 dark:bg-white dark:text-black hover:bg-slate-800 text-white"
                              >
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : '搜索'}
                              </Button>
                            </div>
                            
                            <button 
                              onClick={() => setIsSearchModalOpen(false)}
                              className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0"
                            >
                              <Plus className="w-6 h-6 rotate-45" />
                            </button>
                          </div>

                          {/* Modal Content */}
                          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Left List */}
                            <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-white/5 flex flex-col">
                              <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">岗位列表 ({jobList.length})</span>
                                {isSearching && <Loader2 className="w-3 h-3 animate-spin text-cyan-500" />}
                              </div>
                              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {jobList.length === 0 ? (
                                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 py-20">
                                    <Search className="w-10 h-10 mb-4" />
                                    <p className="text-[11px] uppercase font-black tracking-widest text-center">输入关键词<br/>开始搜索</p>
                                  </div>
                                ) : (
                                  jobList.map((job, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => fetchJobDetail(job)}
                                      className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 group ${
                                        selectedJob?.detailUrl === job.detailUrl 
                                          ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_10px_30px_rgba(6,182,212,0.1)]' 
                                          : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-cyan-500/20'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors line-clamp-1">{job.title}</h4>
                                        <span className="text-[10px] font-black text-rose-500 whitespace-nowrap ml-2">{job.salary}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5 mb-3">
                                        <span className="text-[8px] px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 font-bold uppercase">{job.location}</span>
                                        <span className="text-[8px] px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 font-bold uppercase">{job.education}</span>
                                      </div>
                                      <div className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-bold truncate">
                                        <Zap className="w-3 h-3 text-cyan-500/50" />
                                        {job.company}
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Right Detail */}
                            <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-black/20 overflow-hidden">
                              {isFetchingDetail && (
                                <div className="absolute inset-0 z-50 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                                  <div className="relative w-20 h-20">
                                    <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                  <span className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.3em] mt-6 animate-pulse">正在深度解析详情...</span>
                                </div>
                              )}
                              
                              {!selectedJob ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-20 opacity-30">
                                  <FileSearch className="w-20 h-20 mb-8" />
                                  <h3 className="text-xl font-black uppercase tracking-[0.4em]">请在左侧选择岗位</h3>
                                  <p className="text-xs mt-4">Select a job from the list to preview details</p>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500">
                                  <div className="p-8 md:p-12 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.01]">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                      <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-cyan-500/20">Active Position</span>
                                          <span className="text-[10px] text-slate-400 font-mono">ID: {selectedJob.detailUrl.split('/').pop()?.split('.')[0]}</span>
                                        </div>
                                        <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">{selectedJob.title}</h3>
                                        <div className="flex items-center gap-6">
                                          <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{selectedJob.company}</span>
                                          </div>
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/10"></div>
                                          <span className="text-xl font-black text-rose-500">{selectedJob.salary}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex-1 p-8 md:p-12 overflow-y-auto text-base text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-sans custom-scrollbar">
                                    <div className="flex items-center gap-4 mb-8">
                                      <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/5"></div>
                                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] px-4">岗位详情描述 JOB DESCRIPTION</span>
                                      <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/5"></div>
                                    </div>
                                    <div className="max-w-3xl mx-auto">
                                      {selectedJob.description || "正在为您提取精准的职位描述，请稍候..."}
                                    </div>
                                  </div>
                                  <div className="p-8 md:p-12 bg-white dark:bg-[#0a0a14] border-t border-slate-200 dark:border-white/5 flex gap-6">
                                    <Button 
                                      onClick={confirmJobSelection}
                                      disabled={isParsingJd || isJdReady}
                                      className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl ${
                                        isJdReady 
                                          ? 'bg-emerald-500 text-white' 
                                          : 'bg-cyan-600 text-white hover:bg-cyan-500 hover:scale-[1.02] active:scale-[0.98]'
                                      }`}
                                    >
                                      {isJdReady ? '已确认岗位信息 ✅' : '确定选择该岗位并解析'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'form' && (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-cyan-500 dark:bg-cyan-400"></div>
                        岗位名称 TITLE
                      </Label>
                      <Input
                        placeholder="例如：高级前端开发工程师"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="h-14 bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-cyan-500 dark:bg-cyan-400"></div>
                        岗位描述 / 要求 DESCRIPTION
                      </Label>
                      <textarea
                        placeholder="请输入该岗位的具体职责和技能要求..."
                        value={formData.jd_content}
                        onChange={(e) => setFormData({...formData, jd_content: e.target.value})}
                        rows={5}
                        className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl px-5 py-4 focus:border-cyan-500/50 transition-all text-sm resize-none focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        onClick={submitJobForm} 
                        disabled={isParsingJd || isJdReady} 
                        className={`h-12 px-10 font-black rounded-xl tracking-widest uppercase text-xs transition-all shadow-lg active:scale-95 ${
                          isJdReady 
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                            : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-500/20'
                        }`}
                      >
                        {isJdReady ? '保存成功 ✅' : '提交并解析岗位内容'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></div>
                    个人简历 RESUME <span className="text-[8px] opacity-60 ml-2 font-normal">(仅支持 .pdf 格式)</span>
                  </Label>
                  <div className={`relative border rounded-3xl p-6 transition-all duration-500 ${isResumeReady ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]" : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]"}`}>
                    <div className="flex flex-col gap-4">
                      {userResumes.length > 0 ? (
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${isUploadingResume ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-600 dark:text-cyan-400" : isResumeReady ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500"}`}>
                            {isUploadingResume ? <Loader2 className="w-6 h-6 animate-spin" /> : isResumeReady ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                          </div>
                          
                          <div className="flex-1 relative">
                            <button
                              onClick={() => setIsResumeDropdownOpen(!isResumeDropdownOpen)}
                              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:border-cyan-500/30 transition-all"
                            >
                              <span className="truncate">
                                {resumeId ? (userResumes.find(r => String(r.resumeId) === resumeId)?.fileName || userResumes.find(r => String(r.resumeId) === resumeId)?.fileUrl.split('/').pop()) : "-- 选择已上传的简历 --"}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isResumeDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isResumeDropdownOpen && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0a0a14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                {userResumes.map(resume => (
                                  <button
                                    key={resume.resumeId}
                                    onClick={() => handleResumeSelect(resume)}
                                    className="w-full px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex flex-col gap-1 transition-colors group"
                                  >
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                                      {resume.fileName || resume.fileUrl.split('/').pop() || `Resume #${resume.resumeId}`}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter">
                                      {new Date(resume.createTime).toLocaleDateString()} • {resume.content?.slice(0, 30)}...
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-1.5 px-1">
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                {userResumes.length} 个存档可用
                              </p>
                              <label className="cursor-pointer text-[9px] text-cyan-600 dark:text-cyan-500 font-black uppercase tracking-widest hover:text-cyan-400 transition-colors flex items-center gap-1">
                                <Plus className="w-3 h-3" /> 重新上传 (仅 PDF)
                                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                              </label>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-4 text-center">
                          <AlertTriangle className="w-8 h-8 text-amber-500 mb-3 opacity-50" />
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">用户没有上传过简历</p>
                          <p className="text-[10px] text-slate-400 mb-4 font-mono">SUPPORTED FORMAT: .PDF ONLY</p>
                          <label className="cursor-pointer">
                            <div className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                              {isUploadingResume ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                              {isUploadingResume ? "上传并解析中..." : "上传 PDF 简历"}
                            </div>
                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isUploadingResume} />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-yellow-500"></div>
                    面试难度 / 风格 MODE
                  </Label>
                  <div className="flex bg-slate-100 dark:bg-[#030014] border border-slate-200 dark:border-white/5 rounded-2xl p-1.5 relative overflow-hidden">
                    <div 
                      className="absolute inset-y-1.5 rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{
                        width: 'calc((100% - 12px) / 3)',
                        transform: `translateX(calc(${interviewStyle * 100}%))`,
                        left: '6px',
                        background: interviewStyle === 0 ? 'rgba(16, 185, 129, 0.15)' : interviewStyle === 1 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        borderColor: interviewStyle === 0 ? 'rgba(16, 185, 129, 0.4)' : interviewStyle === 1 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(244, 63, 94, 0.4)'
                      }}
                    />
                    {['温柔引导', '常规面试', '高压挑战'].map((label, idx) => (
                      <button
                        key={idx}
                        onMouseEnter={() => setHoverStyle(idx)}
                        onMouseLeave={() => setHoverStyle(null)}
                        onClick={() => setInterviewStyle(idx)}
                        className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 relative z-10 ${interviewStyle === idx ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
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
                    className="w-full h-16 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-2xl text-xl font-black transition-all hover:scale-[1.02] shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_40px_rgba(255,255,255,0.1)] relative overflow-hidden group tracking-[0.2em] uppercase"
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
              <div className="relative h-full rounded-[2.5rem] bg-white/60 dark:bg-[#0a0a14]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                <VisualizationHub state={vizState} data={{ wordCount, style: hoverStyle !== null ? hoverStyle : interviewStyle, isJdReady, isResumeReady }} />
              </div>

              {/* 装饰元素 */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 border-r border-b border-slate-300 dark:border-white/20 rounded-br-[3rem]"></div>
              <div className="absolute -left-2 top-[40%] w-1 h-20 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}