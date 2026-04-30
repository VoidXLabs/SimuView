import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon, Loader2, CheckCircle2, Sparkles, FileText, Edit3 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <Header showNav />

      <div className="relative z-10 max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="rounded-3xl bg-neutral-800/50 backdrop-blur-md border border-neutral-700/30 p-8 md:p-12 shadow-2xl">
          <div className="space-y-1 mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Interview Setup
            </h2>
            <p className="text-neutral-400 text-lg">
              Enter job details and upload your resume for personalized interview questions
            </p>
          </div>

          {/* 模式切换 */}
          <div className="mb-8">
            <div className="flex bg-neutral-700/50 rounded-xl p-1">
              <button
                onClick={() => { setMode('url'); resetJd(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                  mode === 'url' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-5 h-5" />
                <span>Paste Job URL</span>
              </button>
              <button
                onClick={() => { setMode('form'); resetJd(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                  mode === 'form' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-5 h-5" />
                <span>Fill Form</span>
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {/* URL模式 - 岗位URL输入区 */}
            {mode === 'url' && (
              <div className="space-y-3">
                <Label htmlFor="job-url" className="text-neutral-300 font-semibold ml-1">
                  Job Posting URL
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 group">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="job-url"
                      type="url"
                      placeholder="Paste job link: https://www.zhipin.com/job_detail/..."
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      className="pl-12 h-14 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 rounded-2xl focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base"
                    />
                  </div>
                  <Button 
                    onClick={analysisJobUrl}
                    disabled={isParsingJd || isJdReady}
                    className={`h-14 px-8 text-base font-semibold rounded-2xl transition-all shadow-lg active:scale-95 ${
                      isJdReady 
                        ? 'bg-green-500 hover:bg-green-500 text-white shadow-green-500/20'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/20'
                    }`}
                  >
                    {isJdReady ? 'Ready ✅' : (isParsingJd ? 'Parsing...' : 'Parse')}
                  </Button>
                </div>
                <p className="text-xs text-neutral-500 ml-1">
                  Currently optimized for Zhipin platform
                </p>
              </div>
            )}

            {/* 表单模式 - 岗位信息填写 */}
            {mode === 'form' && (
              <div className="space-y-6">
                {/* 岗位名称 */}
                <div className="space-y-2">
                  <Label htmlFor="job-title" className="text-neutral-300 font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Job Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="job-title"
                    type="text"
                    placeholder="e.g., Java Senior Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="h-14 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 rounded-2xl focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base"
                  />
                </div>

                {/* 岗位描述 */}
                <div className="space-y-2">
                  <Label htmlFor="job-content" className="text-neutral-300 font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Job Description <span className="text-red-400">*</span>
                  </Label>
                  <textarea
                    id="job-content"
                    placeholder="Please enter the detailed job description..."
                    value={formData.jd_content}
                    onChange={(e) => setFormData({...formData, jd_content: e.target.value})}
                    rows={4}
                    className="w-full h-32 bg-neutral-700/50 border border-neutral-600 text-white placeholder:text-neutral-500 rounded-2xl px-4 py-3 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base resize-none"
                  />
                </div>

                {/* 其他字段 - 三列布局 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 薪资范围 */}
                  <div className="space-y-2">
                    <Label htmlFor="salary-range" className="text-neutral-400 font-medium">
                      Salary Range
                    </Label>
                    <Input
                      id="salary-range"
                      type="text"
                      placeholder="e.g., 15K-25K"
                      value={formData.salary_range}
                      onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                      className="h-12 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all text-sm"
                    />
                  </div>

                  {/* 工作经验 */}
                  <div className="space-y-2">
                    <Label htmlFor="work-experience" className="text-neutral-400 font-medium">
                      Work Experience
                    </Label>
                    <Input
                      id="work-experience"
                      type="text"
                      placeholder="e.g., 3-5 years"
                      value={formData.work_experience}
                      onChange={(e) => setFormData({...formData, work_experience: e.target.value})}
                      className="h-12 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all text-sm"
                    />
                  </div>

                  {/* 学历要求 */}
                  <div className="space-y-2">
                    <Label htmlFor="education" className="text-neutral-400 font-medium">
                      Education
                    </Label>
                    <Input
                      id="education"
                      type="text"
                      placeholder="e.g., Bachelor"
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      className="h-12 bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* 提交按钮 */}
                <div className="flex justify-end">
                  <Button 
                    onClick={submitJobForm}
                    disabled={isParsingJd || isJdReady}
                    className={`h-12 px-8 text-base font-semibold rounded-xl transition-all shadow-lg active:scale-95 ${
                      isJdReady 
                        ? 'bg-green-500 hover:bg-green-500 text-white shadow-green-500/20'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/20'
                    }`}
                  >
                    {isJdReady ? 'Ready ✅' : (isParsingJd ? 'Saving...' : 'Save Job Info')}
                  </Button>
                </div>
              </div>
            )}

            {/* 简历上传 */}
            <div className="space-y-3">
              <Label htmlFor="resume-upload" className="text-neutral-300 font-semibold ml-1">
                Upload Resume
              </Label>
              <div 
                className={`group relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 overflow-hidden ${
                  isUploadingResume 
                    ? "border-blue-500/20 bg-blue-500/5 cursor-not-allowed"
                    : isResumeReady
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-neutral-600 bg-neutral-700/30 hover:border-blue-500/30 hover:bg-neutral-700/50 cursor-pointer"
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
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                      isUploadingResume ? "bg-blue-500 text-white" : 
                      isResumeReady ? "bg-green-500 text-white scale-110" : "bg-neutral-700 text-neutral-300 group-hover:scale-110 group-hover:shadow-md"
                    }`}>
                      {isUploadingResume ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : isResumeReady ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <Upload className="w-8 h-8" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className={`text-xl font-bold transition-colors ${
                        isUploadingResume ? "text-blue-400" : 
                        isResumeReady ? "text-green-400" : "text-white"
                      }`}>
                        {resumeFile ? resumeFile.name : (isResumeReady ? "Upload Complete" : "Click or drag to upload resume")}
                      </p>
                      <p className="text-neutral-400 font-medium">
                        {isResumeReady ? "✅ Resume uploaded successfully" : "PDF, DOCX formats supported (up to 10MB)"}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 开始面试按钮 */}
            <div className="pt-6">
              <Button
                onClick={handleStartInterview}
                disabled={!(isJdReady && isResumeReady)}
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-[1.25rem] text-xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <Sparkles className="mr-2 w-6 h-6" />
                <span>Enter Interview Room</span>
                <CheckCircle2 className={`ml-3 w-6 h-6 transition-all duration-500 ${isJdReady && isResumeReady ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}