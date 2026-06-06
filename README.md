# 🚀 SimuView: 智能全真模拟面试与评估系统

<div align="center">
  <img src="SimuViewFrontEnd/public/fluffychat.png" width="120" height="120" alt="SimuView Logo" />
  <p align="center">
    <strong>基于大模型 (LLM) 的下一代沉浸式模拟面试解决方案</strong>
  </p>

  [![React](https://img.shields.io/badge/Frontend-React%2018-blue?logo=react)](https://reactjs.org/)
  [![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
  [![AI](https://img.shields.io/badge/AI-LLM%20Powered-purple?logo=openai)](https://openai.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)


---

## 🌟 项目简介

**SimuView** 是一款旨在消除面试焦虑、提升 Offer 命中率的智能全真模拟面试系统。它不仅能精准解析您的简历与岗位要求（JD），还能通过全双工语音交互（TTS/ASR）还原真实面试高压环境。面试结束后，系统将为您生成多维度的量化评估报告与能力图谱。

### 核心价值
- **消除焦虑**：在 1:1 还原的拟真环境中反复演练，变被动为主动。
- **深度复盘**：AI 导师为您捕捉表达细节，指出逻辑漏洞。
- **精准匹配**：基于真实 JD 生成问题，直击岗位核心考点。

---

## ✨ 核心特性

| 特性 | 描述 |
| :--- | :--- |
| **📄 智能解析** | 自动解析 PDF 简历与岗位链接/文本，提取关键技能矩阵。 |
| **🎙️ 沉浸式对答** | 集成 ASR (语音转文字) 与 TTS (文字转语音)，实现流畅的语音交互。 |
| **🎭 风格自定义** | 提供“温柔引导”、“常规面试”、“高压挑战”等多种 AI 面试风格。 |
| **📊 量化评估** | 生成多维度能力雷达图，包含逻辑、专业知识、表达等评分。 |
| **⌛ 历史追踪** | 完整保存每一次面试的录音、转写记录与评估报告。 |

---

## 📸 界面预览

<div align="center">
  <table border="0">
    <tr>
      <td><img src="SimuViewFrontEnd/public/img/step_1_insert_information.png" width="280" alt="Step 1" /><br/><p align="center">1. 数据导入与解析</p></td>
      <td><img src="SimuViewFrontEnd/public/img/step_2_interview.png" width="280" alt="Step 2" /><br/><p align="center">2. 沉浸式模拟对练</p></td>
      <td><img src="SimuViewFrontEnd/public/img/step_3_chek_report.png" width="280" alt="Step 3" /><br/><p align="center">3. 深度评估与复盘</p></td>
    </tr>
  </table>
</div>

---

## 🏗️ 系统架构

SimuView 采用 **多语言、分布式协同架构**，充分发挥各技术栈的优势，确保了高并发下的稳定性与实时交互的流畅性：

<div align="center">
  <img src="images/system_struct.png" width="900" alt="SimuView Architecture" />
</div>

- **☕ Java Spring Boot (核心枢纽)**：负责核心业务逻辑、数据库事务、AI 工作流编排及安全校验。作为系统的“大脑”，协调各微服务间的通信。
- **🐍 Python FastAPI (数据抓取)**：利用 Python 强大的生态与 `Scrapy/Request` 能力，负责实时抓取岗位描述（JD）数据并进行结构化 ETL 处理。
- **⚡ Node.js (语音中枢)**：发挥其非阻塞 I/O 优势，作为 ASR/TTS 的高性能代理，处理海量实时语音流数据的转换与分发。
- **⚛️ React + TS (用户终端)**：构建响应式 UI，通过 Web Workers 异步处理语音采集，为用户提供沉浸式的赛博朋克风格交互体验。

---

## 🤝 协同亮点

- **实时反馈闭环**：前端采集音频流 -> Node.js 转发 -> 云端 ASR -> Java 后端触发 AI 追问 -> 生成文本 -> Node.js 转发云端 TTS -> 前端播放。
- **动态 JD 注入**：Java 后端通过 REST 调用 Python 爬虫，实时获取最新岗位要求，使 AI 面试官具备“行业感知”。
- **资源高效调度**：Python 负责 CPU 密集型的数据解析，Node.js 负责高并发的 I/O 流，Java 负责复杂的业务逻辑，各司其职。

---

## 🛠️ 环境要求

在启动项目之前，请确保您的本地开发环境已安装以下软件：

| 软件 | 版本 | 说明 |
| :--- | :--- | :--- |
| **JDK** | 17+ | 后端运行核心环境 |
| **Python** | 3.9+ | 爬虫与数据处理服务 |
| **Node.js** | 20.x+ | 前端及语音服务运行环境 |
| **MySQL** | 8.0+ | 结构化数据存储 |
| **Maven** | 3.8+ | Java 项目构建工具 |

---

## ⚙️ 配置指南

### 1. 数据库准备
1. 创建数据库 `simuview`:
   ```sql
   CREATE DATABASE simuview CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. 运行项目根目录下的 `sql/store.sql` 脚本初始化表结构。

### 2. 后端配置 (SimuViewBackEnd)
设置环境变量或在 `application-secret.yml` 中配置：

| 参数名 | 说明 |
| :--- | :--- |
| `SPRING_DATASOURCE_PASSWORD` | MySQL 数据库密码 |
| `SPRING_AI_OPENAI_API_KEY` | 大模型 API KEY (支持 OpenAI 兼容接口) |
| `ALIYUN_OSS_ACCESS_KEY_ID` | 阿里云 OSS AccessKey ID |
| `ALIYUN_OSS_ACCESS_KEY_SECRET` | 阿里云 OSS AccessKey Secret |
| `SIMUVIEW_JWT_SECRET_KEY` | JWT 签名密钥 (建议设置为 32 位随机字符串) |

### 3. 前端与服务地址 (SimuViewFrontEnd)
在 `SimuViewFrontEnd` 目录下配置 `.env`：
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_TTS_ASR_URL=http://localhost:3000
VITE_SPIDER_URL=http://localhost:8000
```

---

## 🚀 启动流程 (建议按序启动)

### 1. 启动语音服务 (Node.js)
```bash
cd TTSASRServer && npm install && node server.js
```

### 2. 启动数据爬虫服务 (Python)
```bash
cd SpiderServer && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
```

### 3. 启动后端核心 (Java)
```bash
cd SimuViewBackEnd && mvn spring-boot:run
```

### 4. 启动前端界面 (React)
```bash
cd SimuViewFrontEnd && npm install && npm run dev
```

---


详细的设计文档与实践报告请参考项目根目录下的 `docx/` 文件夹：
- [《系统需求规格说明书》](./docx/基于大模型（LLM）的智能全真模拟面试与评估系统需求规格%20V1.0.docx)
- [《系统概要设计》](./docx/基于大模型（LLM）的智能全真模拟面试与评估系统概要设计%20V1.0.doc)
- [《系统架构图》](./images/系统架构图.png)

---

## 🤝 贡献与反馈

如果您在使用过程中发现任何 Bug 或有更好的功能建议，欢迎提交 **Issue** 或发起 **Pull Request**。

---

<div align="center">
  <p>Made with ❤️ by 符淏 (VoidXLab)</p>
</div>
