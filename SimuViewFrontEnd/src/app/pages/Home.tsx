import { useNavigate } from "react-router";
import { Brain } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-neutral-900">
            AI 智能模拟面试系统
          </h1>
          <p className="text-lg text-neutral-600 max-w-xl mx-auto">
            基于大语言模型的全真模拟面试体验，为您提供个性化的面试问题和专业的能力评估
          </p>
        </div>

        <div className="space-y-6 pt-8">
          <Button
            onClick={() => navigate("/setup")}
            size="lg"
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-12 py-6 text-lg h-auto rounded-xl"
          >
            开始面试
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            <div className="p-6 bg-white rounded-xl border border-neutral-200">
              <h3 className="font-medium text-neutral-900 mb-2">智能提问</h3>
              <p className="text-sm text-neutral-600">
                根据岗位和简历动态生成个性化面试问题
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-neutral-200">
              <h3 className="font-medium text-neutral-900 mb-2">语音交互</h3>
              <p className="text-sm text-neutral-600">
                真实的语音对话体验，模拟真实面试场景
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-neutral-200">
              <h3 className="font-medium text-neutral-900 mb-2">专业评估</h3>
              <p className="text-sm text-neutral-600">
                多维度能力分析，提供详细的改进建议
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
