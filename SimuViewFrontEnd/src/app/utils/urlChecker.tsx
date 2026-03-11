// urlChecker.tsx

/**
 * 招聘网站域名列表
 */
const JOB_SITE_DOMAINS = [
  '51job.com',
  'lagou.com',
  'zhaopin.com',
  'chinahr.com',
  'liepin.com',
  'bosszhipin.com',
  'dajie.com',
  'yingjiesheng.com',
  'shixi.com',
  'haitou.cc',
  'mokahr.com',
  'kanzhun.com',
  'qiancheng.com',
  'cjol.com',
  'job36.com',
  'jobcn.com',
  'job1001.com',
  'job9151.com',
  'jobui.com',
  'comeet.com',
  'greenhouse.io',
  'lever.co',
  'smartrecruiters.com',
  'workday.com',
  'icims.com',
  'taleo.net',
  'successfactors.com',
  'jobvite.com',
  'ultipro.com',
  'peoplefluent.com',
  'silkroad.com',
  'kenexa.com',
  'brassring.com',
  'avature.net',
  'adp.com',
  'oracle.com/cloud/applications/hcm', // Oracle HCM
  'sap.com/products/successfactors',    // SAP SuccessFactors
  'linkedin.com/jobs',                  // LinkedIn 职位页面
  'indeed.com',
  'glassdoor.com',
  'monster.com',
  'careerbuilder.com',
  'dice.com',
  'simplyhired.com',
  'ziprecruiter.com',
  'snagajob.com',
  'trovit.com',
  'adzuna.com',
  'totaljobs.com',
  'reed.co.uk',
  'jobs.ac.uk',
  'guardianjobs.com',
  'timeshighereducation.com/unijobs',
  'eurojobs.com',
  'eures.europa.eu',
  'xing.com/jobs',
  'stepstone.de',
  'monster.de',
  'indeed.de',
  'jobs.ch',
  'jobup.ch',
  'jobscout24.ch',
  'jobagent.ch',
  'jobmarket.ch',
  'jobwinner.ch',
  'jobsuchmaschine.ch',
  'jobsuchmaschine.de',
  'jobsuchmaschine.at',
  'karriere.at',
  'derstandard.at/jobs',
  'jobs.at',
  'jobwohnen.at',
  'jobwohnen.de',
  'jobwohnen.ch',
  'monster.at',
  'indeed.at',
  'jobscout24.de',
  'jobscout24.at',
  'monster.ch',
  'indeed.ch',
  'jobscout24.ch',
  'jobup.ch',
  'jobagent.ch',
  'jobmarket.ch',
  'jobwinner.ch',
  'jobsuchmaschine.ch',
  'jobsuchmaschine.de',
  'jobsuchmaschine.at',
  'karriere.at',
  'derstandard.at/jobs',
  'jobs.at',
  'jobwohnen.at',
  'jobwohnen.de',
  'jobwohnen.ch',
  'monster.at',
  'indeed.at',
  'jobscout24.de',
  'jobscout24.at',
  'monster.ch',
  'indeed.ch',
  'jobscout24.ch',
  'seek.com.au',
  'seek.co.nz',
  'jobsdb.com',
  'jobstreet.com',
  'myjobstreet.com',
  'jobrapido.com',
  'neuvoo.com',
  'trabajo.org',
  'jobisjob.com',
  'jobijoba.com',
  'jobijoba.fr',
  'jobijoba.de',
  'jobijoba.es',
  'jobijoba.it',
  'jobijoba.nl',
  'jobijoba.be',
  'jobijoba.ch',
  'jobijoba.at',
  'jobijoba.uk',
  'jobijoba.com',
  'jobijoba.ca',
  'jobijoba.au',
  'jobijoba.nz',
  'jobijoba.ie',
  'jobijoba.za',
  'jobijoba.br',
  'jobijoba.mx',
  'jobijoba.ar',
  'jobijoba.cl',
  'jobijoba.co',
  'jobijoba.pe',
  'jobijoba.ec',
  'jobijoba.bo',
  'jobijoba.py',
  'jobijoba.uy',
  'jobijoba.ve',
  'jobijoba.cr',
  'jobijoba.pa',
  'jobijoba.do',
  'jobijoba.gt',
  'jobijoba.hn',
  'jobijoba.ni',
  'jobijoba.sv',
  'jobijoba.cu',
  'jobijoba.pr'
];

/**
 * 判断URL是否为招聘网站
 * @param url - 要检查的URL字符串
 * @returns 如果是招聘网站返回true，否则返回false
 */
export const isJobSiteUrl = (url: string): boolean => {
  try {
    // 处理无效URL
    if (!url || typeof url !== 'string') {
      return false;
    }

    // 如果URL没有协议，添加一个临时协议以便解析
    let urlToCheck = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToCheck = 'http://' + url;
    }

    // 解析URL
    const urlObj = new URL(urlToCheck);
    const hostname = urlObj.hostname.replace(/^www\./, ''); // 移除www前缀
    const fullUrl = urlObj.href.toLowerCase();

    // 检查域名是否在招聘网站列表中
    return JOB_SITE_DOMAINS.some(domain => {
      // 检查是否包含特定路径的域名
      if (domain.includes('/')) {
        return fullUrl.includes(domain);
      }
      // 检查域名匹配（包括子域名）
      return hostname === domain || hostname.endsWith('.' + domain);
    });

  } catch (error) {
    // URL解析失败
    console.warn('Invalid URL:', url);
    return false;
  }
};

/**
 * 判断URL是否为招聘网站的简化版本
 * @param url - 要检查的URL字符串
 * @returns 如果是招聘网站返回true，否则返回false
 */
export const isJobSiteUrlSimple = (url: string): boolean => {
  if (!url) return false;
  
  const urlLower = url.toLowerCase();
  return JOB_SITE_DOMAINS.some(domain => 
    urlLower.includes(domain.replace(/^www\./, ''))
  );
};

// 使用示例
/*
import { isJobSiteUrl } from './urlChecker';

console.log(isJobSiteUrl('https://www.lagou.com/jobs/123.html')); // true
console.log(isJobSiteUrl('https://www.baidu.com')); // false
console.log(isJobSiteUrl('51job.com')); // true (会自动添加协议)
console.log(isJobSiteUrl('https://company.zhaopin.com/company-name')); // true
console.log(isJobSiteUrl('invalid-url')); // false
*/