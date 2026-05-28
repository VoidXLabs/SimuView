# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
# Build the project (skip tests for speed)
mvn clean install -DskipTests

# Run tests
mvn test

# Package as JAR
mvn package

# Run the application
mvn spring-boot:run
```

## Project Overview

AI-powered interview simulation backend (simulated interview / 模拟面试). Spring Boot 4.0 + Java 21 + MyBatis-Plus + Spring AI.

**Stack:** Spring Boot 4.0, Java 21, MyBatis-Plus 3.5.15, Spring AI 2.0.0-M2, MySQL, Aliyun OSS, Apache Tika, JWT (jjwt 0.9.1).

## Architecture

```
controller/  →  service/  →  mapper/  (MyBatis-Plus BaseMapper)
                  ↕
              common/ (dto/entity/exception/utils)
```

### API Layer (controllers)

All under `/api/v1/`. JWT auth required (LoginInterceptor) except `/api/v1/user/**`.

| Controller | Endpoints | Purpose |
|---|---|---|
| `UserController` | POST `/user/login`, `/user/register` | Auth (MD5 password hash) |
| `ResumeController` | POST `/resume/upload`, GET `/resume/{id}` | Resume upload + Tika parsing |
| `JDInformationController` | POST `/jd-information` | Save job descriptions |
| `InterviewRecordController` | POST `/interview-records/page` | Paginated interview history |
| `InterviewSessionController` | POST `/sessions`, GET `/sessions/{id}/questions/stream`, POST `/{id}/answer`, GET `/{id}/status` | SSE-based interview — one connection per question, status polling for report |

All endpoints under `/api/v1/sessions` use SSE (`SseEmitter`) for real-time question streaming. Each question gets its own SSE connection (closes after streaming completes). Answers are submitted via REST POST. When the last question is answered, the backend asynchronously generates the evaluation report; frontend polls `GET /{id}/status` until status becomes `EVALUATED` and retrieves the report.

### AI Integration

- **Model:** Dashscope (阿里云百炼) via OpenAI-compatible API, model `glm-5.1`
- **Config:** `ModelConfig.java` — `ChatClient` bean with `SimpleLoggerAdvisor`
- **Structured Output:** `StructuredOutputInvoker` — generic retry wrapper that calls AI and parses structured JSON responses. Configurable max attempts and error feedback in retry prompts.
- **Prompt Templates:** Spring AI `PromptTemplate` (.st files) under `src/main/resources/prompts/`

### Auth Flow

1. `LoginInterceptor` checks JWT in `token` header on every request (except `/api/v1/user/**`)
2. On success, stores user ID in `BaseContext` (ThreadLocal), cleaned up in `afterCompletion`
3. User password hashed with MD5

### File Storage

Files uploaded to Aliyun OSS via `FileUploadUtil`. Documents parsed by Apache Tika (`DocumentParser`). Supports PDF, Word, plain text, RTF.

### Error Handling

- `BusinessException` — custom runtime exception with code + message
- `GlobalExceptionHandler` — `@RestControllerAdvice` handling validation, upload, IO, and generic errors
- `ErrorCode` — domain-organized codes: 1xxx generic, 2xxx resume, 3xxx interview, 4xxx storage, 5xxx export, 6xxx knowledge base, 7xxx AI, 8xxx rate limit

### Response Format

All APIs return `Result<T>`: `{ code, message, data, timestamp }`. Success = code 200.

### Configuration

- `application.yml` — main config (datasource, AI, OSS, JWT, MyBatis-Plus)
- `application-secret.yml` — gitignored, holds secrets (referenced via `${...}` placeholders)
- Active profile: `spring.profiles.active=secret`
- `spring.ai.openai.api-key` points to Dashscope API key
- `simuview.jwt.secret-key` JWT signing secret

### Key Patterns

- **DTOs as Java records** (final, immutable) — `InterviewSessionDTO`, `EvaluateReportDTO`, `InterviewQuestionDTO`
- **Entities with Lombok** — `@Data @Builder @NoArgsConstructor @AllArgsConstructor` on MyBatis-Plus entities
- **Constructor injection** — `@RequiredArgsConstructor` on all beans
- **`@MapperScan("com.voidxlab.simuview.mapper")`** on the main application class — no individual `@Mapper` needed

## DB Tables

- `users` — userId, username, password_hash, name, role, create_time
- `resume_information` — resumeId, userId, file_url, content (parsed text), create_time
- `jd_information` — jdId, title, jd_url, salary_range, work_experience, education, create_time
- `interview_record` — interviewId, userId, jdId, resumeId, status, start_time, end_time
