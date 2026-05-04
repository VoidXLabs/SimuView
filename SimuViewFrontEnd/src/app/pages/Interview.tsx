import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { Mic, MicOff, Volume2, Loader2, CheckCircle2, Keyboard, Send, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

interface Message {
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

// 模拟AI面试问题库
const mockQuestions = [
  "您好，欢迎参加本次面试。首先，请简单介绍一下您自己，包括您的教育背景和工作经验。",
  "我看到您的简历中提到了相关项目经验。能详细讲讲您在这个项目中的具体职责和贡献吗？",
  "在项目开发过程中，您遇到过最大的技术挑战是什么？您是如何解决的？",
  "您为什么想要应聘这个岗位？您认为自己有哪些优势？",
  "您对未来三到五年的职业规划是什么？",
];

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { view_id, jdId, resumeId } = location.state || {};

  useEffect(() => {
    console.log("Interview Session Initialized:");
    console.log("View ID:", view_id);
    console.log("JD ID:", jdId);
    console.log("Resume ID:", resumeId);
  }, [view_id, jdId, resumeId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [useTextInput, setUseTextInput] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI语音合成
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // 初始AI问候
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstQuestion = mockQuestions[0];
      setMessages([{
        role: "ai",
        content: firstQuestion,
        timestamp: new Date(),
      }]);
      setIsAiThinking(false);
      speakText(firstQuestion);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
          setUseTextInput(true);
          toast.error('麦克风权限被拒绝，已切换到文本输入模式');
        } else if (event.error === 'no-speech') {
          toast.error('没有检测到语音，请重试');
        } else {
          toast.error(`语音识别错误: ${event.error}`);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 提交答案的通用函数
  const submitAnswer = (answerText: string) => {
    if (!answerText.trim()) {
      toast.error('请输入回答内容');
      return;
    }

    // 添加用户回答
    const userMessage: Message = {
      role: "user",
      content: answerText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setTranscript("");
    setTextAnswer("");
    
    // AI思考并回复下一个问题
    setIsAiThinking(true);
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < mockQuestions.length) {
        const nextQuestion = mockQuestions[nextIndex];
        setMessages(prev => [...prev, {
          role: "ai",
          content: nextQuestion,
          timestamp: new Date(),
        }]);
        setCurrentQuestionIndex(nextIndex);
        setIsAiThinking(false);
        speakText(nextQuestion);
      } else {
        // 面试结束
        const endMessage = "感谢您参加本次面试，我们的AI系统正在为您生成详细的评估报告。祝您求职顺利！";
        setMessages(prev => [...prev, {
          role: "ai",
          content: endMessage,
          timestamp: new Date(),
        }]);
        setIsAiThinking(false);
        setInterviewComplete(true);
        speakText(endMessage);
      }
    }, 2000);
  };

  // 开始/停止录音
  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      toast.error('您的浏览器不支持语音识别功能，请使用文本输入模式');
      setUseTextInput(true);
      return;
    }

    if (isRecording) {
      // 停止录音
      recognitionRef.current.stop();
      setIsRecording(false);
      
      if (transcript.trim()) {
        submitAnswer(transcript);
      }
    } else {
      // 请求麦克风权限并开始录音
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // 立即停止，只是用来检查权限
        
        recognitionRef.current.start();
        setIsRecording(true);
        setTranscript("");
        setMicPermissionDenied(false);
      } catch (error) {
        console.error('Microphone permission error:', error);
        setMicPermissionDenied(true);
        setUseTextInput(true);
        toast.error('无法访问麦克风，已切换到文本输入模式。请在浏览器设置中允许麦克风权限。');
      }
    }
  };

  // 提交文本答案
  const handleTextSubmit = () => {
    submitAnswer(textAnswer);
  };

  // 切换输入模式
  const toggleInputMode = () => {
    if (!useTextInput && micPermissionDenied) {
      toast.error('麦克风权限未授予，无法使用语音模式');
      return;
    }
    setUseTextInput(!useTextInput);
  };

  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  return (
    <div className="flex flex-col h-screen bg-slate-900 relative overflow-hidden font-sans">
      {/* 复杂的背景装饰层 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 top-0 -z-10 h-[500px] w-[500px] -translate-x-[20%] -translate-y-[20%] rounded-full bg-emerald-500 opacity-10 blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[500px] w-[500px] translate-x-[20%] translate-y-[20%] rounded-full bg-teal-500 opacity-10 blur-[120px]"></div>
      </div>

      {/* 顶部进度条 */}
      <div className="relative z-10 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 p-5 sticky top-0 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-emerald-400 tracking-[0.2em] uppercase">
                Progress: Question {currentQuestionIndex + 1} of {mockQuestions.length}
              </span>
              {interviewComplete && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                  <CheckCircle2 className="w-4 h-4" />
                  SESSION COMPLETE
                </span>
              )}
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
            <div className="relative">
              <div className={`w-2.5 h-2.5 rounded-full ${isAiSpeaking ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
              {isAiSpeaking && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>}
            </div>
            <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">AI Interviewer</span>
          </div>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-12 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-10">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-6 duration-700`}
            >
              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-[2rem] px-8 py-6 shadow-2xl transition-all ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none shadow-emerald-900/20"
                    : "bg-slate-800/80 backdrop-blur-md border border-white/10 text-neutral-100 rounded-tl-none"
                }`}
              >
                {/* 装饰性背景 */}
                <div className={`absolute inset-0 opacity-10 pointer-events-none ${message.role === "user" ? "bg-[radial-gradient(circle_at_top_right,white,transparent)]" : "bg-[radial-gradient(circle_at_top_left,white,transparent)]"}`}></div>
                
                <div className="flex flex-col gap-2 relative z-10">
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "ai" && <Sparkles className="w-3 h-3 text-emerald-400" />}
                    {message.role === "ai" ? "Assistant" : "You"}
                  </div>
                  <p className="leading-relaxed text-[15px] sm:text-lg font-medium tracking-tight">
                    {message.content}
                  </p>
                  <div className={`text-[9px] font-mono opacity-30 mt-2 ${message.role === "user" ? "text-right" : "text-left"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI思考状态 */}
          {isAiThinking && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-6">
              <div className="bg-slate-800/50 border border-white/5 rounded-3xl px-8 py-4 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">AI is processing</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部控制区 */}
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-2xl border-t border-white/5 p-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto">
          {!interviewComplete ? (
            <div className="space-y-8">
              {/* 切换输入模式按钮 */}
              <div className="flex justify-center">
                <button
                  onClick={toggleInputMode}
                  className="px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black text-slate-300 hover:text-white uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-lg"
                  disabled={micPermissionDenied && !useTextInput}
                >
                  {useTextInput ? (
                    <>
                      <Mic className="w-4 h-4 text-emerald-400" />
                      <span>{micPermissionDenied ? 'MIC BLOCKED' : 'Switch to Voice Mode'}</span>
                    </>
                  ) : (
                    <>
                      <Keyboard className="w-4 h-4 text-teal-400" />
                      <span>Switch to Text Input</span>
                    </>
                  )}
                </button>
              </div>

              {useTextInput ? (
                /* 文本输入模式 */
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <Textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Type your response here..."
                      className="relative min-h-[160px] bg-slate-800/80 border-white/10 rounded-3xl p-6 focus:border-emerald-500/50 focus:ring-0 resize-none text-lg text-white placeholder:text-slate-500 transition-all shadow-inner leading-relaxed"
                      disabled={isAiThinking || isAiSpeaking}
                    />
                  </div>
                  <Button
                    onClick={handleTextSubmit}
                    disabled={isAiThinking || isAiSpeaking || !textAnswer.trim()}
                    className="w-full h-16 bg-white text-black hover:bg-neutral-200 disabled:bg-slate-700 disabled:text-slate-500 rounded-2xl text-lg font-black shadow-2xl transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <Send className="w-5 h-5 mr-3" />
                    Submit Answer
                  </Button>
                </div>
              ) : (
                /* 语音输入模式 */
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  {/* 实时转录文本 */}
                  <div className={`transition-all duration-700 ${isRecording && transcript ? 'mb-10 opacity-100 translate-y-0' : 'h-0 opacity-0 translate-y-6 overflow-hidden'}`}>
                    <div className="bg-emerald-500/5 rounded-[2rem] p-8 border border-emerald-500/20 relative shadow-inner">
                      <div className="absolute -top-3 left-8 px-3 py-1 bg-emerald-500 text-[10px] font-black text-white tracking-[0.2em] uppercase rounded-lg shadow-lg">LIVE TRANSCRIPT</div>
                      <p className="text-neutral-200 font-medium text-lg leading-relaxed italic">"{transcript}"</p>
                    </div>
                  </div>

                  {/* 录音按钮 */}
                  <div className="flex flex-col items-center gap-8">
                    <div className="relative group">
                      {isRecording && (
                        <>
                          <div className="absolute -inset-8 bg-emerald-500/20 rounded-full animate-ping"></div>
                          <div className="absolute -inset-4 border-2 border-emerald-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                          <div className="absolute -inset-12 border border-emerald-500/10 rounded-full animate-[spin_6s_linear_reverse_infinite]"></div>
                        </>
                      )}
                      <Button
                        onClick={toggleRecording}
                        disabled={isAiThinking || isAiSpeaking}
                        size="lg"
                        className={`relative w-28 h-28 rounded-full transition-all duration-500 shadow-[0_0_50px_-10px_rgba(0,0,0,0.3)] ${
                          isRecording
                            ? "bg-red-500 hover:bg-red-600 scale-110 shadow-red-900/40"
                            : "bg-white hover:bg-neutral-100 shadow-emerald-900/20 hover:scale-105"
                        } ${isAiThinking || isAiSpeaking ? "opacity-20 grayscale cursor-not-allowed" : ""}`}
                      >
                        {isRecording ? (
                          <MicOff className="w-12 h-12 text-white" />
                        ) : (
                          <Mic className="w-12 h-12 text-black" />
                        )}
                      </Button>
                    </div>

                    <div className="text-center space-y-2">
                      <p className={`text-xs font-black uppercase tracking-[0.3em] transition-all duration-500 ${isRecording ? 'text-red-400' : 'text-slate-400'}`}>
                        {isAiSpeaking
                          ? "AI is speaking..."
                          : isRecording
                          ? "Listening... Tap to end"
                          : "Tap to begin speaking"}
                      </p>
                      <div className="flex justify-center gap-1">
                        {!isRecording && !isAiSpeaking && !isAiThinking && (
                          <span className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-tighter animate-pulse">Your turn to participate</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-8 py-6 animate-in fade-in zoom-in-95 duration-700">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-white tracking-tight">Interview Completed</h3>
                <p className="text-slate-300 font-medium max-w-sm mx-auto leading-relaxed text-lg">
                  Excellent work. Your comprehensive performance report is being generated by our AI.
                </p>
              </div>
              <Button
                onClick={() => navigate("/")}
                className="bg-white text-black hover:bg-neutral-200 px-12 h-16 rounded-2xl text-lg font-black shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                View Detailed Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}