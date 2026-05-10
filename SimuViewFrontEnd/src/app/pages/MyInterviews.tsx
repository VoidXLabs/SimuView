import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Briefcase, Calendar, Loader2, Clock, CheckCircle2, AlertCircle, ServerCrash, Terminal, ScanSearch } from "lucide-react";
import { Header } from "../components/Header";
import apiClient from '../api/apiClient';
import { toast } from "sonner";
import { Button } from "../components/ui/button";

interface InterviewRecord {
  interviewId: number;
  userId: number;
  jdId: number;
  resumeId: number;
  status: number;
  startTime: string;
  endTime: string;
}

export default function MyInterviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loadingReportId, setLoadingReportId] = useState<number | null>(null);

  const getUserId = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || null;
    }
    return null;
  };

  const fetchInterviewRecords = async () => {
    const userId = getUserId();
    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/interview-records/page', {
        userId: parseInt(userId),
        pageNum: 1,
        pageSize: 100 // Load more for list
      });

      const data = response.data;
      const records = data.data?.records || data.data?.content || data.data?.list || [];
      if (data.success && records) {
        setInterviews(records.map((r: any) => ({
          ...r,
          // 确保有一个唯一的 interviewId
          interviewId: r.interviewId || r.id || r.sessionId
        })));
      }
    } catch (error: any) {
      console.error("Failed to fetch interview records", error);
      toast.error(error.response?.data?.message || "获取面试历史失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewRecords();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusInfo = (status: number | string) => {
    const s = String(status).toUpperCase();
    if (s === '0' || s === 'PENDING') {
      return { text: 'PENDING', color: 'text-slate-400', bg: 'bg-white/5 border-white/10', icon: <Clock className="w-3.5 h-3.5" /> };
    }
    if (s === '1' || s === 'IN_PROGRESS' || s === 'ACTIVE' || s === 'STARTED') {
      return { text: 'ACTIVE', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: <ActivityIcon className="w-3.5 h-3.5" /> };
    }
    if (s === '2' || s === 'COMPLETED' || s === 'EVALUATED' || s === 'RESOLVED') {
      return { text: 'RESOLVED', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
    }
    return { text: s || 'UNKNOWN', color: 'text-slate-500', bg: 'bg-white/5 border-white/10', icon: <AlertCircle className="w-3.5 h-3.5" /> };
  };

  // 简单的波形图标组件
  const ActivityIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );

  const fetchReport = async (interviewId: number) => {
    setLoadingReportId(interviewId);
    setSelectedReport(null);
    try {
      const response = await apiClient.get(`/api/v1/sessions/${interviewId}/report`);
      const data = response.data;
      if (data.success && data.data) {
        setSelectedReport(data.data);
      } else {
        toast.error(data.message || "未能加载报告");
        setSelectedReport({ status: "UNAVAILABLE", reason: "Data streams missing or uncompiled.", raw: data });
      }
    } catch (error: any) {
      console.error("Failed to fetch report", error);
      toast.error("报告获取失败，可能尚未生成");
      setSelectedReport({ status: "ERROR", error: "Connection anomaly", details: error.message });
    } finally {
      setLoadingReportId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 font-sans relative selection:bg-cyan-500/30 overflow-hidden">
      {/* 背景特效 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.10]"></div>
      </div>

      <div className="relative z-10 border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl">
        <Header showNav />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 h-[calc(100vh-64px)]">
        {/* 左侧列表：会话记录 */}
        <div className="flex-1 lg:max-w-md w-full flex flex-col h-full">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white flex items-center gap-4 tracking-tight">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-cyan-400" />
              </div>
              数据归档
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-light">检索历史模拟会话与神经评测报告</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 bg-white/[0.02] border border-white/5 rounded-3xl">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
                <span className="text-slate-400 font-mono text-sm tracking-widest uppercase">SYNCING LOGS...</span>
              </div>
            ) : interviews.length > 0 ? (
              interviews.map((interview) => {
                const statusInfo = getStatusInfo(interview.status);
                const isSelected = selectedReport && loadingReportId !== interview.interviewId; // 粗略判断选中状态(可自行优化)
                
                return (
                  <div
                    key={interview.interviewId}
                    onClick={() => fetchReport(interview.interviewId)}
                    className={`group relative bg-[#0a0a14]/80 border backdrop-blur-md rounded-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden
                      ${loadingReportId === interview.interviewId 
                        ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-white/5' 
                        : 'border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    {/* 左侧高光条 */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest border ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.text}
                      </div>
                      <span className="text-slate-500 text-xs font-mono">ID:{interview.interviewId.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-300 text-sm">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="font-mono text-xs">{formatDate(interview.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300 text-sm">
                        <ScanSearch className="w-4 h-4 text-slate-500" />
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-slate-500">JD_REF:</span>
                          <span className="text-cyan-400/80 bg-cyan-400/10 px-1.5 rounded">{interview.jdId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-white/5 flex flex-col items-center">
                <ServerCrash className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400 mb-6 font-light">数据库中未检索到相关记录</p>
                <Button 
                  onClick={() => navigate("/setup")} 
                  className="bg-white text-black hover:bg-slate-200 font-bold px-8 rounded-xl"
                >
                  初始化新会话
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧详情：JSON 数据 */}
        <div className="flex-[2] bg-[#0a0a14]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 lg:p-10 flex flex-col h-full shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] h-[1px] bg-gradient-to-l from-cyan-500/50 to-transparent"></div>
          
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
            <div>
              <h3 className="text-2xl font-black text-white tracking-wide">解析报告流</h3>
              <p className="text-slate-500 text-sm font-mono mt-1 uppercase tracking-widest">Raw Data Output</p>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
            </div>
          </div>

          {loadingReportId ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-2 border-white/5 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <span className="text-cyan-500 font-mono text-sm tracking-widest uppercase animate-pulse">
                Decrypting Protocol...
              </span>
            </div>
          ) : selectedReport ? (
            <div className="bg-[#030014] rounded-2xl p-6 overflow-auto flex-1 border border-white/5 shadow-inner">
              <pre className="text-emerald-400 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-all selection:bg-emerald-500/30">
                {JSON.stringify(selectedReport, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-white/[0.01] rounded-2xl border border-white/5 border-dashed">
              <Terminal className="w-10 h-10 mb-3 opacity-50" />
              <p className="font-mono text-sm tracking-widest uppercase">Awaiting Selection</p>
              <p className="text-xs font-light mt-2 opacity-50">Select a log entry to decrypt details</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}