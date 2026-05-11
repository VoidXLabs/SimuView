import { pipeline, env } from '@xenova/transformers';

// 跳过本地模型检查，直接从 HuggingFace 加载
env.allowLocalModels = false;

class PipelineSingleton {
    static task = 'automatic-speech-recognition' as const;
    static model = 'Xenova/whisper-tiny';
    static instance: any = null;

    static async getInstance(progress_callback: any = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const message = event.data;

    // 预加载或获取 Pipeline 单例
    let transcriber = await PipelineSingleton.getInstance((x: any) => {
        self.postMessage(x);
    });

    if (message.type === 'load') {
        self.postMessage({ status: 'ready' });
        return;
    }

    if (message.audio) {
        try {
            let result = await transcriber(message.audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'chinese',
                task: 'transcribe',
            });

            self.postMessage({
                status: 'complete',
                output: result,
            });
        } catch (err) {
            self.postMessage({ status: 'error', error: String(err) });
        }
    }
});