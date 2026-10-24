import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {timingSafeEqual,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {analyzePhoto,searchFoods,ServiceError} from './recognition.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const assets=new Set(['/','/index.html','/src/app.js','/src/style.css','/src/nutrition.js','/src/data.js','/src/dishes.js','/src/detail-ui.js','/src/portions.js','/src/camera.js','/src/storage.js','/manifest.webmanifest','/icon.svg','/sw.js']);
export function configFromEnv(env=process.env){
 const host=env.HOST||'127.0.0.1',publicHost=!['127.0.0.1','localhost','::1'].includes(host);
 if(publicHost&&(!env.APP_ORIGIN?.startsWith('https://')||!env.APP_PASSWORD||env.APP_PASSWORD.length<16))throw Error('非本机监听必须配置 HTTPS APP_ORIGIN 与至少16位 APP_PASSWORD');
 return {host,port:Number(env.PORT||4173),origin:env.APP_ORIGIN||null,password:env.APP_PASSWORD||'',openaiKey:env.VISION_PROTOCOL==='chat'?env.VISION_API_KEY:env.OPENAI_API_KEY,fdcKey:env.FDC_API_KEY,model:env.VISION_MODEL||env.OPENAI_MODEL||'gpt-4.1-mini',protocol:env.VISION_PROTOCOL||'responses',endpoint:env.VISION_ENDPOINT||'https://api.openai.com/v1/responses',provider:env.VISION_PROVIDER||'OpenAI',live:env.LIVE_CALLS_ENABLED==='true'};
}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data))}
async function body(req){
 if(!String(req.headers['content-type']).startsWith('application/json'))throw new ServiceError('请求必须使用 JSON',415,'INVALID_CONTENT_TYPE');
 let size=0;const chunks=[];
 for await(const chunk of req){size+=chunk.length;if(size>8_500_000)throw new ServiceError('请求图片过大',413,'IMAGE_TOO_LARGE');chunks.push(chunk)}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw new ServiceError('JSON 格式无效',400,'INVALID_JSON')}
}
function authenticated(req,password){
 if(!password)return true;
 const actual=req.headers.authorization||'',expected='Basic '+Buffer.from('shiheng:'+password).toString('base64');
 const hash=s=>createHash('sha256').update(s).digest();
 return timingSafeEqual(hash(actual),hash(expected));
}
export function createAppServer(config={},dependencies={}){
 let active=0;const timestamps=[];
 const analyze=dependencies.analyze||analyzePhoto,lookup=dependencies.lookup||searchFoods;
 return http.createServer({requestTimeout:30000,headersTimeout:15000},async(req,res)=>{
  const id=crypto.randomUUID();
  res.setHeader('X-Request-ID',id);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
  res.setHeader('Permissions-Policy','camera=(self), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  const address=req.headers.host||'';
  const localHost=/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(address);
  let origin;try{origin=config.origin?new URL(config.origin).origin:'http://'+address}catch{return json(res,400,{error:'服务地址配置无效'})}
  if(config.origin?address!==new URL(config.origin).host:!localHost)return json(res,403,{error:'不允许的主机地址'});
  if(req.headers['sec-fetch-site']==='cross-site'||(req.headers.origin&&req.headers.origin!==origin))return json(res,403,{error:'不允许跨站请求'});
  if(!authenticated(req,config.password)){res.setHeader('WWW-Authenticate','Basic realm="Shiheng", charset="UTF-8"');return json(res,401,{error:'请使用部署访问密码登录（用户名 shiheng）'})}
  let url;try{url=new URL(req.url,origin)}catch{return json(res,400,{error:'无效 URL'})}
  const path=url.pathname;
  try{
   if(path==='/api/status'&&req.method==='GET')return json(res,200,{vision:!!config.openaiKey,foods:!!config.fdcKey,live:!!config.live,ready:!!(config.live&&config.openaiKey&&config.fdcKey),provider:config.provider||'OpenAI',model:config.model||'',testOnly:!!dependencies.testOnly});
   if(path==='/api/health'&&req.method==='GET')return json(res,200,{status:'ok',version:'0.4.0'});
   if((path==='/api/analyze'&&req.method==='POST')||(path==='/api/foods'&&req.method==='GET')){
    if(!config.live)throw new ServiceError('真实外部调用已关闭。配置完成后由服务端开启 LIVE_CALLS_ENABLED',503,'LIVE_DISABLED');
    const now=Date.now();while(timestamps.length&&timestamps[0]<now-3600000)timestamps.shift();
    if(active>=2||timestamps.length>=30)throw new ServiceError('请求较多，请稍后重试',429,'RATE_LIMIT');
    active++;timestamps.push(now);
    const controller=new AbortController();res.on('close',()=>{if(!res.writableEnded)controller.abort()});
    try{
     const settings={...config,signal:controller.signal,fetcher:dependencies.fetcher};
     const result=path==='/api/analyze'?await analyze(await body(req),settings):{foods:await lookup(url.searchParams.get('q'),settings)};
     if(!res.destroyed)json(res,200,{...result,testOnly:!!dependencies.testOnly});
    }finally{active--}
    return;
   }
   if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'不支持的请求方法'});
   if(!assets.has(path))return json(res,404,{error:'未找到资源'});
   const file=path==='/'?'index.html':path.slice(1),data=await readFile(root+file);
   res.setHeader('Content-Type',file.endsWith('.webmanifest')?'application/manifest+json':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');
   res.end(req.method==='HEAD'?undefined:data);
  }catch(e){if(!res.destroyed)json(res,e instanceof ServiceError?e.status:500,{error:e instanceof ServiceError?e.message:'服务器暂时无法完成请求',code:e.code||'INTERNAL_ERROR',requestId:id})}
 });
}
