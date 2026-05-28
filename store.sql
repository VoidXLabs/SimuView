-- 1. 用户信息表
-- 系统需要管理求职者和管理员。
CREATE TABLE `users` (
  `user_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `role` VARCHAR(50) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `email` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_username` (`username`) -- 根据 UNI 标志生成唯一索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `resume_information` (
  `resume_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT(20) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`resume_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
ALTER TABLE resume_information ADD COLUMN file_name VARCHAR(255) AFTER file_url;

CREATE TABLE `jd_information` (
  `jd_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `jd_url` VARCHAR(500) DEFAULT NULL,
  `jd_content` TEXT NOT NULL,
  `salary_range` VARCHAR(100) DEFAULT NULL,
  `work_experience` VARCHAR(100) DEFAULT NULL,
  `education` VARCHAR(100) DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`jd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `interview_record` (
  `interview_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT(20) NOT NULL,
  `jd_id` BIGINT(20) NOT NULL,
  `resume_id` BIGINT(20) NOT NULL,
  `status` TINYINT(4) NOT NULL DEFAULT 0,
  `start_time` DATETIME DEFAULT NULL,
  `total_questions` INT(11) NOT NULL DEFAULT 5,
  `end_time` DATETIME DEFAULT NULL,
  `style` TINYINT(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`interview_id`),
  KEY `idx_user_id` (`user_id`),     -- 根据 MUL 标志生成普通索引
  KEY `idx_jd_id` (`jd_id`),         -- 根据 MUL 标志生成普通索引
  KEY `idx_resume_id` (`resume_id`)  -- 根据 MUL 标志生成普通索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `interview_question` (
  `question_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT(20) NOT NULL,
  `question_text` TEXT NOT NULL,
  `question_type` VARCHAR(20) NOT NULL DEFAULT 'MAIN',
  `parent_question_id` BIGINT(20) DEFAULT NULL,
  `seq_number` INT(11) NOT NULL,
  `user_answer` TEXT DEFAULT NULL,
  `score` INT(11) DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `answered_time` DATETIME DEFAULT NULL,
  PRIMARY KEY (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `interview_evaluation` (
  `report_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT(20) NOT NULL,
  `report_json` TEXT NOT NULL,
  `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `idx_session_id` (`session_id`) -- 根据 MUL 标志生成普通索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
