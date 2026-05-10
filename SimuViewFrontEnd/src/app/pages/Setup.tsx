import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon, Loader2, CheckCircle2, Sparkles, FileText, Edit3, Network, Fingerprint } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Header } from "../components/Header";
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../api/apiClient';
import { toast } from "sonner";

export default function Setup() {
  // 生成当前会话的view_id
  const [view_id] = useState(() => uuidv4());
  
  const navigate = useNavigate();
  
  // 模式切换：url 或 form
  const [mode, setMode] = useState<'url' | 'form'>('url');
  
  // URL模式状态
  const [jobUrl, setJobUrl] = useState("");
  const [isParsingJd, setIsParsingJd] = useState(false);
  
  // 表单模式状态
  const [formData, setFormData] = useState({
    title: "",
    jd_content: "",
    salary_range: "",
    work_experience: "",
    education: ""
  });
  
  // 简历相关状态
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isJdReady, setIsJdReady] = useState(false);
  const [isResumeReady, setIsResumeReady] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const [jdId, setJdId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [interviewStyle, setInterviewStyle] = useState<number>(1);

  // 解析招聘信息（URL模式）
  const analysisJobUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error("Please enter job URL!");
      return;
    }

    setIsParsingJd(true);

    try {
      const response = await apiClient.post('/api/v1/jd-information', {
        view_id: view_id,
        jdUrl: jobUrl,
        jdContent: ""  // 添加空字符串避免后端报错
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
      console.error("Failed to parse job description", error);
      toast.error(error.response?.data?.message || "Failed to parse job description");
    } finally {
      setIsParsingJd(false);
    }
  };

  // 提交岗位信息（表单模式）
  const submitJobForm = async () => {
    console.log("submitJobForm called");
    console.log("formData:", formData);
    
    if (!formData.title.trim()) {
      console.log("Validation failed: title is empty");
      toast.error("Please enter job title!");
      return;
    }
    if (!formData.jd_content.trim()) {
      console.log("Validation failed: jd_content is empty");
      toast.error("Please enter job description!");
      return;
    }

    setIsParsingJd(true);

    try {
      console.log("Sending request to /api/v1/jd-information");
      const response = await apiClient.post('/api/v1/jd-information', {
        view_id: view_id,
        title: formData.title,
        jdContent: formData.jd_content,
        jdUrl: "",
        salaryRange: formData.salary_range,
        workExperience: formData.work_experience,
        education: formData.education
      });

      const data = response.data;
      console.log("Response data:", data);
      
      // 后端直接返回 jd_id 的值，而不是包含 jd_id 的对象
      if (data.success && data.data) {
        setJdId(String(data.data));
        setIsJdReady(true);
        console.log("Job info saved, isJdReady set to true");
        toast.success("Job information saved successfully!");
      } else {
        console.log("Backend returned success=false or missing data");
        toast.error(data.message || "Failed to save job information");
      }
    } catch (error: any) {
      console.error("Failed to save job information", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to save job information");
    } finally {
      setIsParsingJd(false);
    }
  };

  // 上传简历接口
  const uploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;

    if (!selectedFile) {
      toast.error("Please select a file!");
      return;
    }

    // 验证文件类型
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
      toast.error("Only PDF and Word documents are supported");
      return;
    }

    setResumeFile(selectedFile);
    setIsUploadingResume(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await apiClient.post('/api/v1/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = response.data;
      console.log("Resume upload response:", data);
      
      // 后端返回 ResumeInformation 对象，包含 resumeId 字段
      if (data.success && data.data) {
        // 获取 resumeId（后端字段名是 resumeId，不是 id）
        const resumeIdValue = data.data.resumeId !== undefined ? data.data.resumeId : data.data;
        setResumeId(String(resumeIdValue));
        setIsResumeReady(true);
        console.log("Resume uploaded, isResumeReady set to true, resumeId:", resumeIdValue);
        toast.success("Resume uploaded successfully!");
      } else {
        console.log("Resume upload failed: success=false or missing data");
        toast.error(data.message || "Failed to upload resume");
      }
    } catch (error: any) {
      console.error("Failed to upload resume", error);
      const errorMsg = error.response?.data?.message || 
                      (error.response?.status === 400 ? "Invalid file format" : "Failed to upload resume");
      toast.error(errorMsg);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // 开始面试 - 先创建会话，再跳转到面试页面
  const handleStartInterview = async () => {
    if (!isJdReady || !isResumeReady) {
      toast.error("Please complete job description and resume upload first!");
      return;
    }

    setIsCreatingSession(true);

    try {
      // 调用后端创建会话接口
      const response = await apiClient.post('/api/v1/sessions', {
        jdId: parseInt(jdId),
        resumeId: parseInt(resumeId),
        style: interviewStyle,
        questionCount: 5
      });

      const data = response.data;
      if (data.success && data.data?.sessionId) {
        const sessionId = data.data.sessionId;
        const questionCount = data.data.questionCount;
        
        toast.success("Interview session created!");
        
        // 跳转到面试页面，传递sessionId
        navigate("/interview", {
          state: {
            sessionId,
            questionCount,
            jdId,
            resumeId
          },
        });
      } else {
        toast.error(data.message || "Failed to create interview session");
      }
    } catch (error: any) {
      console.error("Failed to create interview session", error);
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
    <div className="min-h-screen bg-[#030014] text-slate-200 font-sans relative">
      {/* Background (Midnight Galaxy / Tech Innovation) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10 border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl">
        <Header showNav />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto p-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-medium tracking-wide uppercase"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回主控台
        </button>

        <div className="relative">
          {/* Card background effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-b from-cyan-500/10 to-purple-600/10 rounded-[2.5rem] blur-xl opacity-50"></div>
          
          <div className="relative rounded-[2rem] bg-[#0a0a14]/90 backdrop-blur-2xl border border-white/10 p-8 md:p-14 shadow-2xl">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Network className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  初始化配置
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-light">
                  导入职位模型与能力图谱，建立面试神经连接
                </p>
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
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-colors duration-300 ${mode === 'url' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LinkIcon className="w-4 h-4" />
                URL 智能解析
              </button>
              <button
                onClick={() => { setMode('form'); resetJd(); }}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-colors duration-300 ${mode === 'form' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Edit3 className="w-4 h-4" />
                手动构建模型
              </button>
            </div>

            <div className="space-y-12">
              {/* URL模式 - 岗位URL输入区 */}
              {mode === 'url' && (
                <div className="space-y-4">
                  <Label htmlFor="job-url" className="text-slate-300 font-semibold text-sm uppercase tracking-wider ml-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    目标岗位链接
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                      <Input
                        id="job-url"
                        type="url"
                        placeholder="粘贴 Boss直聘 等平台岗位链接..."
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        className="pl-12 h-14 bg-[#030014]/50 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all text-base"
                      />
                    </div>
                    <Button 
                      onClick={analysisJobUrl}
                      disabled={isParsingJd || isJdReady}
                      className={`h-14 px-8 text-base font-semibold rounded-2xl transition-all shadow-lg active:scale-95 ${
                        isJdReady 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                      }`}
                    >
                      {isJdReady ? '解析完成 ✅' : (isParsingJd ? '深度解构中...' : '开始解析')}
                    </Button>
                  </div>
                </div>
              )}

              {/* 表单模式 - 岗位信息填写 */}
              {mode === 'form' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="job-title" className="text-slate-300 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                      岗位代号 <span className="text-rose-400">*</span>
                    </Label>
                    <Input
                      id="job-title"
                      type="text"
                      placeholder="e.g. 高级前端架构师"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="h-14 bg-[#030014]/50 border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="job-content" className="text-slate-300 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                      核心诉求 (JD) <span className="text-rose-400">*</span>
                    </Label>
                    <textarea
                      id="job-content"
                      placeholder="详细描述候选人需要具备的能力图谱..."
                      value={formData.jd_content}
                      onChange={(e) => setFormData({...formData, jd_content: e.target.value})}
                      rows={5}
                      className="w-full bg-[#030014]/50 border border-white/10 text-white placeholder:text-slate-600 rounded-2xl px-5 py-4 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all text-base resize-none focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="salary-range" className="text-slate-400 font-medium text-xs uppercase tracking-widest">薪资估值</Label>
                      <Input
                        id="salary-range"
                        type="text"
                        placeholder="e.g. 20K-40K"
                        value={formData.salary_range}
                        onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                        className="h-12 bg-[#030014]/50 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="work-experience" className="text-slate-400 font-medium text-xs uppercase tracking-widest">经验阈值</Label>
                      <Input
                        id="work-experience"
                        type="text"
                        placeholder="e.g. 3-5年"
                        value={formData.work_experience}
                        onChange={(e) => setFormData({...formData, work_experience: e.target.value})}
                        className="h-12 bg-[#030014]/50 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="education" className="text-slate-400 font-medium text-xs uppercase tracking-widest">学历底线</Label>
                      <Input
                        id="education"
                        type="text"
                        placeholder="e.g. 本科及以上"
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                        className="h-12 bg-[#030014]/50 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={submitJobForm}
                      disabled={isParsingJd || isJdReady}
                      className={`h-12 px-8 text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 ${
                        isJdReady 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      {isJdReady ? '已载入 ✅' : (isParsingJd ? '注入中...' : '提交配置')}
                    </Button>
                  </div>
                </div>
              )}

              {/* 简历上传 */}
              <div className="space-y-4">
                <Label htmlFor="resume-upload" className="text-slate-300 font-semibold text-sm uppercase tracking-wider ml-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  载入候选人数据谱 (Resume)
                </Label>
                <div 
                  className={`group relative border border-dashed rounded-3xl p-12 text-center transition-all duration-300 overflow-hidden ${
                    isUploadingResume 
                      ? "border-cyan-500/30 bg-cyan-500/5 cursor-not-allowed"
                      : isResumeReady
                      ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      : "border-white/20 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-white/[0.04] cursor-pointer"
                  }`}
                >
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={uploadResume}
                    className="hidden"
                    disabled={isUploadingResume}
                  />
                  
                  <label
                    htmlFor={isUploadingResume ? "" : "resume-upload"}
                    className={`block relative z-10 ${isUploadingResume ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex flex-col items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                        isUploadingResume ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : 
                        isResumeReady ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 border-white/10 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 group-hover:scale-110"
                      }`}>
                        {isUploadingResume ? (
                          <Loader2 className="w-8 h-8 animate-spin" />
                        ) : isResumeReady ? (
                          <CheckCircle2 className="w-8 h-8" />
                        ) : (
                          <Fingerprint className="w-8 h-8" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className={`text-lg font-bold transition-colors ${
                          isUploadingResume ? "text-cyan-400" : 
                          isResumeReady ? "text-emerald-400" : "text-slate-200"
                        }`}>
                          {resumeFile ? resumeFile.name : (isResumeReady ? "数据谱载入完成" : "点击或拖拽上传简历")}
                        </p>
                        <p className="text-slate-500 text-sm font-light">
                          {isResumeReady ? "生物特征比对通过" : "支持 PDF、DOCX 格式（MAX 10MB）"}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 面试风格选择 */}
              <div className="space-y-4">
                <Label className="text-slate-300 font-semibold text-sm uppercase tracking-wider ml-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  系统运行模式 (Style)
                </Label>
                <div className="flex bg-[#030014] border border-white/5 rounded-2xl p-1.5 relative overflow-hidden">
                  <div 
                    className="absolute inset-y-1.5 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-500 ease-out"
                    style={{
                      width: 'calc((100% - 12px) / 3)',
                      transform: `translateX(calc(${interviewStyle * 100}% + ${interviewStyle * 0}px))`,
                      left: '6px',
                      background: interviewStyle === 0 ? 'rgba(59, 130, 246, 0.2)' : interviewStyle === 1 ? 'rgba(168, 85, 247, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                      borderColor: interviewStyle === 0 ? 'rgba(59, 130, 246, 0.5)' : interviewStyle === 1 ? 'rgba(168, 85, 247, 0.5)' : 'rgba(244, 63, 94, 0.5)'
                    }}
                  />
                  
                  {[
                    { label: 'Mild / 温和探索', desc: '引导式提问' },
                    { label: 'Normal / 标准校准', desc: '全维度考核' },
                    { label: 'Pressure / 高压测试', desc: '极致压力面' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInterviewStyle(idx)}
                      className={`flex-1 relative z-10 py-3 text-center rounded-xl transition-colors duration-300 flex flex-col items-center gap-1 ${
                        interviewStyle === idx ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <span className="font-bold text-sm tracking-wide">{item.label}</span>
                      <span className="text-[10px] font-light opacity-70">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 开始面试按钮 */}
              <div className="pt-8">
                <Button
                  onClick={handleStartInterview}
                  disabled={!(isJdReady && isResumeReady) || isCreatingSession}
                  className="w-full h-16 bg-white text-black hover:bg-slate-200 disabled:bg-white/5 disabled:text-slate-600 rounded-2xl text-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center">
                    {isCreatingSession ? (
                      <>
                        <Loader2 className="mr-3 w-6 h-6 animate-spin text-cyan-500" />
                        <span>连接中枢网络...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-3 w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
                        <span className="tracking-wider">启动模拟矩阵</span>
                        <CheckCircle2 className={`ml-3 w-6 h-6 text-emerald-500 transition-all duration-500 ${isJdReady && isResumeReady ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`} />
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}