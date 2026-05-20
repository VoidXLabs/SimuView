import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import tencentcloudAsr from 'tencentcloud-sdk-nodejs-asr';
import tencentcloudTts from 'tencentcloud-sdk-nodejs-tts';

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

// 腾讯云公共配置
const clientConfig = {
  credential: {
    secretId: process.env.TENCENT_CLOUD_SECRET_ID,
    secretKey: process.env.TENCENT_CLOUD_SECRET_KEY,
  },
  region: "ap-shanghai",
  profile: {
    httpProfile: {
      endpoint: "tts.tencentcloudapi.com", // 默认 TTS 端点
    },
  },
};

app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: '文本不能为空' });

  try {
    const TtsClient = tencentcloudTts.tts.v20190823.Client;
    const client = new TtsClient(clientConfig);

    const params = {
      Text: text,
      SessionId: `tts_${Date.now()}`,
      VoiceType: 1004,   // 智云 (标准男声) - 语气沉稳、严肃，适合面试官场景
      ModelType: 0,      // 使用标准模型
      Volume: 0,
      Speed: 0,
      ProjectId: parseInt(process.env.TENCENT_CLOUD_APP_ID || "0"),
      Codec: "mp3"
    };

    const result = await client.TextToVoice(params);
    
    if (result.Audio) {
      const audioBuffer = Buffer.from(result.Audio, 'base64');
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    } else {
      throw new Error('腾讯云 TTS 未返回音频数据');
    }

  } catch (error) {
    console.error('腾讯云 TTS 错误:', error);
    res.status(500).json({ error: 'TTS 转换失败', details: error.message });
  }
});

app.post('/api/asr', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有上传音频文件' });
  }

  try {
    const AsrClient = tencentcloudAsr.asr.v20190614.Client;
    // ASR 需要不同的端点
    const asrConfig = {
      ...clientConfig,
      profile: {
        httpProfile: {
          endpoint: "asr.tencentcloudapi.com",
        },
      },
    };
    const client = new AsrClient(asrConfig);

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
