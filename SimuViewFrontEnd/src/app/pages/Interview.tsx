import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { Loader2, CheckCircle2, Keyboard, Send, Sparkles, Clock, FileText, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import apiClient from "../api/apiClient";

interface Message {
  role: "ai" | "user";
  content: string;
  timestamp: Date;
  questionId?: number;
}

interface EvaluationReport {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }[];
}

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, questionCount = 5, jdId, resumeId } = location.state || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(questionCount || 5);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const receivedQuestionIdsRef = useRef<Set<number>>(new Set());
  const isLastQuestionRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 连接 SSE 获取下一个问题
  const connectToQuestionStream = useCallback(() => {
    if (!sessionId) {
      toast.error("Session ID is missing");
      navigate("/");
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const token = localStorage.getItem('token');
    setIsLoading(false);
    setIsAiThinking(true);

    // 使用 fetch API 模拟 SSE，因为 EventSource 不支持自定义请求头
    const url = `http://localhost:8080/api/v1/sessions/${sessionId}/questions/stream`;
    
    // 用于存储流式接收的问题文本
    let streamingQuestion = '';
    
    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'token': token || '',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include',
      signal: abortController.signal
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader');
      }
      
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      
      const readStream = async () => {
        try {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log("Stream closed");
            return;
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';
          
          for (const block of lines) {
            if (!block.trim()) continue;
            
            try {
              const dataMatch = block.match(/^data:\s*(.+)$/m);
              const eventMatch = block.match(/^event:\s*(.+)$/m);
              
              if (dataMatch) {
                const data = JSON.parse(dataMatch[1]);
                const eventName = eventMatch ? eventMatch[1].trim() : '';
                console.log("SSE data received:", { eventName, data });
                
                if (eventName === 'question.start') {
                   setMessages(prev => {
                     if (prev.length === 0 || prev[prev.length-1].questionId) {
                       return [...prev, { role: 'ai', content: '', timestamp: new Date() }];
                     }
                     return prev;
                   });
                } else if (eventName === 'question.token') {
                  if (data.token) {
                    streamingQuestion += data.token;
                    setMessages(prev => {
                      const newMessages = [...prev];
                      if (newMessages.length > 0 && 
                          newMessages[newMessages.length - 1].role === 'ai' && 
                          !newMessages[newMessages.length - 1].questionId) {
                           newMessages[newMessages.length - 1].content = streamingQuestion;
                      }
                      return newMessages;
                    });
                  }
                } else if (eventName === 'question.end') {
                  const questionId = data.questionId;
                  const questionContent = data.fullText || streamingQuestion;
                  const isLast = data.isLast;
                  
                  if (isLast) {
                    isLastQuestionRef.current = true;
                  }

                  if (questionId && receivedQuestionIdsRef.current.has(questionId)) {
                    console.log(`Skipping duplicate questionId: ${questionId}`);
                    continue;
                  }

                  if (questionContent) {
                    const aiMessage: Message = {
                      role: "ai",
                      content: questionContent,
                      timestamp: new Date(),
                      questionId: questionId
                    };
                    
                    setMessages(prev => {
                      if (prev.length > 0 && prev[prev.length - 1].role === 'ai' && !prev[prev.length - 1].questionId) {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = aiMessage;
                        return newMsgs;
                      }
                      return [...prev, aiMessage];
                    });

                    setCurrentQuestionId(questionId);
                    setIsAiThinking(false);
                    setIsInterviewActive(true);
                    
                    if (questionId) {
                      receivedQuestionIdsRef.current.add(questionId);
                    }
                    streamingQuestion = '';
                  }
                }
              }
            } catch (error) {
              console.error("Error parsing SSE message:", error);
            }
          }
          
          readStream();
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log('Fetch aborted');
          } else {
            console.error("Stream error:", error);
            toast.error("Connection error, please try again");
            setIsAiThinking(false);
          }
        }
      };
      
      readStream();
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error("Fetch error:", error);
        toast.error("Failed to connect to question stream");
        setIsLoading(false);
        setIsAiThinking(false);
      }
    });
  }, [sessionId, navigate]);

  // 初始化连接
  useEffect(() => {
    connectToQuestionStream();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [connectToQuestionStream]);

  // 面试结束，开始轮询状态
  const handleInterviewEnd = () => {
    setIsInterviewActive(false);
    setInterviewComplete(true);
    setIsPollingStatus(true);
    
    // 添加面试结束消息
    const endMessage: Message = {
      role: "ai",
      content: "感谢您完成本次面试。我们的AI系统正在分析您的表现并生成评估报告，请稍候...",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, endMessage]);
    
    // 开始轮询状态
    pollForReport();
  };

  // 轮询获取评估报告状态
  const pollForReport = async () => {
    if (!sessionId) return;

    const maxAttempts = 30; // 最多等待30次
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await apiClient.get(`/api/v1/sessions/${sessionId}/status`);
        const data = response.data;
        
        if (data.success && data.data) {
          const status = data.data.status;
          console.log(`Poll attempt ${attempts}: status = ${status}`);
          
          if (status === "EVALUATED") {
            // 状态已变为已评估，跳转到主页
            setIsPollingStatus(false);
            toast.success("评估报告生成完毕！");
            navigate("/");
            return;
          } else if (status === "EVALUATION_FAILED") {
            toast.error("评估生成失败，请稍后重试");
            setIsPollingStatus(false);
            return;
          }
          
          if (attempts >= maxAttempts) {
            toast.error("评估生成超时，请稍后查看");
            setIsPollingStatus(false);
            return;
          }
          
          // 继续轮询
          setTimeout(poll, 2000); // 每2秒轮询一次
        }
      } catch (error) {
        console.error("Poll error:", error);
        if (attempts >= maxAttempts) {
          setIsPollingStatus(false);
        } else {
          setTimeout(poll, 2000);
        }
      }
    };

    poll();
  };

  // 获取评估报告
  const fetchReport = async () => {
    if (!sessionId) return;

    try {
      const response = await apiClient.get(`/api/v1/sessions/${sessionId}/report`);
      const data = response.data;
      
      if (data.success && data.data) {
        setReport(data.data);
        setShowReport(true);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      toast.error("Failed to load evaluation report");
    }
  };

  // 提交用户回答
  const submitAnswer = async () => {
    if (!textAnswer.trim()) {
      toast.error('请输入回答内容');
      return;
    }

    if (currentQuestionId === null) {
      toast.error('Question ID is missing');
      return;
    }

    // 添加用户回答到消息列表
    const userMessage: Message = {
      role: "user",
      content: textAnswer,
      timestamp: new Date(),
      questionId: currentQuestionId
    };
    setMessages(prev => [...prev, userMessage]);
    setTextAnswer("");
    
    // 向后端发送用户回答
    setIsAiThinking(true);

    // 主动关闭当前问题的 SSE 连接
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    try {
      await apiClient.post(`/api/v1/sessions/${sessionId}/answer`, {
        questionId: currentQuestionId,
        answer: textAnswer
      });
      
      // 增加问题索引
      setCurrentQuestionIndex(prev => prev + 1);
      
      if (isLastQuestionRef.current) {
        handleInterviewEnd();
      } else {
        // 提交回答后，立即请求下一个问题的数据流
        connectToQuestionStream();
      }
      
    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast.error("Failed to submit answer");
      setIsAiThinking(false);
    }
  };

  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 items-center justify-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
        </div>
        <p className="text-slate-400 text-lg mt-6">Connecting to interview session...</p>
        <p className="text-slate-500 text-sm mt-2">Please wait while we prepare your questions</p>
      </div>
    );
  }

  // 显示评估报告
  if (showReport && report) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 overflow-y-auto">
        {/* 顶部 */}
        <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-xl border-b border-white/5 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Interview Report</h1>
              <p className="text-slate-400 text-sm mt-1">Session #{sessionId}</p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105 active:scale-95"
            >
              Back to Home
            </Button>
          </div>
        </div>

        {/* 报告内容 */}
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* 总分 */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-10 text-center">
            <p className="text-slate-400 text-sm uppercase tracking-widest mb-4">Overall Score</p>
            <div className="text-8xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {report.overallScore}
            </div>
            <p className="text-slate-400 mt-2">out of 100</p>
          </div>

          {/* 优点 */}
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-8">
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {report.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-300">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 缺点 */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-8">
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {report.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-300">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 详细反馈 */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              Detailed Feedback
            </h3>
            {report.detailedFeedback.map((item, index) => (
              <div key={index} className="rounded-2xl bg-slate-800/50 border border-white/10 overflow-hidden">
                <div className="bg-slate-700/50 px-6 py-4 flex items-center justify-between">
                  <span className="text-blue-400 font-semibold">Question {index + 1}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    item.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    item.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    Score: {item.score}
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Question</p>
                    <p className="text-white">{item.question}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Your Answer</p>
                    <p className="text-slate-300">{item.answer}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">AI Feedback</p>
                    <p className="text-slate-300">{item.feedback}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 轮询状态界面
  if (isPollingStatus) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          <div className="relative mb-8">
            <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Generating Report</h2>
          <p className="text-slate-400 text-center mb-8">
            Our AI is analyzing your interview responses. This may take a few moments...
          </p>
          
          {/* 进度条动画 */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <span>Processing</span>
              <span className="animate-pulse">Please Wait</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 w-full origin-left animate-[progress-indeterminate_2s_ease-in-out_infinite]">
                <style>{`
                  @keyframes progress-indeterminate {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                  }
                `}</style>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-8 text-slate-500 bg-slate-900/50 px-4 py-2 rounded-full border border-white/5">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Please don't close this page</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 relative overflow-hidden font-sans">
      {/* 背景装饰 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 top-0 -z-10 h-[500px] w-[500px] -translate-x-[20%] -translate-y-[20%] rounded-full bg-emerald-500 opacity-10 blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[500px] w-[500px] translate-x-[20%] translate-y-[20%] rounded-full bg-teal-500 opacity-10 blur-[120px]"></div>
      </div>

      {/* 顶部进度条 */}
      <div className="relative z-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 p-4 shrink-0 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase">
                Progress: Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              {interviewComplete && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SESSION COMPLETE
                </span>
              )}
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shadow-xl">
            <div className="relative">
              <div className={`w-2 h-2 rounded-full ${isAiThinking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
            </div>
            <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">AI Interviewer</span>
          </div>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-8 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-6 duration-700`}
            >
              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-[1.5rem] px-6 py-5 shadow-2xl transition-all ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none shadow-emerald-900/20"
                    : "bg-slate-800/80 backdrop-blur-md border border-white/10 text-neutral-100 rounded-tl-none"
                }`}
              >
                <div className={`absolute inset-0 opacity-10 pointer-events-none ${message.role === "user" ? "bg-[radial-gradient(circle_at_top_right,white,transparent)]" : "bg-[radial-gradient(circle_at_top_left,white,transparent)]"}`}></div>
                
                <div className="flex flex-col gap-1.5 relative z-10">
                  <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-50 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "ai" && <Sparkles className="w-2.5 h-2.5 text-emerald-400" />}
                    {message.role === "ai" ? "AI Interviewer" : "You"}
                  </div>
                  <p className="leading-relaxed text-sm sm:text-base font-medium tracking-tight whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <div className={`text-[8px] font-mono opacity-30 mt-1 ${message.role === "user" ? "text-right" : "text-left"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI思考状态 */}
          {isAiThinking && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-6">
              <div className="bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-3 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">AI is preparing question...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部控制区 - 文字输入模式 */}
      <div className="relative z-20 bg-slate-900/80 backdrop-blur-2xl border-t border-white/5 p-6 sm:p-8 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto">
          {!interviewComplete ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center gap-2 text-slate-400 ml-1">
                <Keyboard className="w-4 h-4" />
                <span className="text-xs font-medium">Text Input Mode</span>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                <Textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your response here..."
                  className="relative min-h-[120px] bg-slate-800/80 border-white/10 rounded-2xl p-4 focus:border-emerald-500/50 focus:ring-0 resize-none text-base text-white placeholder:text-slate-500 transition-all shadow-inner leading-relaxed"
                  disabled={isAiThinking || !isInterviewActive}
                />
              </div>
              <Button
                onClick={submitAnswer}
                disabled={isAiThinking || !isInterviewActive || !textAnswer.trim()}
                className="w-full h-12 bg-white text-black hover:bg-neutral-200 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl text-base font-black shadow-2xl transition-all hover:scale-[1.01] active:scale-95"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Answer
              </Button>
              {!isInterviewActive && !isAiThinking && (
                <p className="text-center text-slate-500 text-[10px] mt-1">
                  Waiting for AI to prepare next question...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-700">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Interview Finished!</h2>
                <p className="text-slate-400 text-sm">Generating your personalized evaluation report...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}