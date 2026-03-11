import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Link as LinkIcon } from "lucide-react";
import { Box } from '@mui/material';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Setup() {
  // todo 进入Setup页面时， 会根据当前用户id和当前时间戳生成一个view_id
  const timestamp = Date.now();
  const view_id = timestamp.toString() + "1";

  const navigate = useNavigate();
  const [jobUrl, setJobUrl] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [prepearation, setPrepearation] = useState<true | false>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  // 解析招聘信息
  const analysisJobUrl = () => {

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

  const isJobUrlValid = jobUrl.trim() !== "";

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
                  disabled={!isJobUrlValid} 
                  className="bg-neutral-800 hover:bg-neutral-700">
                    解析
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
