import {configFromEnv,createAppServer} from './backend/http.mjs';
try{process.loadEnvFile('.env')}catch(e){if(e.code!=='ENOENT')throw e}
const config=configFromEnv();
const server=createAppServer(config);
server.listen(config.port,config.host,()=>console.log('食衡 http://'+config.host+':'+config.port+' · 外部调用'+(config.live?'已启用':'已关闭')));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),5000).unref()});
