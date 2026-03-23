export const speakPureFrontend = (text: string) => {
    if (!('speechSynthesis' in window)) {
        console.error("很遗憾，您的浏览器不支持语音播报");
        return;
    }

    // 先取消之前可能卡住的播报
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 👇 强制指定语言标签，这是最有效的保底方案！即使找不到特定声优，也会用默认中文
    utterance.lang = 'zh-CN'; 

    // 核心执行函数
    const doSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // 尝试寻找最好听的中文女声 (兼容不同浏览器的命名习惯)
        const zhVoice = voices.find(v => 
            v.lang.includes('zh') && (v.name.includes('Xiaoxiao') || v.name.includes('Ting-Ting'))
        ) || voices.find(v => v.lang.includes('zh'));

        if (zhVoice) {
            utterance.voice = zhVoice;
            console.log("🔊 成功匹配到中文语音引擎:", zhVoice.name);
        } else {
            console.warn("⚠️ 未找到专属中文语音，使用系统默认中文引擎");
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            console.log("✅ 前端本地 AI 播报完毕，准备录音...");
            // setIsAiSpeaking(false);
        };

        utterance.onerror = (e) => {
            console.error("❌ 语音播报发生错误:", e);
        };

        // 正式开始播报
        window.speechSynthesis.speak(utterance);
    };

    // 👇 解决异步加载的核心逻辑
    let currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices.length === 0) {
        // 如果是空数组，说明浏览器还在加载语音包，挂载监听器
        console.log("⏳ 正在等待浏览器加载语音引擎...");
        window.speechSynthesis.onvoiceschanged = () => {
            // 加载完成后立刻执行
            doSpeak();
            // 触发一次后注销监听，防止重复触发
            window.speechSynthesis.onvoiceschanged = null; 
        };
    } else {
        // 如果已经有语音包了，直接执行
        doSpeak();
    }
};