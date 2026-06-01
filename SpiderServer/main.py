import urllib.request
import urllib.parse
import re
import traceback
from fastapi import FastAPI, HTTPException, Query, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI()

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CrawlRequest(BaseModel):
    url: str

# --- 核心处理函数 ---

def clean_text(text):
    if not text: return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    return ' '.join(text.split()).strip()

def get_html(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read().decode(response.headers.get_content_charset() or 'utf-8')
    except Exception as e:
        print(f"FETCH_ERROR: {e}")
        return None

async def list_jobs_logic(keywords: str):
    print(f"LOGIC_EXEC: list_jobs | kw: {keywords}")
    base_url = "https://m.sh.bendibao.com/job/search/"
    url = f"{base_url}?keywords={urllib.parse.quote(keywords)}" if keywords else base_url
    html = get_html(url)
    if not html: raise HTTPException(status_code=500, detail="Fetch fail")
    
    jobs = []
    pattern = re.compile(r'<div class="message-wrap"[^>]*>.*?<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.DOTALL)
    matches = pattern.findall(html)
    for href, content in matches:
        try:
            job = {'detailUrl': "https://m.sh.bendibao.com" + href if href.startswith("/") else href}
            title_match = re.search(r'<div class="card-title"[^>]*>(.*?)</div>', content, re.DOTALL)
            job['title'] = clean_text(title_match.group(1)) if title_match else "未知岗位"
            salary_match = re.search(r'<div class="card-salary"[^>]*>(.*?)</div>', content, re.DOTALL)
            job['salary'] = clean_text(salary_match.group(1)) if salary_match else "面议"
            needs = re.findall(r'<div class="card-need-son"[^>]*>(.*?)</div>', content, re.DOTALL)
            job['location'] = clean_text(needs[0]) if len(needs) > 0 else "上海"
            job['education'] = clean_text(needs[1]) if len(needs) > 1 else "不限"
            job['experience'] = clean_text(needs[2]) if len(needs) > 2 else "不限"
            company_match = re.search(r'<div class="comInfo"[^>]*>.*?<div[^>]*>(.*?)</div>', content, re.DOTALL)
            job['company'] = clean_text(company_match.group(1)) if company_match else "未知公司"
            jobs.append(job)
        except: continue
    return {"success": True, "data": jobs}

async def job_detail_logic(url: str):
    print(f"LOGIC_EXEC: job_detail | url: {url}")
    html = get_html(url)
    if not html: raise HTTPException(status_code=500, detail="Fetch fail")
    detail_match = re.search(r'<div class="content"[^>]*>.*?<span[^>]*>(.*?)</span>', html, re.DOTALL)
    description = clean_text(detail_match.group(1)) if detail_match else "未找到职位详情"
    return {"success": True, "data": {"description": description}}

# --- 万能匹配路由 ---

@app.api_route("/{path_name:path}", methods=["GET", "POST", "OPTIONS"])
async def universal_router(request: Request, path_name: str):
    # 路径规范化：去掉前后的斜杠，统一处理
    clean_path = path_name.strip("/")
    print(f"UNIVERSAL_ROUTER: Received path='{path_name}' | Cleaned='{clean_path}'")

    if clean_path == "" or "jobs" in clean_path:
        # 处理搜索列表
        kw = request.query_params.get("keywords", "")
        return await list_jobs_logic(kw)
    
    if "job-detail" in clean_path:
        # 处理详情
        if request.method == "POST":
            try:
                body = await request.json()
                return await job_detail_logic(body.get("url", ""))
            except:
                raise HTTPException(status_code=400, detail="Invalid JSON body")
        else:
            return {"error": "Method Not Allowed", "hint": "Use POST for job-detail"}

    return {
        "error": "Route Not Found",
        "received": path_name,
        "hint": "Try /jobs or /job-detail"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
