import { useNavigate } from "react-router";
import { Brain } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-12">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-neutral-900">
              AI 智能模拟面试系统
            </h1>
            <p className="text-xl text-neutral-600 max-w-xl mx-auto">
              基于大语言模型的全真模拟面试体验，为您提供个性化的面试问题和专业的能力评估
            </p>
          </div>
        </div>

        <div className="space-y-10 pt-4">
          <Button
            onClick={() => navigate("/setup")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-16 py-8 text-xl h-auto rounded-2xl shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
          >
            开始面试
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              { title: "智能提问", desc: "根据岗位和简历动态生成个性化面试问题" },
              { title: "语音交互", desc: "真实的语音对话体验，模拟真实面试场景" },
              { title: "专业评估", desc: "多维度能力分析，提供详细的改进建议" }
            ].map((feature, i) => (
              <div key={i} className="group p-8 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <h3 className="font-semibold text-neutral-900 mb-3 text-lg group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
