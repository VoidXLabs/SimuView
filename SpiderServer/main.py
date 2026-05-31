import urllib.request
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class CrawlRequest(BaseModel):
    url: str

def clean_text(text):
    if not text: return "未找到"
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    return ' '.join(text.split()).strip()

def analyse(html_content):
    results = {}
    # 提取逻辑
    job_title_match = re.search(r'<p class="name"[^>]*>(.*?)</p>', html_content)
    results['jobTitle'] = clean_text(job_title_match.group(1)) if job_title_match else "未找到"

    salary_match = re.search(r'<div class="card-salary"[^>]*>(.*?)</div>', html_content, re.DOTALL)
    results['salary'] = clean_text(salary_match.group(1)) if salary_match else "未找到"

    location_match = re.search(r'<div class="city"[^>]*>.*?<img[^>]*>\s*([^<]+)', html_content, re.DOTALL)
    results['location'] = clean_text(location_match.group(1)) if location_match else "未找到"

    degree_match = re.search(r'<div class="degeree"[^>]*>.*?<img[^>]*>\s*([^<]+)', html_content, re.DOTALL)
    results['requirement'] = clean_text(degree_match.group(1)) if degree_match else "未找到"

    detail_match = re.search(r'<div class="title"[^>]*>职位详情</div>\s*<div class="content"[^>]*><span[^>]*>(.*?)</span></div>', html_content, re.DOTALL)
    results['description'] = clean_text(detail_match.group(1)) if detail_match else "未找到"

    company_match = re.search(r'<div class="com_name"[^>]*>(.*?)</div>', html_content, re.DOTALL)
    results['company'] = clean_text(company_match.group(1)) if company_match else "未找到"

    return results

def get_html(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            charset = response.headers.get_content_charset() or 'utf-8'
            return response.read().decode(charset)
    except Exception:
        return None

@app.post("/api/crawl")
async def crawl_endpoint(request: CrawlRequest):
    if not request.url.startswith("https://m.sh.bendibao.com/job/jobdetail/"):
        raise HTTPException(status_code=400, detail="Unsupported URL. Only https://m.sh.bendibao.com/job/jobdetail/ is allowed.")
    
    html = get_html(request.url)
    if not html:
        raise HTTPException(status_code=500, detail="Failed to fetch page")
    
    data = analyse(html)
    return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
