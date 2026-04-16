package com.voidxlab.simuview.common.constants;

public class PromptConstants {
    public static final String RESUME_PARSE_PROMPT = """
            请帮我解析以下简历内容，将其转换为结构化的JSON格式：

            简历内容：{%s}
            
            请按照以下JSON格式输出，包含所有能识别的信息：
            {
                "name": "姓名",
                "email": "邮箱",
                "phone": "电话",
                "education": [
                    {
                        "school": "学校名称",
                        "degree": "学历",
                        "major": "专业",
                        "startDate": "开始日期",
                        "endDate": "结束日期"
                    }
                ],
                "experience": [
                    {
                        "company": "公司名称",
                        "position": "职位",
                        "startDate": "开始日期",
                        "endDate": "结束日期",
                        "description": "工作描述"
                    }
                ],
                "skills": ["技能1", "技能2", "技能3"],
                "projects": [
                    {
                        "name": "项目名称",
                        "role": "角色",
                        "description": "项目描述",
                        "techStack": ["技术栈1", "技术栈2"]
                    }
                ]
            }

            注意：
            1. 如果某字段无法识别，返回空字符串或空数组
            2. 日期格式统一为YYYY-MM-DD或YYYY年MM月
            3. 只返回JSON字符串，不要有其他多余内容
            """;

    public static final String EMPTY_RESUME_JSON = """
            {
                "name": "",
                "email": "",
                "phone": "",
                "education": [],
                "experience": [],
                "skills": [],
                "projects": []
            }
            """;

    public static String buildResumeParsePrompt(String resumeContent) {
        return RESUME_PARSE_PROMPT.formatted(resumeContent);
    }
}
