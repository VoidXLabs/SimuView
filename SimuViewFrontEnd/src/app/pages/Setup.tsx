import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon, Loader2, CheckCircle2, Sparkles } from "lucide-react";
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
  const [jobUrl, setJobUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isJdReady, setIsJdReady] = useState(false);
  const [isResumeReady, setIsResumeReady] = useState(false);
  const [isParsingJd, setIsParsingJd] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const [jdId, setJdId] = useState("");
  const [resumeId, setResumeId] = useState("");

  // 解析招聘信息
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

          <div className="space-y-10">
            {/* 岗位URL输入区 */}
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