import { useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { isJobSiteUrl } from '../utils/urlChecker';

export default function Setup() {
  // 进入Setup页面时， 生成当前会话的view_id
  const [view_id] = useState(() => uuidv4());
  console.log(view_id); // 例如: "36b8f84d-df4e-4d49-b662-bcde71a8764f"

  // websocket相关变量
  const [loadingText, setLoadingText] = useState('等待输入');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);

    // 页面中相关变量
  const navigate = useNavigate();
  const [jobUrl, setJobUrl] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [prepearation, setPrepearation] = useState<true | false>(false);
  const [isJdReady, setIsJdReady] = useState<true | false>(false);
  const [isResumeReady, setIsResumeReady] = useState<true | false>(false);

  // 👇 新增的监控状态
  const [wsStatus, setWsStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const [wsLogs, setWsLogs] = useState<string[]>([]); // 存储历史消息
  const [isMonitorVisible, setIsMonitorVisible] = useState(false); // 控制小窗的收起/展开
  const addWsLog = (message: string) => {
    setWsLogs((prev) => {
      const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${message}`];
      return newLogs.slice(-50); 
    });
  };


  // 💡使用 useRef 存储 WebSocket 实例
  const wsRef = useRef<WebSocket | null>(null);
  // 组件挂载时：建立 WebSocket 连接
  useEffect(() => {
    console.log(`初始化 WebSocket 连接，通道ID: ${view_id}`);
    addWsLog(`正在连接...`);
    setWsStatus('connecting');

    const ws = new WebSocket(`ws://localhost:8080/ws/v1/interview/task-status/${view_id}`);
    wsRef.current = ws;

    // 监听连接建立
    ws.onopen = () => {
        console.log('✅ WebSocket 连接已建立');
        setWsStatus('open');
        addWsLog('✅ 连接成功');
    };

    // 监听后端推送的消息
    ws.onmessage = (event) => {
        // 💡 记录收到的原始消息
        addWsLog(`📩 ${event.data}`);
        
        const response = JSON.parse(event.data);
        switch(response.status) {
            case 'processing':
                setLoadingText(response.message);
                break;
            case 'success':
                setIsParsing(false);
                setLoadingText('解析成功！');
                setParsedData(response.data);
                
                if(response.type == 1) {
                  setIsJdReady(true);
                } else if(response.type == 2){
                  setIsResumeReady(true);
                }
                break;
            case 'error':
                setIsParsing(false);
                setLoadingText('抓取失败，请手动输入JD');
                addWsLog(`❌ ${response.message || '未知错误'}`);
                break;
            default:
                break;
        }
    };

    // 👇 补全：监听连接关闭
    ws.onclose = (event) => {
        setWsStatus('closed');
        addWsLog(`⚠️ 关闭 (代码: ${event.code})`);
    };

    // 👇 补全：监听底层错误
    ws.onerror = (error) => {
        setWsStatus('error');
        addWsLog('❌ 发生错误');
        console.error('WebSocket Error:', error);
    };

    // 清理函数：组件卸载时断开连接
    return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
        }
    };
  }, [view_id]);

  // 专门处理状态达成后的跳转
  useEffect(() => {
    if (isJdReady && isResumeReady) {
      console.log("简历和JD都已就绪，准备跳转面试！");
      handleStartInterview();
    }
  }, [isJdReady, isResumeReady]);

  

  // 解析招聘信息 todo: 发送 HTTP 请求
  const analysisJobUrl = async () => {
    if (!jobUrl.trim()) {
      alert("请输入岗位链接！");
      return;
    }

    if(!isJobSiteUrl(jobUrl)) {
      alert("请输入支持的招聘网站链接！");
      return;
    }

    // 锁定 UI：禁用按钮，显示进度条
    setIsParsing(true);
    setLoadingText('正在提交解析任务...');

    try {
        // 发送异步 HTTP POST 请求触发爬虫
        const response = await axios.post('http://localhost:8080/api/v1/preview/job-parse', {
            view_id: view_id,
            url: jobUrl
        });
        const data = response.data;
        console.log('请求触发爬虫任务, 服务端响应:', data);
        setLoadingText('任务已进入队列，等待后台处理...');
    } catch (error) {
        setIsParsing(false);
        setLoadingText('系统繁忙，任务提交失败');
        console.error("提交爬虫任务失败", error);
    }
  }

  // 上传简历接口
  const analysisUserResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;

    if (!selectedFile) {
      alert("请上传简历！");
      return;
    }
    const formData = new FormData();
    formData.append('resume', selectedFile); // 追加文件
    formData.append('view_id', view_id); // 追加view_id

    setIsParsing(true);
    setLoadingText('正在提交解析任务...');
    try {
        // 发送异步 HTTP POST 请求解析简历
        const response = await axios.post('http://localhost:8080/api/v1/preview/resume-parse', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const data = response.data;
        console.log('请求提交解析简历任务，服务端响应:', data);
        setLoadingText('任务已进入队列，等待后台处理...');
    } catch (error) {
        setIsParsing(false);
        setLoadingText('系统繁忙，任务提交失败');
        console.error("提交爬虫任务失败", error);
    }
  };


  const handleStartInterview = () => {
    if (isJdReady && isResumeReady) {
      // 将数据传递到面试页面
      navigate("/interview", {
        state: {
          view_id,
          jobUrl,
        },
      });
    }
  };


  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">返回首页</span>
        </button>

        <div className="bg-white rounded-3xl border border-neutral-200/60 p-8 md:p-12 shadow-sm">
          <div className="space-y-1 mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
              面试准备
            </h2>
            <p className="text-neutral-500 text-lg">
              请填写岗位信息并上传简历，我们将为您定制面试问题
            </p>
          </div>

          <div className="space-y-10">
            {/* 岗位URL输入区 */}
            <div className="space-y-3">
              <Label htmlFor="job-url" className="text-neutral-700 font-semibold ml-1">
                Boss直聘岗位链接
              </Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="job-url"
                    type="url"
                    placeholder="粘贴岗位链接：http://www.zhipin.com/job_detail/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="pl-12 h-14 bg-neutral-50/50 border-neutral-200/80 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all text-base"
                  />
                </div>
                <Button 
                  onClick={analysisJobUrl}
                  disabled={isParsing || isJdReady}
                  className={`h-14 px-8 text-base font-semibold rounded-2xl transition-all shadow-lg active:scale-95 ${
                    isJdReady 
                      ? 'bg-green-500 hover:bg-green-500 text-white shadow-green-200'
                      : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                  }`}
                >
                  {isJdReady ? '已就绪 ✅' : (isParsing ? '解析中...' : '开始解析')}
                </Button>
              </div>
              <p className="text-xs text-neutral-400 ml-1">
                我们目前优先支持 Boss直聘 平台
              </p>
            </div>

            {/* 👇 新增：全屏阻塞式加载弹窗 (仅在解析时显示) */}
            {isParsing && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-900/40 backdrop-blur-md transition-opacity duration-300">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full mx-4 flex flex-col items-center animate-in zoom-in-95 duration-300 border border-white/20">
                  <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 border-[6px] border-primary/5 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-primary rounded-full border-t-transparent animate-spin"></div>
                    <Loader2 className="w-10 h-10 text-primary animate-pulse" />
                  </div>

                  <h3 className="text-2xl font-bold text-neutral-900 mb-3 text-center">
                    AI 正在处理
                  </h3>
                  
                  <p className="text-primary font-semibold text-center h-6 text-lg tracking-wide">
                    {loadingText || "正在建立安全连接..."}
                  </p>
                  
                  <div className="w-full bg-neutral-100 h-2 rounded-full mt-10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/10"></div>
                    <div className="absolute top-0 bottom-0 left-0 bg-primary rounded-full w-2/3 animate-[shimmer_2s_infinite_linear] shadow-[0_0_8px_rgba(3,2,19,0.3)]"></div>
                  </div>

                  <p className="text-sm text-neutral-400 mt-8 text-center leading-relaxed">
                    AI 正在高速处理中，请勿关闭或刷新页面
                  </p>
                </div>
              </div>
            )}

            {/* 简历上传 */}
            <div className="space-y-3">
              <Label htmlFor="resume-upload" className="text-neutral-700 font-semibold ml-1">
                上传个人简历
              </Label>
              <div 
                className={`group relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 overflow-hidden ${
                  isParsing 
                    ? "border-primary/20 bg-neutral-50/50 cursor-not-allowed"
                    : isResumeReady
                    ? "border-green-200 bg-green-50/30 hover:border-green-300"
                    : "border-neutral-200 bg-neutral-50/30 hover:border-primary/30 hover:bg-white cursor-pointer"
                }`}
              >
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={analysisUserResume}
                  className="hidden"
                  disabled={isParsing}
                />
                
                <label
                  htmlFor={isParsing ? "" : "resume-upload"}
                  className={`block relative z-10 ${isParsing ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex flex-col items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                      isParsing ? "bg-primary text-white animate-pulse" : 
                      isResumeReady ? "bg-green-500 text-white scale-110" : "bg-white text-neutral-600 group-hover:scale-110 group-hover:shadow-md"
                    }`}>
                      {isParsing ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : isResumeReady ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <Upload className="w-8 h-8" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className={`text-xl font-bold transition-colors ${
                        isParsing ? "text-primary" : 
                        isResumeReady ? "text-green-700" : "text-neutral-900"
                      }`}>
                        {resume ? resume.name : (isResumeReady ? "解析完成" : "点击或拖拽简历上传")}
                      </p>
                      <p className="text-neutral-500 font-medium">
                        {isResumeReady ? "✅ 简历已解析，您可以继续或重新上传" : "支持 PDF、DOCX 格式（不超过 10MB）"}
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
                className="w-full h-16 bg-primary hover:bg-primary/90 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-[1.25rem] text-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <span>进入面试房间</span>
                <CheckCircle2 className={`ml-3 w-6 h-6 transition-all duration-500 ${isJdReady && isResumeReady ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>



      {/* --- WebSocket 监控小窗 --- */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: isMonitorVisible ? '400px' : 'auto',
        backgroundColor: '#030213',
        color: '#f8fafc',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        fontFamily: 'JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '12px',
        zIndex: 9999,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* 头部区域 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          cursor: 'pointer'
        }} onClick={() => setIsMonitorVisible(!isMonitorVisible)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: 
                wsStatus === 'open' ? '#22c55e' : 
                wsStatus === 'connecting' ? '#eab308' : 
                '#ef4444',
              boxShadow: wsStatus === 'open' ? '0 0 12px #22c55e' : 'none'
            }}></span>
            <strong style={{ fontWeight: '600', letterSpacing: '0.05em' }}>SYSTEM ENGINE</strong>
          </div>
          <button style={{ 
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px'
          }}>
            {isMonitorVisible ? 'HIDE' : 'DEBUG'}
          </button>
        </div>

        {/* 消息列表区域 */}
        {isMonitorVisible && (
          <div style={{ height: '280px', overflowY: 'auto', padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            {wsLogs.length === 0 ? (
              <div style={{ color: '#475569', textAlign: 'center', marginTop: '40px' }}>WAITING FOR EVENTS...</div>
            ) : (
              wsLogs.map((log, index) => (
                <div key={index} style={{ 
                  marginBottom: '8px', 
                  wordBreak: 'break-all',
                  paddingLeft: '12px',
                  borderLeft: '2px solid rgba(255,255,255,0.1)',
                  color: log.includes('📩') ? '#38bdf8' : 
                         log.includes('❌') ? '#f87171' : 
                         log.includes('✅') ? '#4ade80' : '#94a3b8'
                }}>
                  {log}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
