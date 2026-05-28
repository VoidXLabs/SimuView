-- 1. 用户信息表
-- 系统需要管理求职者和管理员。
CREATE TABLE `users` (
  `user_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户唯一标识', /* */
  `role` VARCHAR(50) NOT NULL COMMENT '角色 (如：candidate 候选人, admin 管理员)', /* */
  `username` VARCHAR(100) NOT NULL COMMENT '用户名/手机号', /* */
  `password_hash` VARCHAR(255) NOT NULL COMMENT '加密密码', /* */
  `email` VARCHAR(255) NOT NULL COMMENT '邮箱', /* */
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间' /* */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';
ALTER TABLE users ADD UNIQUE (username);

-- 2. 岗位信息表
-- 增加结构化字段，方便 AI 提取重点进行提问。
CREATE TABLE `jd_information` (
  `jd_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '岗位 ID', /* */
  `title` VARCHAR(255) NOT NULL COMMENT '岗位名称 (例如：Java高级工程师)', /* */
  `jd_url` VARCHAR(500) DEFAULT NULL COMMENT '原始链接 (可选)', /* */
  `jd_content` TEXT NOT NULL COMMENT '岗位详细描述文本', /* */
  `salary_range` VARCHAR(100) DEFAULT NULL COMMENT '薪资范围', /* */
  `work_experience` VARCHAR(100) DEFAULT NULL COMMENT '要求工作经验', /* */
  `education` VARCHAR(100) DEFAULT NULL COMMENT '学历要求', /* */
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' /* */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位信息表';

-- 3. 简历信息表
-- 增加结构化解析字段，作为 AI 提问的背景上下文。
CREATE TABLE `resume_information` (
  `resume_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '简历 ID', /* */
  `user_id` BIGINT NOT NULL COMMENT '候选人 ID', /* */
  `file_url` VARCHAR(500) NOT NULL COMMENT '简历源文件存储路径 (PDF/Word)', /* */
  `file_name` VARCHAR(64) NOT NULL COMMENT '简历名', /* */
  `content` LONGTEXT DEFAULT NULL COMMENT '简历结构化内容 (存 JSON，包含教育经历、工作经历等)', /* */
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间', /* */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='简历信息表';

-- 4. 面试记录表
-- 控制整场面试的生命周期。
CREATE TABLE `interview_record` (
  `interview_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '面试记录 ID', /* */
  `user_id` BIGINT NOT NULL COMMENT '候选人 ID', /* */
  `jd_id` BIGINT NOT NULL COMMENT '关联的岗位 ID', /* */
  `resume_id` BIGINT NOT NULL COMMENT '关联的简历 ID', /* */
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '面试状态 (0-待开始, 1-进行中, 2-已完成, 3-已出报告)', /* */
  style tinyint default 0 not null comment '面试风格 0-温和，1-正常，2-压力',
  `start_time` DATETIME DEFAULT NULL COMMENT '面试开始时间', /* */
  `total_questions` INT NOT NULL DEFAULT 5 COMMENT '总问题数',
  `end_time` DATETIME DEFAULT NULL COMMENT '面试结束时间', /* */
  CONSTRAINT `fk_record_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_record_jd` FOREIGN KEY (`jd_id`) REFERENCES `jd_information` (`jd_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_record_resume` FOREIGN KEY (`resume_id`) REFERENCES `resume_information` (`resume_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='面试记录表';

-- 5. 面试对话流水表
-- 由于是大模型驱动，必须有一张表专门记录一来一回的对话上下文，用于后续追问和最终评分。
CREATE TABLE `interview_dialogue` (
  `dialogue_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '对话记录 ID', /* */
  `interview_id` BIGINT NOT NULL COMMENT '关联的面试记录 ID', /* */
  `role` VARCHAR(50) NOT NULL COMMENT '说话角色 (ai_interviewer 或 candidate)', /* */
  `content` TEXT NOT NULL COMMENT '具体的对话文本内容', /* */
  `audio_url` VARCHAR(500) DEFAULT NULL COMMENT '对应的录音切片地址 (语音面试时使用)', /* */
  `tokens_used` INT DEFAULT 0 COMMENT '本次对话消耗的 Token 数量', /* */
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发言时间', /* */
  CONSTRAINT `fk_dialogue_interview` FOREIGN KEY (`interview_id`) REFERENCES `interview_record` (`interview_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='面试对话流水表';


-- Interview question table for AI-powered interview sessions
CREATE TABLE IF NOT EXISTS `interview_question` (
  `question_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '问题唯一标识',
  `session_id` BIGINT NOT NULL COMMENT '关联的面试记录 ID',
  `question_text` TEXT NOT NULL COMMENT '面试题目内容',
  `question_type` VARCHAR(20) NOT NULL DEFAULT 'MAIN' COMMENT '题目类型: MAIN-主问题, FOLLOW_UP-追问',
  `parent_question_id` BIGINT NULL COMMENT '追问的父问题 ID',
  `seq_number` INT NOT NULL COMMENT '题目序号（从1开始）',
  `user_answer` TEXT NULL COMMENT '用户的回答内容',
  `score` INT NULL COMMENT '评分（0-100）',
  `feedback` TEXT NULL COMMENT '评分反馈',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING-待回答, ANSWERED-已回答, SCORED-已评分',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '题目生成时间',
  `answered_time` DATETIME NULL COMMENT '回答时间',
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='面试题目表';
