import express from 'express';
import cors from 'cors';
import * as googleTTS from 'google-tts-api';
import https from 'https';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: '文本不能为空' });

  try {
    // 1. 获取 Google TTS 的音频下载链接
    const url = googleTTS.getAudioUrl(text, {
      lang: 'zh-CN', // 中文
      slow: false,   // 正常语速
      host: 'https://translate.google.com',
    });

    // 2. 将音频流直接转发给前端
    https.get(url, (audioResponse) => {
      res.setHeader('Content-Type', 'audio/mpeg');
      audioResponse.pipe(res);
    }).on('error', (e) => {
      console.error('音频下载失败:', e);
      res.status(500).json({ error: '音频下载失败' });
    });

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Google TTS 服务已启动: http://localhost:${PORT}`);
});
