import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Loader2, 
  Calendar, 
  FileSearch, 
  Plus,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Header } from "../components/Header";
import apiClient from '../api/apiClient';
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface ResumeInformation {
  resumeId: number;
  userId: number;
  fileUrl: string;
  content: string;
  createTime: string;
}

export default function Resumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeInformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResume, setSelectedResume] = useState<ResumeInformation | null>(null);

  const getUserId = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user.userId || null;
    }
    return null;
  };

  const fetchResumes = async () => {
    const userId = getUserId();
    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/resume/page', {
        userId: parseInt(userId),
        pageNum: 1,
        pageSize: 100
      });

      const data = response.data;
      if (data.success && data.data?.records) {
        setResumes(data.data.records);
      }
    } catch (error: any) {
      console.error("Failed to fetch resumes", error);
      toast.error(error.response?.data?.message || "获取简历列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("目前仅支持 PDF 格式的简历");
      return;
    }

    setUploading(true);
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
        fetchResumes();
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      toast.error(error.response?.data?.message || "上传失败");
    } finally {
      setUploading(false);
      // 清除 input
      e.target.value = '';
    }
  };

  const handleDelete = async (resumeId: number) => {
    if (!confirm("确定要删除这份简历吗？")) return;

    try {
      const response = await apiClient.delete(`/api/v1/resume/${resumeId}`);
      if (response.data.success) {
        toast.success("简历已删除");
        setResumes(resumes.filter(r => r.resumeId !== resumeId));
        if (selectedResume?.resumeId === resumeId) setSelectedResume(null);
      }
    } catch (error: any) {
      toast.error("删除失败");
    }
  };

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

  const filteredResumes = resumes.filter(r => 
    r.content?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.fileUrl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030014] text-slate-900 dark:text-slate-200 font-sans relative selection:bg-cyan-500/30 overflow-hidden transition-colors duration-300">
      {/* 背景特效 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-cyan-100/30 dark:bg-cyan-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/30 dark:bg-purple-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.10]"></div>
      </div>

      <div className="relative z-10 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-[#030014]/50 backdrop-blur-xl">
        <Header showNav />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 h-[calc(100vh-64px)]">
        {/* 左侧：简历列表 */}
        <div className="flex-1 lg:max-w-md w-full flex flex-col h-full">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                </div>
                简历库
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-light">管理您的个人简历资产 <span className="text-[10px] opacity-60 ml-2 font-mono">(PDF ONLY)</span></p>
            </div>
            
            <label className="cursor-pointer">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'}`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {uploading ? '上传中...' : '上传 PDF'}
              </div>
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>

          {/* 搜索栏 */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="搜索简历内容..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-2xl h-12"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto pr-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
                <span className="text-slate-500 dark:text-slate-400 font-mono text-sm tracking-widest uppercase">LOADING ASSETS...</span>
              </div>
            ) : filteredResumes.length > 0 ? (
              filteredResumes.map((resume) => (
                <div
                  key={resume.resumeId}
                  onClick={() => setSelectedResume(resume)}
                  className={`group relative bg-white dark:bg-[#0a0a14]/80 border backdrop-blur-md rounded-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md
                    ${selectedResume?.resumeId === resume.resumeId 
                      ? 'border-cyan-500 dark:border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-cyan-50/50 dark:bg-white/5' 
                      : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {resume.fileUrl.split('/').pop() || '我的简历'}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <Calendar className="w-3 h-3" />
                          {formatDate(resume.createTime)}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(resume.resumeId);
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col items-center">
                <FileSearch className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-6 font-light">未找到匹配的简历</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：简历内容预览 */}
        <div className="flex-[2] bg-white dark:bg-[#0a0a14]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 lg:p-10 flex flex-col h-full shadow-xl dark:shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] h-[1px] bg-gradient-to-l from-cyan-500/50 to-transparent"></div>
          
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-white/5 pb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-wide">预览解析文本</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-mono mt-1 uppercase tracking-widest">Document Analysis View</p>
            </div>
            {selectedResume && (
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">PARSING SUCCESSFUL</span>
              </div>
            )}
          </div>

          {selectedResume ? (
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl p-8 font-serif leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {selectedResume.content || "该简历未包含文本内容或解析失败。"}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-slate-200 dark:border-white/5 border-dashed">
              <FileSearch className="w-10 h-10 mb-3 opacity-50" />
              <p className="font-mono text-sm tracking-widest uppercase">请选择一份简历进行预览</p>
              <p className="text-xs font-light mt-2 opacity-50">Select a document to view AI-extracted content</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}