import React, { useState, useRef } from 'react';

const GoogleTTSPlayer: React.FC = () => {
  const [text, setText] = useState<string>('你好，这是使用谷歌翻译接口生成的免费语音测试。');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 明确指定 useRef 保存的是 HTMLAudioElement 实例
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayTTS = async (): Promise<void> => {
    if (!text.trim()) {
      alert('请输入需要转换的文本');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // 清理上一次的音频内存
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        console.log('语音播放结束');
      };
      
      await audio.play();

    } catch (error) {
      console.error('播放语音失败:', error);
      alert('语音生成失败，请确保你的 Node.js 后端已经启动 (端口 3001)。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '450px', margin: '0 auto', fontFamily: 'sans-serif', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0 }}>免费 TTS 语音播报模块</h3>
      
      <textarea
        rows={4}
        value={text}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '10px', 
          marginBottom: '15px', 
          borderRadius: '6px', 
          border: '1px solid #ccc',
          boxSizing: 'border-box',
          resize: 'vertical'
        }}
        placeholder="请输入你想让浏览器朗读的文字..."
      />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handlePlayTTS} 
          disabled={isLoading}
          style={{ 
            flex: 1,
            padding: '10px', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '正在生成并缓冲...' : '▶ 转换为语音并播放'}
        </button>

        <button 
          onClick={handleStop}
          style={{ 
            padding: '10px 15px', 
            cursor: 'pointer',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          ■ 停止
        </button>
      </div>
    </div>
  );
};

export default GoogleTTSPlayer;