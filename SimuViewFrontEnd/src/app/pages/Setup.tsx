import { useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon } from "lucide-react";
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

  // 💡使用 useRef 存储 WebSocket 实例
  const wsRef = useRef<WebSocket | null>(null);
  // 组件挂载时：建立 WebSocket 连接
    useEffect(() => {
        console.log(`初始化 WebSocket 连接，通道ID: ${view_id}`);
        // 建立连接
        const ws = new WebSocket(`ws://xxx/ws/v1/interview/task-status/{view_id}${view_id}`);
        wsRef.current = ws;

        // 监听连接建立
        ws.onopen = () => {
            console.log('✅ WebSocket 连接已建立');
        };

        // 监听后端推送的消息
        ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            
            switch(response.status) {
                case 'processing':
                    // 后端推送：连接成功、解析中、存储中...
                    setLoadingText(response.message);
                    break;
                case 'success':
                    // 后端推送：大功告成
                    setIsParsing(false);
                    setLoadingText('解析成功！');
                    setParsedData(response.data);
                    // TODO: 可以在这里使用 react-router-dom 的 useNavigate() 跳转到面试页面
                    break;
                case 'error':
                    // 后端推送：爬虫失败、被反爬拦截等
                    setIsParsing(false);
                    setLoadingText('抓取失败，请手动输入JD');
                    break;
                default:
                    break;
            }
        };

        ws.onerror = (error) => console.error("❌ WebSocket 发生错误", error);
        ws.onclose = () => console.log("⚠️ WebSocket 连接已关闭");

        // 组件卸载时的清理函数
        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, [view_id]); // 依赖项数组包含 viewId

  // 页面中相关变量
  const navigate = useNavigate();
  const [jobUrl, setJobUrl] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [prepearation, setPrepearation] = useState<true | false>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

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
        const response = await axios.post('https://xxx/api/v1/interview/start-parse', {
            view_id: view_id,
            url: jobUrl
        });

        const data = response.data;
        console.log('返回数据:', data);
        
        // 🚨 注意重点：
        // HTTP 请求返回 200 成功，只代表“后端把任务放进队列了”。
        // 我们【绝不能】在这里把 isParsing 设为 false！
        // 真正的状态解除，必须依赖 useEffect 里 ws.onmessage 收到的 success 信号。
        setLoadingText('任务已进入队列，等待后台处理...');
        
    } catch (error) {
        // 如果提交任务本身失败（比如网络断开，或者后端网关报错）
        setIsParsing(false);
        setLoadingText('系统繁忙，任务提交失败');
        console.error("提交爬虫任务失败", error);
    }

  }

  // 解析用户简历
  const analysisUserResume = () => {

  }


  const handleStartInterview = () => {
    if (jobUrl && resume) {
      // 将数据传递到面试页面
      navigate("/interview", {
        state: {
          view_id,
          jobUrl,
          resumeName: resume.name,
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
            {/* 岗位URL输入 todo : 当点击解析按钮时 触发分析岗位信息脚本 */}
            <div className="space-y-2">
              <Label htmlFor="job-url" className="text-neutral-700">
                Boss直聘岗位链接
              </Label>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="relative" style={{ flex: 1 }}>
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="job-url"
                    type="url"
                    placeholder="https://www.zhipin.com/job_detail/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="pl-11 h-12 bg-neutral-50 border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400"
                  />
                </div>
                <Button 
                  onClick={analysisJobUrl}
                  disabled={isParsing} 
                  className="bg-neutral-800 hover:bg-neutral-700">
                    {isParsing ? '解析中...' : '开始解析'}
                </Button>
              </Box>
              <p className="text-sm text-neutral-500">
                粘贴Boss直聘上的目标岗位链接
              </p>
            </div>

            {/* 简历上传 */}
            <div className="space-y-2">
              <Label htmlFor="resume-upload" className="text-neutral-700">
                上传简历
              </Label>
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-neutral-400 transition-colors">
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer block"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-neutral-600" />
                    </div>
                    {resume ? (
                      <div className="space-y-1">
                        <p className="font-medium text-neutral-900">
                          {resume.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          点击可重新上传
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-medium text-neutral-900">
                          点击上传简历文件
                        </p>
                        <p className="text-sm text-neutral-500">
                          支持 PDF、DOC、DOCX 格式
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* 开始面试按钮 */}
            <div className="pt-4">
              <Button
                onClick={handleStartInterview}
                disabled={!prepearation}
                className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500 text-white rounded-xl text-base"
              >
                开始面试
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
