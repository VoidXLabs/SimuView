import { useState, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Mic, MicOff, Loader2, MessageSquare, CloudLightning } from "lucide-react";
import { toast } from "sonner";

export default function AsrTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Float32Array 转换为 16位 PCM WAV 的辅助函数
  const encodeWAV = (samples: Float32Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    
    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // 1 channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true); // 16-bit
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    
    // 写入 PCM 样本数据
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    return new Blob([view], { type: 'audio/wav' });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAndUploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("开始录音...");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("无法访问麦克风，请检查权限");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
      toast.info("正在发送至腾讯云识别...");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const processAndUploadAudio = async (blob: Blob) => {
    try {
      // 1. 将录音文件解码为音频数据 (腾讯云一句话识别需要 16k 采样率)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = decoded.getChannelData(0); // 单声道
      
      // 2. 转换为腾讯云支持的 WAV 格式
      const wavBlob = encodeWAV(audioData, 16000);
      
      // 3. 构建 FormData 上传
      const formData = new FormData();
      formData.append('audio', wavBlob, 'record.wav');

      // 4. 调用后端的腾讯云 ASR 接口
      const response = await fetch('/tts-api/api/asr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '识别失败');
      }

      setTranscript(prev => prev + (prev ? " " : "") + data.text);
      toast.success("识别完成");
      
    } catch (error: any) {
      console.error("ASR Error:", error);
      toast.error("识别失败: " + error.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white rounded-xl p-8 shadow-2xl">
        <div className="mb-8 border-b border-white/10 pb-4 flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <CloudLightning className="text-cyan-400" />
            腾讯云 ASR 测试 (云端极速识别)
          </h2>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${
                isTranscribing ? 'bg-amber-500 animate-pulse' : 
                isRecording ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
            }`}></div>
            <span className="text-[10px] font-mono uppercase tracking-widest">
              {isTranscribing ? 'Processing' : 
               isRecording ? 'Recording' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="min-h-[200px] p-6 bg-black/40 border border-white/5 rounded-2xl relative">
            <MessageSquare className="absolute top-4 right-4 w-4 h-4 text-white/10" />
            
            <div className="text-lg leading-relaxed font-light">
              {transcript ? (
                <span className="text-white">{transcript}</span>
              ) : (
                <span className="text-slate-600 italic">
                  {isTranscribing ? "正在连接腾讯云进行极速转写..." : "请点击下方按钮开始说话..."}
                </span>
              )}
            </div>
            
            {isRecording && (
              <div className="absolute bottom-4 right-4 flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            )}
            {isTranscribing && (
              <div className="absolute bottom-4 right-4">
                 <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={toggleRecording}
              disabled={isTranscribing}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                isRecording 
                  ? 'bg-rose-500 hover:bg-rose-600 border-rose-400/50 scale-110 shadow-[0_0_30px_rgba(244,63,94,0.4)]' 
                  : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400/50 shadow-[0_0_20px_rgba(8,145,178,0.3)]'
              } disabled:opacity-50 disabled:scale-100`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
            <p className="text-slate-400 text-sm font-medium">
              {isRecording ? "点击结束录音并发送至云端" : "点击开始录音"}
            </p>
          </div>

          <div className="mt-4 p-4 bg-white/5 border border-white/5 rounded-xl">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">技术细节 (腾讯云)</h4>
            <ul className="text-[11px] text-slate-500 space-y-1 font-mono">
              <li>• API: 腾讯云一句话识别 (SentenceRecognition)</li>
              <li>• 格式转换: 前端解码为 PCM 并封装为 WAV (16kHz 单声道)</li>
              <li>• 优点: 识别极速、准确度高、支持标点符号</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}