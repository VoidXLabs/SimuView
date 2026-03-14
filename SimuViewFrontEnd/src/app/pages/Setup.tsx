import { useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Box } from '@mui/material';
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
  const [isMonitorVisible, setIsMonitorVisible] = useState(true); // 控制小窗的收起/展开
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
    addWsLog(`正在连接 ws://localhost:8080/ws/v1/interview/task-status/${view_id}...`);
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
        addWsLog(`📩 收到消息: ${event.data}`);
        
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
                addWsLog(`❌ 业务报错: ${response.message || '未知错误'}`);
                break;
            default:
                break;
        }
    };

    // 👇 补全：监听连接关闭
    ws.onclose = (event) => {
        setWsStatus('closed');
        addWsLog(`⚠️ 连接已关闭 (代码: ${event.code})`);
    };

    // 👇 补全：监听底层错误
    ws.onerror = (error) => {
        setWsStatus('error');
        addWsLog('❌ WebSocket 发生错误');
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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto p-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首页</span>
        </button>

        <div className="bg-white rounded-2xl border border-neutral-200 p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            面试准备
          </h2>
          <p className="text-neutral-600 mb-8">
            请填写岗位信息并上传简历，我们将为您定制面试问题
          </p>

          <div className="space-y-6">
            {/* 岗位URL输入区 */}
            <div className="space-y-2">
              <Label htmlFor="job-url" className="text-neutral-700">
                Boss直聘岗位链接
              </Label>
              <Box sx={{ display: 'flex', gap: '16px' }}> {/* 建议用 gap 替代 justifyContent: 'space-between'，视觉更紧凑 */}
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="job-url"
                    type="url"
                    placeholder="http://www.zhipin.com/job_detail/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="pl-11 h-12 bg-neutral-50 border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400"
                  />
                </div>
                <Button 
                  onClick={analysisJobUrl}
                  disabled={isParsing || isJdReady} // 解析中 或者 已经解析完成时，都禁用点击
                  className={`h-12 px-6 transition-colors ${
                    isJdReady 
                      ? 'bg-green-600 hover:bg-green-600 opacity-90 cursor-not-allowed' // 解析完成后的样式（绿色）
                      : 'bg-neutral-800 hover:bg-neutral-700' // 默认样式（黑色）
                  }`}
                >
                  {/* 根据不同状态动态显示文字 */}
                  {isJdReady ? '解析完成 ✅' : (isParsing ? '解析中...' : '开始解析')}
                </Button>
              </Box>
              <p className="text-sm text-neutral-500">
                粘贴Boss直聘上的目标岗位链接
              </p>
            </div>

            {/* 👇 新增：全屏阻塞式加载弹窗 (仅在解析时显示) */}
            {isParsing && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm transition-opacity">
                {/* 弹窗主体 */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center transform animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* 动态转圈图标 */}
                  <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                    {/* 外圈虚线旋转轨道 */}
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    {/* 内圈呼吸图标 */}
                    <Loader2 className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>

                  {/* 核心状态文字 */}
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    正在解析岗位信息
                  </h3>
                  
                  {/* 实时 WebSocket 消息推送显示 */}
                  <p className="text-blue-600 font-medium text-center animate-pulse min-h-[1.5rem]">
                    {loadingText || "正在建立安全连接..."}
                  </p>
                  
                  <p className="text-xs text-neutral-400 mt-6 text-center">
                    AI 正在高速处理中，请勿关闭或刷新页面
                  </p>

                  {/* 底部仿进度条动画 (左右来回扫描效果) */}
                  <div className="w-full bg-blue-50 h-1.5 rounded-full mt-4 overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-blue-500 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
                    <div className="absolute top-0 bottom-0 left-0 bg-blue-500 rounded-full w-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 简历上传 */}
            <div className="space-y-2">
              <Label htmlFor="resume-upload" className="text-neutral-700">
                上传简历
              </Label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isParsing 
                    ? "border-blue-200 bg-blue-50/30 cursor-not-allowed" // 解析中的样式
                    : "border-neutral-300 hover:border-neutral-400 cursor-pointer" // 默认样式
                }`}
              >
                {/* 只有在非解析状态下才允许触发 input */}
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={analysisUserResume}
                  className="hidden"
                  disabled={isParsing} // 解析时禁用 input
                />
                
                <label
                  htmlFor={isParsing ? "" : "resume-upload"} // 解析时移除 htmlFor 绑定，双重保险
                  className={`block ${isParsing ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex flex-col items-center gap-3">
                    {/* 图标动态切换 */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isParsing ? "bg-blue-100 animate-pulse" : "bg-neutral-100"
                    }`}>
                      {isParsing ? (
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      ) : isResumeReady ? ( // 如果解析完成了，显示勾选图标
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Upload className="w-6 h-6 text-neutral-600" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {isParsing ? (
                        <>
                          {/* 核心：实时显示 WebSocket 推送的 loadingText */}
                          <p className="font-medium text-blue-700">
                            {loadingText || "正在处理..."}
                          </p>
                          <p className="text-sm text-blue-500 animate-pulse">
                            AI 正在努力思考，请勿刷新页面
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-neutral-900">
                            {resume ? resume.name : "点击上传简历文件"}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {isResumeReady ? "✅ 解析完成，点击可重新上传" : "支持 PDF、DOC、DOCX 格式"}
                          </p>
                        </>
                      )}
                    </div>
                    
                  </div>
                </label>
              </div>
            </div>

            {/* 开始面试按钮 */}
            <div className="pt-4">
              <Button
                onClick={handleStartInterview}
                disabled={!(isJdReady && isResumeReady)}
                className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500 text-white rounded-xl text-base"
              >
                开始面试
              </Button>
            </div>
          </div>
        </div>
      </div>



      {/* --- WebSocket 监控小窗 --- */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: isMonitorVisible ? '350px' : 'auto',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        overflow: 'hidden',
        border: '1px solid #333'
      }}>
        {/* 头部区域 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: '#2d2d2d',
          borderBottom: isMonitorVisible ? '1px solid #444' : 'none',
          cursor: 'pointer'
        }} onClick={() => setIsMonitorVisible(!isMonitorVisible)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 状态指示灯 */}
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%',
              backgroundColor: 
                wsStatus === 'open' ? '#4ade80' : // 绿
                wsStatus === 'connecting' ? '#fbbf24' : // 黄
                '#f87171', // 红
              boxShadow: wsStatus === 'open' ? '0 0 8px #4ade80' : 'none'
            }}></span>
            <strong style={{ color: '#fff' }}>WS 调试监控</strong>
            <span style={{ color: '#888' }}>({wsStatus})</span>
          </div>
          <button style={{ 
            background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '0' 
          }}>
            {isMonitorVisible ? '▼' : '▲'}
          </button>
        </div>

        {/* 消息列表区域 */}
        {isMonitorVisible && (
          <div style={{ height: '250px', overflowY: 'auto', padding: '8px' }}>
            {wsLogs.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>暂无消息...</div>
            ) : (
              wsLogs.map((log, index) => (
                <div key={index} style={{ 
                  marginBottom: '6px', 
                  wordBreak: 'break-all',
                  color: log.includes('📩') ? '#61dafb' : 
                         log.includes('❌') ? '#f87171' : 
                         log.includes('✅') ? '#4ade80' : '#d4d4d4'
                }}>
                  {log}
                </div>
              ))
            )}
            {/* 保证最新消息滚动到底部：可以使用 ref 自动滚动，这里简单处理 */}
          </div>
        )}
      </div>
    </div>
  );
}
