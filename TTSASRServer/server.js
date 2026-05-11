import express from 'express';
import cors from 'cors';
import * as googleTTS from 'google-tts-api';
import https from 'https';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import tencentcloud from 'tencentcloud-sdk-nodejs-asr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载本地的 .env 配置文件
dotenv.config();

const app = express();
app.use(cors());
// 增加 JSON 大小限制，以防后续传输大的 Base64
app.use(express.json({ limit: '50mb' })); 

// 配置 Multer 处理上传文件 (存在内存里)
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: '文本不能为空' });

  try {
    const url = googleTTS.getAudioUrl(text, {
      lang: 'zh-CN',
      slow: false,
      host: 'https://translate.google.com',
    });

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

app.post('/api/asr', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有上传音频文件' });
  }

  try {
    const AsrClient = tencentcloud.asr.v20190614.Client;
    const clientConfig = {
      credential: {
        secretId: process.env.TENCENT_CLOUD_SECRET_ID,
        secretKey: process.env.TENCENT_CLOUD_SECRET_KEY,
      },
      region: "ap-shanghai",
      profile: {
        httpProfile: {
          endpoint: "asr.tencentcloudapi.com",
        },
      },
    };

    const client = new AsrClient(clientConfig);

    // 将音频文件转换为 Base64
    const audioBase64 = req.file.buffer.toString('base64');

    const params = {
      ProjectId: parseInt(process.env.TENCENT_CLOUD_APP_ID || "0"),
      SubServiceType: 2, // 2: 一句话识别
      SourceType: 1, // 1: 语音数据
      VoiceFormat: "wav",
      UsrAudioKey: `audio_${Date.now()}`,
      Data: audioBase64,
      DataLen: req.file.buffer.length,
      EngSerViceType: "16k_zh" // 16k 中文引擎服务
    };

    const result = await client.SentenceRecognition(params);
    console.log("ASR Result:", JSON.stringify(result));
    res.json({ success: true, text: result.Result });
  } catch (error) {
    console.error('腾讯云 ASR 错误:', error);
    res.status(500).json({ error: 'ASR 识别失败', details: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});