import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { Mic, MicOff, Volume2, Loader2, CheckCircle2, Keyboard, Send } from "lucide-react";
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
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="bg-white border-b border-neutral-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">
              面试进度: {currentQuestionIndex + 1} / {mockQuestions.length}
            </span>
            {interviewComplete && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                面试完成
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === "user"
                    ? "bg-neutral-800 text-white"
                    : "bg-white border border-neutral-200 text-neutral-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.role === "ai" && (
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Volume2 className="w-4 h-4 text-neutral-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm mb-1 opacity-70">
                      {message.role === "ai" ? "AI面试官" : "您"}
                    </p>
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI思考状态 */}
          {isAiThinking && (
            <div className="flex justify-start">
              <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" />
                  <span className="text-neutral-600">AI正在思考...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部控制区 */}
      <div className="bg-white border-t border-neutral-200 p-6">
        <div className="max-w-4xl mx-auto">
          {!interviewComplete ? (
            <div className="space-y-4">
              {/* 切换输入模式按钮 */}
              <div className="flex justify-center">
                <button
                  onClick={toggleInputMode}
                  className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-2 transition-colors"
                  disabled={micPermissionDenied && !useTextInput}
                >
                  {useTextInput ? (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>{micPermissionDenied ? '麦克风权限未授予' : '切换到语音输入'}</span>
                    </>
                  ) : (
                    <>
                      <Keyboard className="w-4 h-4" />
                      <span>切换到文本输入</span>
                    </>
                  )}
                </button>
              </div>

              {useTextInput ? (
                /* 文本输入模式 */
                <div className="space-y-3">
                  <Textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="请输入您的回答..."
                    className="min-h-[120px] bg-neutral-50 border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 resize-none"
                    disabled={isAiThinking || isAiSpeaking}
                  />
                  <Button
                    onClick={handleTextSubmit}
                    disabled={isAiThinking || isAiSpeaking || !textAnswer.trim()}
                    className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300 text-white rounded-xl"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    提交回答
                  </Button>
                </div>
              ) : (
                /* 语音输入模式 */
                <>
                  {/* 实时转录文本 */}
                  {isRecording && transcript && (
                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                      <p className="text-sm text-neutral-600 mb-1">识别中...</p>
                      <p className="text-neutral-900">{transcript}</p>
                    </div>
                  )}

                  {/* 录音按钮 */}
                  <div className="flex justify-center">
                    <Button
                      onClick={toggleRecording}
                      disabled={isAiThinking || isAiSpeaking}
                      size="lg"
                      className={`w-20 h-20 rounded-full transition-all ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-neutral-800 hover:bg-neutral-700"
                      } ${isAiThinking || isAiSpeaking ? "opacity-50" : ""}`}
                    >
                      {isRecording ? (
                        <MicOff className="w-8 h-8 text-white" />
                      ) : (
                        <Mic className="w-8 h-8 text-white" />
                      )}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-neutral-600">
                    {isAiSpeaking
                      ? "AI正在说话，请稍候..."
                      : isRecording
                      ? "点击停止录音"
                      : "点击开始回答"}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-neutral-600">
                面试已结束，感谢您的参与
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 rounded-xl"
              >
                返回首页
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}