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
  "Hello, welcome to this interview. First, please introduce yourself briefly, including your educational background and work experience.",
  "I noticed you mentioned relevant project experience in your resume. Can you elaborate on your specific responsibilities and contributions in this project?",
  "What was the biggest technical challenge you encountered during project development? How did you solve it?",
  "Why do you want to apply for this position? What advantages do you think you have?",
  "What are your career plans for the next three to five years?",
];

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
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
      utterance.lang = 'en-US';
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
      recognitionRef.current.lang = 'en-US';

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
          toast.error('Microphone permission denied, switched to text input mode');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected, please try again');
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
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
      toast.error('Please enter your answer');
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
        const endMessage = "Thank you for participating in this interview. Our AI system is generating a detailed evaluation report for you. Good luck with your job search!";
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
      toast.error('Your browser does not support speech recognition. Please use text input mode');
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
        toast.error('Unable to access microphone. Please allow microphone permission in browser settings.');
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
      toast.error('Microphone permission not granted, cannot use voice mode');
      return;
    }
    setUseTextInput(!useTextInput);
  };

  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col">
      {/* 顶部进度条 */}
      <div className="bg-neutral-900/80 backdrop-blur-md border-b border-neutral-700/50 p-5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-neutral-400 tracking-wider">
                Progress {currentQuestionIndex + 1} / {mockQuestions.length}
              </span>
              {interviewComplete && (
                <span className="text-sm font-bold text-green-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Interview Complete
                </span>
              )}
            </div>
            <Progress value={progress} className="h-2 bg-neutral-700" />
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-full border border-neutral-700/50">
            <div className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-neutral-500'}`}></div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-tighter">AI INTERVIEWER</span>
          </div>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div
                className={`group max-w-[85%] sm:max-w-[75%] rounded-[1.75rem] px-6 py-5 shadow-lg transition-all hover:shadow-xl ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-none shadow-blue-500/20"
                    : "bg-neutral-800/80 border border-neutral-700/50 text-white rounded-tl-none shadow-neutral-800/50"
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "ai" && <Sparkles className="w-3 h-3 text-blue-400" />}
                    {message.role === "ai" ? "AI Interviewer" : "Candidate"}
                  </div>
                  <p className="leading-relaxed text-[15px] sm:text-base font-medium">
                    {message.content}
                  </p>
                  <div className={`text-[9px] opacity-40 mt-1 font-mono ${message.role === "user" ? "text-right" : "text-left"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI思考状态 */}
          {isAiThinking && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-4">
              <div className="bg-neutral-800/80 border border-neutral-700/50 rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">AI Thinking</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部控制区 */}
      <div className="bg-neutral-900/80 backdrop-blur-xl border-t border-neutral-700/50 p-8">
        <div className="max-w-3xl mx-auto">
          {!interviewComplete ? (
            <div className="space-y-6">
              {/* 切换输入模式按钮 */}
              <div className="flex justify-center">
                <button
                  onClick={toggleInputMode}
                  className="px-5 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2.5 transition-all active:scale-95 border border-neutral-700/50"
                  disabled={micPermissionDenied && !useTextInput}
                >
                  {useTextInput ? (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>{micPermissionDenied ? 'MIC BLOCKED' : 'Switch to Voice'}</span>
                    </>
                  ) : (
                    <>
                      <Keyboard className="w-3.5 h-3.5" />
                      <span>Switch to Text</span>
                    </>
                  )}
                </button>
              </div>

              {useTextInput ? (
                /* 文本输入模式 */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <Textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="min-h-[140px] bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 rounded-[1.5rem] p-5 focus:border-blue-500/50 focus:ring-blue-500/10 resize-none text-base transition-all"
                    disabled={isAiThinking || isAiSpeaking}
                  />
                  <Button
                    onClick={handleTextSubmit}
                    disabled={isAiThinking || isAiSpeaking || !textAnswer.trim()}
                    className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-[1.25rem] text-base font-bold shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <Send className="w-4 h-4 mr-2.5" />
                    Send Answer
                  </Button>
                </div>
              ) : (
                /* 语音输入模式 */
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  {/* 实时转录文本 */}
                  <div className={`transition-all duration-500 ${isRecording && transcript ? 'mb-8 opacity-100 translate-y-0' : 'h-0 opacity-0 translate-y-4 overflow-hidden'}`}>
                    <div className="bg-blue-500/10 rounded-3xl p-6 border border-blue-500/20 relative">
                      <div className="absolute -top-2 left-6 px-2 bg-neutral-800 text-[10px] font-bold text-blue-400 tracking-widest uppercase border border-blue-500/20 rounded">LIVE TRANSCRIPT</div>
                      <p className="text-white font-medium leading-relaxed">{transcript}</p>
                    </div>
                  </div>

                  {/* 录音按钮 */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      {isRecording && (
                        <>
                          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                          <div className="absolute -inset-4 border-2 border-red-500/10 rounded-full animate-[spin_4s_linear_infinite]"></div>
                        </>
                      )}
                      <Button
                        onClick={toggleRecording}
                        disabled={isAiThinking || isAiSpeaking}
                        size="lg"
                        className={`relative w-24 h-24 rounded-full transition-all duration-500 shadow-2xl ${
                          isRecording
                            ? "bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/30"
                            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/30 hover:scale-105"
                        } ${isAiThinking || isAiSpeaking ? "opacity-30 grayscale cursor-not-allowed" : ""}`}
                      >
                        {isRecording ? (
                          <MicOff className="w-10 h-10 text-white" />
                        ) : (
                          <Mic className="w-10 h-10 text-white" />
                        )}
                      </Button>
                    </div>

                    <div className="text-center space-y-1">
                      <p className={`text-sm font-bold uppercase tracking-widest transition-colors ${isRecording ? 'text-red-400' : 'text-neutral-400'}`}>
                        {isAiSpeaking
                          ? "AI is speaking..."
                          : isRecording
                          ? "Recording... Tap to stop"
                          : "Tap to answer"}
                      </p>
                      {!isRecording && !isAiSpeaking && !isAiThinking && (
                        <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-tighter">Your turn to speak</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Interview Completed</h3>
                <p className="text-neutral-400 font-medium max-w-sm mx-auto leading-relaxed">
                  Thank you for your participation. Your interview report is being generated. You can return home or wait for system notification.
                </p>
              </div>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 h-14 rounded-2xl text-base font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Return Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}