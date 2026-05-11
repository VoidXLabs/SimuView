import { useState, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Play, Square, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";

export default function TtsTest() {
  const [text, setText] = useState("你好，这是 SimuView 智能面试系统的语音测试。");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (!text.trim()) {
      toast.error("请输入要测试的文本");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('TTS 服务响应失败');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        toast.error("音频播放失败");
      };

      await audio.play();
    } catch (error) {
      console.error("TTS Error:", error);
      toast.error("无法连接到 Node TTS 服务，请确保服务已启动 (端口 3001)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl text-white rounded-xl p-6 shadow-xl">
        <div className="mb-6 border-b border-white/10 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Volume2 className="text-cyan-400" />
            Node TTS 服务测试
          </h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">测试文本</label>
            <Input 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="输入文字..."
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handlePlay} 
              disabled={isLoading || isPlaying}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "转换中..." : "播放语音"}
            </Button>
            
            <Button 
              onClick={handleStop} 
              disabled={!isPlaying}
              variant="destructive"
              className="px-4"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <p className="text-xs text-cyan-200 leading-relaxed">
              提示：请确保 <code>TTSASRServer</code> 目录下的 Node 服务已运行在 3001 端口。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
