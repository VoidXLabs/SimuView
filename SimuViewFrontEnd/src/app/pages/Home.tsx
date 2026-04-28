import { useNavigate } from "react-router";
import { Brain, Plus, Briefcase, Calendar, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Header } from "../components/Header";

// 模拟面试历史数据
const mockInterviews = [
  {
    id: "1",
    position: "前端工程师",
    date: "2024-01-15",
    status: "completed",
    score: "85"
  },
  {
    id: "2",
    position: "全栈开发",
    date: "2024-01-12",
    status: "completed",
    score: "78"
  }
];

export default function Home() {
  const navigate = useNavigate();
  const hasInterviews = mockInterviews.length > 0;

  const handleStartInterview = () => {
    navigate("/setup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <Header showNav />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* 中部主卡片 */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-800 via-neutral-750 to-neutral-800 p-12 shadow-2xl border border-neutral-700/30">
            {/* 背景装饰 */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
              <div className="absolute top-10 right-20 w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="absolute top-32 right-40 w-3 h-3 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-20 right-32 w-5 h-5 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Get Interview-Ready
                  </span>
                  <br />
                  <span className="text-white">with AI-Powered</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Practice & Feedback
                  </span>
                </h1>
                <p className="text-lg text-neutral-400 max-w-lg mb-8 leading-relaxed">
                  Practice with real interview questions and receive instant, personalized feedback powered by advanced AI technology.
                </p>
                <Button
                  onClick={handleStartInterview}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  Start an Interview
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* 装饰性图标区域 */}
              <div className="relative w-64 h-64 hidden lg:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white font-semibold">AI Interviewer</p>
                      <p className="text-neutral-400 text-sm">Powered by GPT-4</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 面试历史区域 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Your Interviews
                </span>
              </h2>
              <p className="text-neutral-400 text-sm mt-1">Track your progress</p>
            </div>
          </div>

          <div className="rounded-3xl bg-neutral-800/50 border border-neutral-700/30 p-8">
            {hasInterviews ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="bg-neutral-700/50 rounded-2xl p-6 border border-neutral-600/30 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{interview.position}</h3>
                        <div className="flex items-center gap-1 text-neutral-400 text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>{interview.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 text-sm">Status: Completed</span>
                      <span className="text-blue-400 font-bold">Score: {interview.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <button
                  onClick={handleStartInterview}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-dashed border-neutral-600 flex items-center justify-center mb-6 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group cursor-pointer"
                >
                  <Plus className="w-8 h-8 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                </button>
                <h3 className="text-xl font-semibold text-white mb-2">No Past Interviews</h3>
                <p className="text-neutral-400 text-center max-w-md mb-6">
                  You haven't taken any interviews yet. Start your first interview to see your history here.
                </p>
                <Button
                  onClick={handleStartInterview}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                >
                  Start an Interview
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}