import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, Star, Clock, FileText, ChevronRight, Brain } from "lucide-react";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for the detailed report
  const report = {
    title: "Java Senior Engineer Interview",
    date: "May 3, 2026",
    status: "Completed",
    score: 88,
    duration: "45 minutes",
    summary: "Overall, the candidate demonstrated strong technical knowledge in Java core, Spring Boot, and Microservices. Communication was clear, though some improvement is needed in deep-diving into JVM optimization.",
    strengths: ["Strong understanding of concurrency", "Excellent problem solving skills", "Clean code practices"],
    weaknesses: ["JVM memory management details", "Specific cloud-native design patterns"],
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-500 opacity-10 blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        <Header showNav />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back to Dashboard</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-[2.5rem] bg-slate-800/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-[5rem] -z-10"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                      <Briefcase className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-emerald-400 font-bold tracking-wider text-sm">INTERVIEW REPORT</span>
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-tight">{report.title}</h1>
                  <div className="flex items-center gap-4 text-slate-300 text-sm font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {report.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {report.duration}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-3xl border border-white/5 shadow-inner min-w-[120px]">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Score</span>
                  <span className="text-5xl font-black text-white">{report.score}</span>
                  <div className="mt-2 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'fill-emerald-500 text-emerald-500' : 'text-slate-600'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    Interview Summary
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {report.summary}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                    <h4 className="text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-3">
                      {report.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-neutral-300 text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-4">
                    <h4 className="text-amber-400 font-bold flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Areas for Growth
                    </h4>
                    <ul className="space-y-3">
                      {report.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-neutral-300 text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-slate-800/40 border border-white/5 p-8 flex items-center justify-between group cursor-pointer hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Full Interview Transcript</h3>
                  <p className="text-slate-400 text-sm">Review every question and your answers in detail</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-xl border border-white/10 p-6 space-y-6">
              <h3 className="text-white font-bold px-2">Interview Meta</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors">
                  <span className="text-slate-400 text-sm">Interview ID</span>
                  <span className="text-neutral-200 font-mono text-xs">#{id || '7721'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors">
                  <span className="text-slate-400 text-sm">Format</span>
                  <span className="text-neutral-200 text-sm">Voice AI</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors">
                  <span className="text-slate-400 text-sm">AI Model</span>
                  <span className="text-neutral-200 text-sm">GPT-4-Turbo</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5 px-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-12 font-bold shadow-lg shadow-emerald-900/20">
                  Download PDF Report
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold">Ready for another?</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Practice makes perfect. Start a new session to improve your score.
              </p>
              <Button 
                onClick={() => navigate("/setup")}
                className="w-full bg-white text-black hover:bg-neutral-200 rounded-xl h-12 font-bold"
              >
                New Practice Session
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}