import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon, Loader2, CheckCircle2, Sparkles, FileText, Edit3, ChevronRight } from "lucide-react";
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

  const [jdId, setJdId] = useState("");
  const [resumeId, setResumeId] = useState("");

  // 解析招聘信息（URL模式）
  const analysisJobUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error("Please enter job URL!");
      return;
    }

    setIsParsingJd(true);

    try {
      const response = await apiClient.post('/api/v1/preview/job-parse', {
        view_id: view_id,
        url: jobUrl
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
    if (!formData.title.trim()) {
      toast.error("Please enter job title!");
      return;
    }
    if (!formData.jd_content.trim()) {
      toast.error("Please enter job description!");
      return;
    }

    setIsParsingJd(true);

    try {
      const response = await apiClient.post('/api/v1/preview/job-parse', {
        view_id: view_id,
        title: formData.title,
        jd_content: formData.jd_content,
        jd_url: "",
        salary_range: formData.salary_range,
        work_experience: formData.work_experience,
        education: formData.education
      });

      const data = response.data;
      if (data.success && data.data?.jd_id) {
        setJdId(data.data.jd_id);
        setIsJdReady(true);
        toast.success("Job information saved successfully!");
      } else {
        toast.error(data.message || "Failed to save job information");
      }
    } catch (error: any) {
      console.error("Failed to save job information", error);
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
      if (data.success && data.data?.id) {
        setResumeId(data.data.id);
        setIsResumeReady(true);
        toast.success("Resume uploaded successfully!");
      } else {
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

  const handleStartInterview = () => {
    if (isJdReady && isResumeReady) {
      navigate("/interview", {
        state: {
          view_id,
          jdId,
          resumeId
        },
      });
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
    <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans">
      {/* 复杂的背景装饰层 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 top-0 -z-10 h-[500px] w-[500px] -translate-x-[20%] -translate-y-[20%] rounded-full bg-emerald-500 opacity-20 blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[500px] w-[500px] translate-x-[20%] translate-y-[20%] rounded-full bg-teal-500 opacity-20 blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        <Header showNav />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back to Home</span>
        </button>

        <div className="rounded-[2.5rem] bg-slate-800/60 backdrop-blur-xl border border-white/10 p-8 md:p-14 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Card Top Border Highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 opacity-50"></div>

          <div className="space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-bold tracking-wide mb-2">
              <Sparkles className="w-4 h-4" />
              Configure Session
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              Interview Setup
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
              Provide the job details and your resume to generate a highly customized AI interview experience.
            </p>
          </div>

          {/* 模式切换 */}
          <div className="mb-10 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex">
              <button
                onClick={() => { setMode('url'); resetJd(); }}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold transition-all ${
                  mode === 'url' 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LinkIcon className="w-5 h-5" />
                <span>Smart Parse (URL)</span>
              </button>
              <button
                onClick={() => { setMode('form'); resetJd(); }}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold transition-all ${
                  mode === 'form' 
                    ? 'bg-gradient-to-r from-teal-600 to-pink-600 text-white shadow-lg shadow-teal-900/20' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Edit3 className="w-5 h-5" />
                <span>Manual Entry</span>
              </button>
          </div>

          <div className="space-y-12">
            {/* URL模式 - 岗位URL输入区 */}
            {mode === 'url' && (
              <div className="space-y-4 bg-slate-700/30 p-6 sm:p-8 rounded-[2rem] border border-white/5">
                <Label htmlFor="job-url" className="text-neutral-200 font-bold text-base flex items-center gap-2 ml-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Job Posting URL
                </Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[1.25rem] blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors z-10" />
                    <Input
                      id="job-url"
                      type="url"
                      placeholder="e.g. https://www.zhipin.com/job_detail/..."
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      className="relative pl-14 h-16 bg-slate-800/80 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:border-emerald-500 focus:ring-0 transition-all text-base shadow-inner"
                    />
                  </div>
                  <Button 
                    onClick={analysisJobUrl}
                    disabled={isParsingJd || isJdReady}
                    className={`h-16 px-8 text-base font-bold rounded-2xl transition-all active:scale-95 min-w-[140px] ${
                      isJdReady 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-white text-black hover:bg-neutral-200 shadow-xl'
                    }`}
                  >
                    {isJdReady ? (
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Ready</span>
                    ) : (isParsingJd ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Parsing</span>
                    ) : 'Parse URL')}
                  </Button>
                </div>
                <p className="text-sm text-slate-400 ml-1 font-medium flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Currently optimized for Zhipin and mainstream platforms.
                </p>
              </div>
            )}

            {/* 表单模式 - 岗位信息填写 */}
            {mode === 'form' && (
              <div className="space-y-6 bg-slate-700/30 p-6 sm:p-8 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  <h3 className="text-neutral-200 font-bold text-base">Job Details</h3>
                </div>
                
                {/* 岗位名称 */}
                <div className="space-y-2 relative group">
                  <div className="absolute -inset-0.5 bg-teal-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                  <Input
                    id="job-title"
                    type="text"
                    placeholder="Job Title (e.g., Senior Frontend Engineer) *"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="relative h-14 bg-slate-800/80 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:border-teal-500 focus:ring-0 transition-all text-base shadow-inner"
                  />
                </div>

                {/* 岗位描述 */}
                <div className="space-y-2 relative group">
                  <div className="absolute -inset-0.5 bg-teal-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                  <textarea
                    id="job-content"
                    placeholder="Detailed Job Description *"
                    value={formData.jd_content}
                    onChange={(e) => setFormData({...formData, jd_content: e.target.value})}
                    rows={5}
                    className="relative w-full bg-slate-800/80 border border-white/10 text-white placeholder:text-slate-400 rounded-xl px-4 py-4 focus:border-teal-500 focus:ring-0 outline-none transition-all text-base resize-none shadow-inner leading-relaxed"
                  />
                </div>

                {/* 其他字段 - 三列布局 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <Input
                    type="text"
                    placeholder="Salary Range (e.g., 15K-25K)"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                    className="h-12 bg-slate-800/80 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-teal-500 focus:ring-0 transition-all text-sm"
                  />
                  <Input
                    type="text"
                    placeholder="Experience (e.g., 3-5 years)"
                    value={formData.work_experience}
                    onChange={(e) => setFormData({...formData, work_experience: e.target.value})}
                    className="h-12 bg-slate-800/80 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-teal-500 focus:ring-0 transition-all text-sm"
                  />
                  <Input
                    type="text"
                    placeholder="Education (e.g., Bachelor)"
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                    className="h-12 bg-slate-800/80 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-teal-500 focus:ring-0 transition-all text-sm"
                  />
                </div>

                {/* 提交按钮 */}
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={submitJobForm}
                    disabled={isParsingJd || isJdReady}
                    className={`h-14 px-8 text-base font-bold rounded-xl transition-all active:scale-95 ${
                      isJdReady 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-white text-black hover:bg-neutral-200 shadow-xl'
                    }`}
                  >
                    {isJdReady ? (
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Saved</span>
                    ) : (isParsingJd ? 'Saving...' : 'Save Details')}
                  </Button>
                </div>
              </div>
            )}

            {/* 简历上传 */}
            <div className="space-y-4 bg-slate-700/30 p-6 sm:p-8 rounded-[2rem] border border-white/5">
              <Label htmlFor="resume-upload" className="text-neutral-200 font-bold text-base flex items-center gap-2 ml-1">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                Your Resume
              </Label>
              <div 
                className={`group relative border border-dashed rounded-[1.5rem] p-12 text-center transition-all duration-300 overflow-hidden ${
                  isUploadingResume 
                    ? "border-emerald-500/50 bg-emerald-500/5 cursor-not-allowed"
                    : isResumeReady
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-white/20 bg-slate-800/50 hover:border-emerald-400/50 hover:bg-emerald-500/5 cursor-pointer"
                }`}
              >
                {/* 悬浮背景光晕 */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-colors duration-500"></div>

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
                  <div className="flex flex-col items-center gap-6">
                    <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl ${
                      isUploadingResume ? "bg-emerald-500 text-white" : 
                      isResumeReady ? "bg-emerald-500 text-white scale-110 shadow-emerald-500/30" : "bg-slate-700 text-slate-300 border border-white/10 group-hover:scale-110 group-hover:text-emerald-400 group-hover:border-emerald-500/30 group-hover:shadow-emerald-500/20"
                    }`}>
                      {isUploadingResume ? (
                        <Loader2 className="w-10 h-10 animate-spin" />
                      ) : isResumeReady ? (
                        <CheckCircle2 className="w-10 h-10" />
                      ) : (
                        <Upload className="w-10 h-10" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className={`text-xl font-bold transition-colors tracking-wide ${
                        isUploadingResume ? "text-emerald-400" : 
                        isResumeReady ? "text-emerald-400" : "text-white"
                      }`}>
                        {resumeFile ? resumeFile.name : (isResumeReady ? "Upload Complete" : "Click to upload or drag and drop")}
                      </p>
                      <p className="text-slate-400 font-medium text-sm">
                        {isResumeReady ? "Resume processed successfully." : "Support for PDF, DOCX (Max 10MB)"}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 开始面试按钮 */}
            <div className="pt-8">
              <Button
                onClick={handleStartInterview}
                disabled={!(isJdReady && isResumeReady)}
                className="relative w-full h-20 overflow-hidden disabled:bg-slate-700 disabled:text-slate-500 disabled:border-white/5 disabled:shadow-none text-white rounded-[1.5rem] text-xl font-black shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-95 group border-0"
              >
                {/* 动态背景 */}
                <div className={`absolute inset-0 ${isJdReady && isResumeReady ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600' : 'bg-transparent'}`}></div>
                
                {/* 发光扫过效果 */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>

                <div className="relative flex items-center justify-center gap-3">
                  <Sparkles className={`w-6 h-6 ${isJdReady && isResumeReady ? 'animate-pulse' : 'opacity-50'}`} />
                  <span>Start Mock Interview</span>
                  <ChevronRight className={`w-6 h-6 transition-transform duration-500 ${isJdReady && isResumeReady ? "translate-x-1 opacity-100" : "opacity-0 -translate-x-4"}`} />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}