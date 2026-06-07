import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Briefcase, Calendar, Star, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";
import { EvaluationReportView } from "../components/EvaluationReportView";

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data matching EvaluateReportDTO schema
  const report = {
    title: "Java Senior Engineer Interview",
    date: "May 3, 2026",
    status: "Completed",
    totalScore: 88,
    duration: "45 minutes",
    overallReport: "Overall, the candidate demonstrated strong technical knowledge in Java core, Spring Boot, and Microservices. Communication was clear, though some improvement is needed in deep-diving into JVM optimization.",
    strengths: ["Strong understanding of concurrency", "Excellent problem solving skills", "Clean code practices"],
    weaknesses: ["JVM memory management details", "Specific cloud-native design patterns"],
    suggestions: [
      "Deepen understanding of JVM internal memory regions (Eden, Survivor, Tenured).",
      "Study modern cloud-native patterns like Sidecar and Circuit Breaker in more detail.",
      "Practice articulating complex architectural decisions more concisely."
    ],
    dimensionScores: {
      technicalDepth: 85,
      problemSolving: 92,
      communication: 80,
      logicalThinking: 90,
      experienceMatch: 88,
      learningPotential: 95
    },
    questionEvaluations: [
      {
        questionIndex: 1,
        question: "Explain the memory model in Java and how GC works.",
        userAnswer: "Java memory is divided into Heap and Stack. GC cleans up unused objects in the heap...",
        score: 82,
        feedback: "Good basic understanding, but missed details about G1 collector and ZGC."
      },
      {
        questionIndex: 2,
        question: "How do you handle distributed transactions in a microservices architecture?",
        userAnswer: "I usually use the Saga pattern, either orchestration or choreography based...",
        score: 95,
        feedback: "Excellent explanation of Saga patterns and trade-offs."
      },
      {
        questionIndex: 3,
        question: "Describe a time you solved a complex production bug.",
        userAnswer: "We had a memory leak in our production environment that only appeared under high load...",
        score: 88,
        feedback: "Solid problem-solving process demonstrated."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-500 opacity-5 dark:opacity-10 blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        <Header showNav />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 backdrop-blur-sm w-fit shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">返回仪表盘</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-[2.5rem] bg-white dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 md:p-10 shadow-xl dark:shadow-2xl overflow-hidden relative transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-[5rem] -z-10"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/10 dark:border-emerald-500/20">
                      <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wider text-sm uppercase">面试报告</span>
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{report.title}</h1>
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-300 text-sm font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {report.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {report.duration}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-white/5 shadow-inner min-w-[120px]">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">评分</span>
                  <span className="text-5xl font-black text-slate-900 dark:text-white">{report.totalScore}</span>
                  <div className="mt-2 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'fill-emerald-500 text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <EvaluationReportView data={report} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 transition-colors shadow-sm sticky top-8">
              <h3 className="text-slate-900 dark:text-white font-bold px-2">面试信息</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">面试 ID</span>
                  <span className="text-slate-700 dark:text-neutral-200 font-mono text-xs">#{id || '7721'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">形式</span>
                  <span className="text-slate-700 dark:text-neutral-200 text-sm">语音 AI</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">AI 模型</span>
                  <span className="text-slate-700 dark:text-neutral-200 text-sm">GPT-4-Turbo</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 px-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl h-12 font-bold shadow-lg shadow-emerald-900/10 dark:shadow-emerald-900/20">
                  下载 PDF 报告
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-600/10 dark:to-teal-600/10 border border-emerald-100 dark:border-emerald-500/20 p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-emerald-500/10 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold">准备好下一次了吗？</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                熟能生巧。开始新的练习以提高你的分数。
              </p>
              <Button 
                onClick={() => navigate("/setup")}
                className="w-full bg-emerald-600 dark:bg-white text-white dark:text-black hover:bg-emerald-700 dark:hover:bg-neutral-200 rounded-xl h-12 font-bold shadow-md transition-all"
              >
                开始新练习
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
