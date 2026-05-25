import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { Loader2, CheckCircle2, Keyboard, Send, Sparkles, Clock, FileText, AlertCircle, Mic, MicOff, User, Activity, BrainCircuit, History } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import apiClient from "../api/apiClient";
import { encodeWAV } from "../utils/audioUtils";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const TerminalLog = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const possibleLogs = [
    "[OK] Neural connection established...",
    "[OK] Assessment matrix initialized",
    "[OK] Syncing core profiles",
    "[OK] LLM Model loaded successfully",
    "[OK] Voice matrix sync in progress...",
    "[OK] Building evaluation engine",
    "[OK] Network status: STABLE",
    "[OK] Simulation ready for input",
    "[OK] Status code: 0x200",
    "[OK] Core engine warm-up",
    "[OK] Sampling rate: 120Hz",
    "[OK] Encrypted channel active"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const nextLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
        const newLogs = [...prev, nextLog];
        return newLogs.slice(-4);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 font-mono text-[10px] text-cyan-600/60 dark:text-cyan-500/40 text-left w-full space-y-1 overflow-hidden h-16">
      {logs.map((log, i) => (
        <div key={i} className="animate-in fade-in slide-in-from-left-1 duration-300">
          {log}
        </div>
      ))}
    </div>
  );
};

const InterviewTips = () => {
  const tips = [
    { title: "保持自信", content: "相信自己的专业能力，沉着应对每一个问题。" },
    { title: "STAR 法则", content: "用情境、任务、行动、结果来组织你的案例描述。" },
    { title: "眼神交流", content: "保持注视摄像头，让 AI 也能感受到你的专注。" },
    { title: "适度停顿", content: "遇到难题时，深呼吸 2 秒，理清思路后再回答。" },
    { title: "保持亲和", content: "微笑和礼貌是沟通的润滑剂，展现你的职业素养。" }
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 px-2">
        <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-pulse" />
        <span className="text-xs font-black tracking-[0.3em] uppercase text-slate-800 dark:text-white/70">Interview Tips</span>
      </div>
      
      <div className="space-y-4">
        {tips.map((tip, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-cyan-500/20 transition-all group shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1 h-1 rounded-full bg-cyan-500 group-hover:animate-ping" />
              <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400/80 uppercase tracking-widest">{tip.title}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">
              {tip.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-slate-200 dark:border-white/5">
        <p className="text-[10px] text-slate-500 italic leading-relaxed text-center">
          "每一次模拟都是通向成功的一小步，加油！"
        </p>
      </div>
    </div>
  );
};

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
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const receivedQuestionIdsRef = useRef<Set<number>>(new Set());
  const isLastQuestionRef = useRef<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [particlesInit, setParticlesInit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // 虚拟形象相关状态
  const [selectedVirtualId, setSelectedVirtualId] = useState<string | null>(null);
  const virtualInterviewers = [
    { id: 'interviewer-1', name: '资深面试官-张强', path: '/img/interview_man_1.png' },
  ];

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  useEffect(() => {
    if (showHistory) {
      setTimeout(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [showHistory, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const playTTS = async (text: string) => {
    try {
      setIsAiSpeaking(true);
      const response = await fetch('http://localhost:3001/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('TTS Failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current.pause();
      }
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsAiSpeaking(false);
        URL.revokeObjectURL(url);
      };
      
      audio.onerror = () => {
        setIsAiSpeaking(false);
      };
      
      await audio.play();
    } catch (err) {
      console.error("TTS Error", err);
      setIsAiSpeaking(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAndUploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("无法访问麦克风，请检查权限");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (audioRef.current) audioRef.current.pause();
      setIsAiSpeaking(false);
      startRecording();
    }
  };

  const processAndUploadAudio = async (blob: Blob) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = decoded.getChannelData(0);
      
      const wavBlob = encodeWAV(audioData, 16000);
      const formData = new FormData();
      formData.append('audio', wavBlob, 'record.wav');

      const response = await fetch('http://localhost:3001/api/asr', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.error || '识别失败');

      setTextAnswer(prev => prev + (prev ? " " : "") + data.text);
    } catch (error: any) {
      toast.error("识别失败: " + error.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  // 连接 SSE 获取下一个问题
  const connectToQuestionStream = useCallback(() => {
    if (!sessionId) {
      toast.error("Session ID is missing");
      navigate("/");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const token = localStorage.getItem('token');
    setIsLoading(false);
    setIsAiThinking(true);

    const url = `http://localhost:8080/api/v1/sessions/${sessionId}/questions/stream`;
    
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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get reader');
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      
      const readStream = async () => {
        try {
          const { done, value } = await reader.read();
          if (done) { console.log("Stream closed"); return; }
          
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
                      if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'ai' && !newMessages[newMessages.length - 1].questionId) {
                           newMessages[newMessages.length - 1].content = streamingQuestion;
                      }
                      return newMessages;
                    });
                  }
                } else if (eventName === 'question.end') {
                  const questionId = data.questionId;
                  const questionContent = data.fullText || streamingQuestion;
                  const isLast = data.isLast;
                  
                  if (isLast) isLastQuestionRef.current = true;
                  if (questionId && receivedQuestionIdsRef.current.has(questionId)) continue;

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
                    if (questionId) receivedQuestionIdsRef.current.add(questionId);
                    
                    // 触发语音播报
                    playTTS(questionContent);
                    
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
          if (error.name !== 'AbortError') {
            toast.error("Connection error, please try again");
            setIsAiThinking(false);
          }
        }
      };
      readStream();
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        toast.error("Failed to connect to question stream");
        setIsLoading(false);
        setIsAiThinking(false);
      }
    });
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!sessionId) {
      toast.error("Session ID is missing");
      navigate("/");
      return;
    }

    const initInterview = async () => {
      try {
        const statusRes = await apiClient.get(`/api/v1/sessions/${sessionId}/status`);
        const sessionStatus = statusRes.data?.data?.status;

        if (sessionStatus === "EVALUATED" || sessionStatus === "COMPLETED") {
          setInterviewComplete(true);
          setHasStarted(true);
          const response = await apiClient.get(`/api/v1/sessions/${sessionId}/report`);
          const data = response.data;
          if (data.success && data.data) {
            setReport(data.data);
            setShowReport(true);
          }
          return;
        }

        const historyRes = await apiClient.get(`/api/v1/sessions/${sessionId}/history`);
        const historyList = historyRes.data?.data || [];

        if (historyList.length > 0) {
          const restoredMessages: Message[] = [];
          let lastQuestionId = null;

          historyList.forEach((item: any) => {
            if (item.questionText) {
              restoredMessages.push({
                role: 'ai',
                content: item.questionText,
                timestamp: new Date(item.createdTime),
                questionId: item.questionId
              });
              lastQuestionId = item.questionId;
            }
            if (item.userAnswer) {
              restoredMessages.push({
                role: 'user',
                content: item.userAnswer,
                timestamp: new Date(item.answeredTime),
                questionId: item.questionId
              });
            }
          });

          setMessages(restoredMessages);
          
          const lastItem = historyList[historyList.length - 1];
          setHasStarted(true);
          
          if (lastItem.userAnswer) {
            setCurrentQuestionIndex(historyList.length);
            connectToQuestionStream();
          } else {
            setCurrentQuestionIndex(historyList.length - 1);
            setCurrentQuestionId(lastItem.questionId);
            if (lastItem.questionId) {
              receivedQuestionIdsRef.current.add(lastItem.questionId);
            }
            setIsInterviewActive(true);
            
            // 如果恢复时停留在待回答的问题上，也可以选择播报一遍
            if (lastItem.questionText) {
                playTTS(lastItem.questionText);
            }
          }
        }
      } catch (error) {
        console.error("Failed to restore session", error);
      }
    };

    initInterview();

    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [sessionId, navigate, connectToQuestionStream]);

  const handleStartInterviewClick = () => {
    setHasStarted(true);
    setIsLoading(true);
    connectToQuestionStream();
  };

  const handleInterviewEnd = () => {
    setIsInterviewActive(false);
    setInterviewComplete(true);
    setIsPollingStatus(true);
    
    const endMessageText = "系统检测到会话完毕。核心算力网正在分析您的生物与认知数据谱线，生成量化报告，请稍候...";
    const endMessage: Message = {
      role: "ai",
      content: endMessageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, endMessage]);
    playTTS(endMessageText);
    
    pollForReport();
  };

  const pollForReport = async () => {
    if (!sessionId) return;
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await apiClient.get(`/api/v1/sessions/${sessionId}/status`);
        const data = response.data;
        
        if (data.success && data.data) {
          const status = data.data.status;
          if (status === "EVALUATED") {
            setIsPollingStatus(false);
            toast.success("评估报告生成完毕！");
            navigate("/my-interviews");
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
          setTimeout(poll, 2000);
        }
      } catch (error) {
        if (attempts >= maxAttempts) setIsPollingStatus(false);
        else setTimeout(poll, 2000);
      }
    };
    poll();
  };

  const submitAnswer = async () => {
    if (!textAnswer.trim()) {
      toast.error('请输入回答内容');
      return;
    }
    if (currentQuestionId === null) {
      toast.error('Question ID is missing');
      return;
    }

    if (audioRef.current) {
        audioRef.current.pause();
        setIsAiSpeaking(false);
    }

    const userMessage: Message = {
      role: "user",
      content: textAnswer,
      timestamp: new Date(),
      questionId: currentQuestionId
    };
    setMessages(prev => [...prev, userMessage]);
    setTextAnswer("");
    setIsAiThinking(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    try {
      await apiClient.post(`/api/v1/sessions/${sessionId}/answer`, {
        questionId: currentQuestionId,
        answer: textAnswer
      });
      setCurrentQuestionIndex(prev => prev + 1);
      
      if (isLastQuestionRef.current) handleInterviewEnd();
      else connectToQuestionStream();
    } catch (error) {
      toast.error("Failed to submit answer");
      setIsAiThinking(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && !isLoading && !interviewComplete) {
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [hasStarted, isLoading, interviewComplete]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const latestAiMessage = messages.filter(m => m.role === 'ai').pop();
  const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;

  // 未开始状态
  if (!hasStarted) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#030014] items-center justify-center relative overflow-hidden font-sans text-slate-800 dark:text-slate-200">
        {/* 背景粒子 */}
        {particlesInit && (
          <Particles
            id="tsparticles"
            options={{
              fpsLimit: 120,
              interactivity: {
                events: {
                  onHover: { enable: true, mode: "grab" },
                },
                modes: {
                  grab: { distance: 140, links: { opacity: 0.5 } },
                },
              },
              particles: {
                color: { value: "#22d3ee" },
                links: {
                  color: "#22d3ee",
                  distance: 150,
                  enable: true,
                  opacity: 0.15,
                  width: 1,
                },
                move: {
                  enable: true,
                  speed: 0.6,
                },
                number: {
                  density: { enable: true, area: 800 },
                  value: 60,
                },
                opacity: { value: 0.2 },
                size: { value: { min: 1, max: 2 } },
              },
              detectRetina: true,
            }}
            className="absolute inset-0 z-0"
          />
        )}

        {/* 极光模糊光斑 */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 dark:bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 dark:bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* 赛博网格 */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-[40%] cyber-grid animate-grid-move opacity-10 dark:opacity-20 [mask-image:linear-gradient(to_top,black,transparent)]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] dark:opacity-[0.1] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-lg text-center p-12 bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10">
          {/* 雷达扫描图标 */}
          <div className="relative w-24 h-24 mb-10">
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-scan-ripple"></div>
            <div className="absolute inset-[-10px] rounded-full border border-cyan-500/10 animate-scan-ripple [animation-delay:1s]"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-400/20 to-purple-600/20 blur-xl opacity-50"></div>
            <div className="relative w-full h-full rounded-2xl bg-white/10 dark:bg-white/5 border border-white/40 dark:border-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <BrainCircuit className="w-12 h-12 text-cyan-600 dark:text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            </div>
          </div>

          <h1 className="text-4xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-white/60">
            网络已连接
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-light text-balance">
            AI 中枢已经针对您的核心档案构建了专属考核矩阵。调整呼吸，准备随时进入全息模拟。
          </p>

          <Button
            onClick={handleStartInterviewClick}
            className="relative overflow-hidden w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 rounded-2xl text-xl font-bold shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98] tracking-[0.2em]"
          >
            <span className="relative z-10">接入会话</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/40 to-transparent skew-x-[-20deg] animate-sweep pointer-events-none"></div>
          </Button>

          <TerminalLog />

          <button
            onClick={() => navigate("/")}
            className="mt-8 text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-xs font-medium tracking-[0.3em] uppercase group"
          >
            <span className="opacity-60 group-hover:opacity-100 transition-opacity">中止返回 EXIT SESSION</span>
          </button>
        </div>
      </div>
    );
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#030014] items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-10"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-2 border-slate-200 dark:border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-cyan-500 dark:border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-2 border-purple-500 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-slate-900 dark:text-white text-xl font-bold tracking-widest uppercase">同步数据流</p>
          <p className="text-cyan-600 dark:text-cyan-500/70 text-xs mt-2 font-mono tracking-widest">ESTABLISHING NEURAL LINK...</p>
        </div>
      </div>
    );
  }

  // 轮询状态界面
  if (isPollingStatus) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#030014] items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-10"></div>
        
        <div className="relative z-10 w-full max-w-md bg-white dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-10 shadow-2xl flex flex-col items-center">
          <div className="relative mb-10 w-24 h-24">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
            <Activity className="w-full h-full text-cyan-600 dark:text-cyan-400 relative z-10 animate-pulse" strokeWidth={1} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-wide">量化评估中</h2>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-10 font-light text-sm">
            核心算法正在解构您的答辩表现谱线，生成最终评测报告...
          </p>
          
          <div className="w-full space-y-3">
            <div className="flex justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              <span>System Analyzing</span>
              <span className="animate-pulse">Processing</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-cyan-500 dark:via-cyan-400 to-transparent w-full origin-left animate-[progress-indeterminate_1.5s_ease-in-out_infinite]">
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
          
          <div className="mt-8 flex items-center gap-2 text-slate-500 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Please stand by</span>
          </div>
        </div>
      </div>
    );
  }

  // 评估报告界面
  if (showReport && report) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#030014] text-slate-800 dark:text-slate-200 overflow-y-auto selection:bg-cyan-500/30">
        <div className="max-w-4xl mx-auto w-full p-8">
           <h1 className="text-3xl font-bold mb-6">面试评估报告</h1>
           {/* 报告详细内容... */}
           <Button onClick={() => setShowReport(false)} className="mt-8">返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#030014] relative overflow-hidden font-sans text-slate-800 dark:text-slate-200">
      {/* 极光背景特效 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/5 dark:bg-purple-900/10 blur-[150px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 dark:bg-cyan-900/10 blur-[150px] mix-blend-screen animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] dark:opacity-[0.15]"></div>
      </div>

      {/* 历史记录触发按钮 - 左侧竖向文字 */}
      <button
        onClick={() => setShowHistory(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-white/80 dark:bg-white/5 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 backdrop-blur-xl border border-l-0 border-slate-200 dark:border-white/10 rounded-r-2xl py-8 px-2 transition-all group shadow-xl dark:shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center gap-4"
        title="查看对话历史"
      >
        <History className="w-5 h-5 text-cyan-600 dark:text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
        <div className="flex flex-col gap-1">
          {"对话历史".split("").map((char, i) => (
            <span key={i} className="text-[10px] font-black text-cyan-600/60 dark:text-cyan-500/60 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 tracking-tighter transition-colors uppercase">
              {char}
            </span>
          ))}
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-cyan-500/20 rounded-full group-hover:bg-cyan-400/50 transition-colors"></div>
      </button>

      {/* 对话历史侧边抽屉 - 浮动宽屏版 */}
      <div 
        className={`fixed inset-y-6 left-6 w-[450px] z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
          showHistory ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0'
        }`}
      >
        <div className="h-full bg-white/95 dark:bg-[#05011a]/80 backdrop-blur-3xl border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_32px_64px_rgba(0,0,0,0.8)] flex flex-col rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-slate-50 dark:from-white/[0.02] to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <History className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-[0.3em] uppercase text-slate-900 dark:text-white">Neural History</span>
                <span className="text-[9px] text-cyan-600/50 dark:text-cyan-500/50 font-mono tracking-widest">RECORDING ACTIVE</span>
              </div>
            </div>
            <button 
              onClick={() => setShowHistory(false)}
              className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors group"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white rotate-45 transition-transform group-hover:scale-110" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-4">
                <div className="w-16 h-16 rounded-full border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center animate-[pulse_4s_infinite]">
                  <Activity className="w-8 h-8 opacity-20" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] tracking-[0.4em] uppercase font-bold">Waiting for input</p>
                  <p className="text-[9px] opacity-40 mt-1 font-mono">NO LOGS DETECTED IN CURRENT BUFFER</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'} group`}>
                  <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-sm leading-relaxed transition-all duration-300 ${
                    msg.role === 'ai' 
                      ? 'bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-cyan-50 rounded-tl-none hover:bg-slate-200 dark:hover:bg-white/[0.05] hover:border-cyan-500/20' 
                      : 'bg-cyan-500/10 border border-cyan-500/20 text-slate-700 dark:text-slate-200 rounded-tr-none hover:bg-cyan-500/15'
                  }`}>
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-3 mt-3 px-2 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors tracking-widest uppercase">
                      {msg.role === 'ai' ? 'Matrix AI' : 'Candidate'}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={historyEndRef} />
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/40 backdrop-blur-md flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">Secure Connection</span>
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-600 font-mono uppercase tracking-tighter">
              ID: {String(sessionId || '').slice(0, 12)}...
            </p>
          </div>
        </div>
      </div>

      {/* 遮罩层 */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* 顶部状态栏 Header */}
      <header className="h-16 shrink-0 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#030014]/50 backdrop-blur-xl flex items-center justify-between px-6 z-20 relative">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-widest uppercase">Simulation</span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-500/70 font-mono">Q-{currentQuestionIndex + 1}/{totalQuestions}</span>
          </div>
        </div>
        
        {/* 顶部进度条 */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-slate-100 dark:bg-white/5 w-full">
          <div className="h-full bg-cyan-500 dark:bg-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex items-center gap-3 text-slate-500 font-mono text-sm">
          {/* 虚拟形象选择器 */}
          <div className="flex items-center gap-2 mr-4 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Virtual Avatar</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedVirtualId(null)}
                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${!selectedVirtualId ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/30 dark:bg-cyan-400/20 dark:text-cyan-400 dark:border-cyan-500/50' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/5 border border-transparent'}`}
                title="关闭虚拟形象"
              >
                <User className="w-3.5 h-3.5" />
              </button>
              {virtualInterviewers.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVirtualId(v.id)}
                  className={`w-6 h-6 rounded overflow-hidden transition-all border ${selectedVirtualId === v.id ? 'border-cyan-500 ring-1 ring-cyan-500/50 scale-110' : 'border-slate-200 dark:border-white/10 opacity-50 hover:opacity-100 hover:scale-110'}`}
                  title={v.name}
                >
                  <img src={v.path} alt={v.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {interviewComplete ? (
            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse"></div>
              <span>{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* 核心主视区 Main Stage */}
        <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden z-10">
          
          {/* AI 占位化身 / 虚拟形象 */}
          <div className="relative group flex flex-col items-center z-10 -mt-20">
            <div className="relative w-56 h-56 flex items-center justify-center">
              {/* 外围发光环 */}
              <div className={`absolute inset-0 rounded-full border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.01] backdrop-blur-md transition-all duration-700 ${isAiThinking || isAiSpeaking || (!isInterviewActive && !interviewComplete) ? 'scale-110 bg-slate-200 dark:bg-white/[0.03] border-cyan-500/30' : ''}`}></div>
              <div className={`absolute inset-4 rounded-full border border-dashed transition-all duration-[3s] linear infinite ${isAiThinking || isAiSpeaking || (!isInterviewActive && !interviewComplete) ? 'border-purple-500/50 rotate-180 animate-[spin_10s_linear_infinite]' : 'border-slate-200 dark:border-white/10'}`}></div>
              
              {/* 核心展示区 */}
              <div className={`w-36 h-36 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-2xl relative z-10 overflow-hidden ${selectedVirtualId ? 'border-2 border-cyan-500/30' : (isAiThinking || isAiSpeaking || (!isInterviewActive && !interviewComplete) ? 'bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_60px_rgba(34,211,238,0.4)] scale-105 rounded-full' : 'bg-white dark:bg-[#0a0a14] border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-full')}`}>
                {selectedVirtualId ? (
                  <img 
                    src={virtualInterviewers.find(v => v.id === selectedVirtualId)?.path} 
                    alt="Virtual Interviewer" 
                    className={`w-full h-full object-cover transition-all duration-500 ${isAiSpeaking ? 'scale-110 brightness-110' : 'scale-100'}`}
                  />
                ) : (
                  <BrainCircuit className={`w-12 h-12 transition-colors duration-700 ${isAiThinking || isAiSpeaking || (!isInterviewActive && !interviewComplete) ? 'text-white' : 'text-slate-400 dark:text-slate-600'}`} />
                )}
              </div>

              {/* 呼吸脉冲 */}
              {(isAiThinking || isAiSpeaking || (latestAiMessage && !isInterviewActive && !interviewComplete)) && (
                <div className={`absolute inset-0 border-2 border-cyan-500 dark:border-cyan-400 opacity-0 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] ${selectedVirtualId ? 'rounded-2xl' : 'rounded-full'}`}></div>
              )}
            </div>
            
            {/* 发音波形图 */}
            <div className="mt-12 flex items-end gap-1.5 h-8">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 rounded-full transition-all duration-[50ms] ${isAiThinking || isAiSpeaking || (!isInterviewActive && !interviewComplete) ? 'bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                  style={{ 
                    height: isAiThinking || isAiSpeaking || (!isInterviewActive && !interviewComplete) ? `${Math.random() * 24 + 8}px` : '4px',
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* 实时字幕悬浮层 Overlay */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white/90 dark:bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-20">
            <div className="space-y-6">
              <div className="flex gap-5 items-start">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-bold text-xs">AI</div>
                <span className="text-slate-900 dark:text-white text-lg lg:text-xl leading-relaxed font-light tracking-wide">
                  {interviewComplete ? "数据收集完毕。评估模块初始化..." : (isAiThinking ? "正在生成考核维度..." : (latestAiMessage?.content || "系统已准备就绪。"))}
                </span>
              </div>
              
              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent"></div>

              <div className="flex gap-5 items-start">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold text-xs">ME</div>
                <span className={`flex-1 text-lg lg:text-xl leading-relaxed font-light tracking-wide ${textAnswer ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600 italic'}`}>
                  {interviewComplete ? "-" : (isTranscribing ? "正在通过云端极速转写..." : (isRecording ? "正在接收语音输入..." : (textAnswer || "等待指令输入...")))}
                </span>
                {isTranscribing && <Loader2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-spin" />}
              </div>
            </div>
          </div>
        </main>

        {/* 右侧小贴士 Aside */}
        <aside className="w-80 border-l border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-sm z-20 hidden xl:flex flex-col p-8 overflow-y-auto custom-scrollbar">
          <InterviewTips />
        </aside>
      </div>

      {/* 底部控制台 Footer */}
      <footer className="shrink-0 bg-white/95 dark:bg-[#0a0a14]/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 z-30 flex flex-col relative pb-safe">
        {/* 打字输入区 */}
        {isTypingMode && !interviewComplete && (
          <div className="p-4 md:p-6 bg-slate-50 dark:bg-black/20 flex gap-4 max-w-5xl mx-auto w-full items-end border-b border-slate-200 dark:border-white/5">
            <Textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Input terminal commands / response..."
              className="flex-1 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white resize-none min-h-[60px] max-h-[150px] focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl font-mono text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
              disabled={isAiThinking || isTranscribing || !isInterviewActive}
            />
            <Button
              onClick={submitAnswer}
              disabled={isAiThinking || isTranscribing || !isInterviewActive || !textAnswer.trim()}
              className="h-[60px] px-8 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 disabled:bg-slate-100 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-600 rounded-xl font-bold tracking-widest transition-transform active:scale-95 uppercase text-sm"
            >
              <Send className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Transmit</span>
            </Button>
          </div>
        )}

        {/* 底部工具栏 */}
        <div className="h-20 px-8 flex items-center justify-between w-full max-w-5xl mx-auto relative">
          <Button variant="ghost" className="text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/5 dark:hover:bg-cyan-400/10 font-mono text-xs uppercase tracking-widest">
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Data Sheet</span>
          </Button>

          {!interviewComplete && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8">
              <Button 
                onClick={toggleRecording}
                disabled={isAiThinking || isTranscribing || !isInterviewActive}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 border-[3px] ${isRecording ? 'bg-rose-500 hover:bg-rose-600 border-rose-400/50 animate-pulse scale-110 shadow-[0_0_30px_rgba(244,63,94,0.5)]' : 'bg-white dark:bg-[#030014] hover:bg-slate-50 dark:hover:bg-[#0a0a14] text-cyan-600 dark:text-cyan-400 border-slate-200 dark:border-cyan-500/30 hover:border-cyan-500 dark:hover:border-cyan-400'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6" />}
              </Button>
            </div>
          )}

          <Button 
            variant="ghost" 
            className={`text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/5 dark:hover:bg-cyan-400/10 font-mono text-xs uppercase tracking-widest transition-colors ${isTypingMode ? 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white' : ''}`}
            onClick={() => setIsTypingMode(!isTypingMode)}
          >
            <Keyboard className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Terminal</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}