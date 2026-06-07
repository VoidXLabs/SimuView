import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { 
  Briefcase, CheckCircle2, Star, FileText, Brain, Lightbulb, 
  MessageSquare, ChevronRight, X 
} from "lucide-react";
import { Drawer } from "vaul";
import { Button } from "./ui/button";

interface QuestionEvaluation {
  questionIndex: number;
  question: string;
  userAnswer: string;
  score: number;
  feedback: string;
}

interface DimensionScores {
  technicalDepth: number;
  problemSolving: number;
  communication: number;
  logicalThinking: number;
  experienceMatch: number;
  learningPotential: number;
}

interface EvaluationReportData {
  totalScore: number;
  overallReport: string;
  strengths: string[];
  weaknesses: string[];
  dimensionScores: DimensionScores;
  suggestions: string[];
  questionEvaluations: QuestionEvaluation[];
}

interface EvaluationReportViewProps {
  data: EvaluationReportData;
}

export const EvaluationReportView: React.FC<EvaluationReportViewProps> = ({ data }) => {
  const radarData = [
    { subject: '技术深度', A: data.dimensionScores.technicalDepth, fullMark: 100 },
    { subject: '问题解决', A: data.dimensionScores.problemSolving, fullMark: 100 },
    { subject: '沟通能力', A: data.dimensionScores.communication, fullMark: 100 },
    { subject: '逻辑思维', A: data.dimensionScores.logicalThinking, fullMark: 100 },
    { subject: '经验匹配', A: data.dimensionScores.experienceMatch, fullMark: 100 },
    { subject: '学习潜力', A: data.dimensionScores.learningPotential, fullMark: 100 },
  ];

  const barData = data.questionEvaluations.map(q => ({
    name: `Q${q.questionIndex}`,
    score: q.score,
  }));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header & Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/10 dark:border-emerald-500/20">
              <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wider text-sm uppercase">评估摘要</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">技术评估</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-inner min-w-[140px]">
          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">总分</span>
          <span className="text-5xl font-black text-slate-900 dark:text-white">{data.totalScore}</span>
          <div className="mt-2 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= Math.round(data.totalScore/20) ? 'fill-emerald-500 text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Overall Summary */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" />
          总体评价
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg bg-slate-50/50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
          {data.overallReport}
        </p>
      </section>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-500" />
            技能维度
          </h3>
          <div className="h-[300px] w-full bg-slate-50/50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#80808044" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#808080', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar
                  name="表现"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            问题评分
          </h3>
          <div className="h-[300px] w-full bg-slate-50/50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#80808022" />
                <XAxis dataKey="name" tick={{ fill: '#808080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="score" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* 4. Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 space-y-4">
          <h4 className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            核心优势
          </h4>
          <ul className="space-y-3">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-neutral-300 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 space-y-4">
          <h4 className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-2">
            <Star className="w-5 h-5" />
            待提升点
          </h4>
          <ul className="space-y-3">
            {data.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-neutral-300 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Actionable Suggestions */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-emerald-500" />
          改进建议
        </h3>
        <div className="space-y-3">
          {data.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">{i + 1}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Conversation Transcript Drawer */}
      <section className="pt-6">
        <Drawer.Root direction="right">
          <Drawer.Trigger asChild>
            <div className="rounded-[2rem] bg-slate-900 dark:bg-white/5 border border-slate-800 dark:border-white/10 p-8 flex items-center justify-between group cursor-pointer hover:bg-slate-800 dark:hover:bg-white/10 transition-all shadow-xl">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">完整面试过程</h3>
                  <p className="text-slate-400 text-sm mt-1">以高保真模式回顾每个问题和回答</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border border-slate-700 dark:border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all">
                <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              </div>
            </div>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <Drawer.Content className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-[#0a0a14] z-[101] flex flex-col shadow-2xl outline-none">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">面试记录</h2>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">详细日志</p>
                  </div>
                </div>
                <Drawer.Close asChild>
                  <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </Drawer.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                {data.questionEvaluations.map((q, i) => (
                  <div key={i} className="space-y-6">
                    {/* Interviewer Question */}
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10">
                        <Brain className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">面试官</span>
                          <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">SEQ_{q.questionIndex.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm leading-relaxed shadow-sm">
                          {q.question}
                        </div>
                      </div>
                    </div>

                    {/* Candidate Answer */}
                    <div className="flex gap-4 items-start flex-row-reverse">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <Star className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 space-y-2 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">候选人</span>
                        </div>
                        <div className="p-4 rounded-2xl rounded-tr-none bg-emerald-500/5 border border-emerald-500/10 text-slate-800 dark:text-slate-200 text-sm leading-relaxed shadow-sm text-left">
                          {q.userAnswer}
                        </div>
                      </div>
                    </div>

                    {/* AI Feedback - Optional but good for the "Process" view */}
                    <div className="mx-14 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">评估得分: {q.score}/100</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        反馈: {q.feedback}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">面试流程结束</span>
                  </div>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </section>
    </div>
  );
};
