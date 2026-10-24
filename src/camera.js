const MAX_SIZE=20*1024*1024;
export function openCamera({modal,onRecognized}){
 let stream=null,prepared=null,controller=null,generation=0,closed=false;
 const $=s=>document.querySelector(s);
 modal('<span class="eyebrow">FROM CAMERA TO YOUR PLATE</span><h2 style="margin-top:12px">拍一拍，自动记下这一餐。</h2><p class="sub" id="camera-service">正在检查识别服务…</p><div class="capture-view"><video id="camera-video" autoplay playsinline muted hidden></video><img id="camera-preview" alt="待识别的食物照片" hidden><div id="camera-empty">◎<p>让整份食物入镜，光线清晰一点</p></div></div><div class="row capture-actions"><button class="btn light" id="start-camera">打开相机</button><button class="btn" id="take-photo" hidden>拍下这一餐</button><label class="btn outline" style="margin:0" for="photo-file">选择照片</label><input id="photo-file" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden></div><p class="sub" id="capture-info">原图仅本地处理；识别前将压缩并去除图片元数据。</p><label class="consent"><input id="photo-consent" type="checkbox">我同意将这张照片发送给所选视觉服务，并将食材名称发送给 USDA 查询营养；身体指标不会上传。</label><p class="error" id="camera-error" role="alert"></p><button class="btn full" id="recognize-photo" disabled>识别并自动填写</button><button class="link full" id="cancel-recognition" hidden style="margin-top:12px">取消识别</button><div id="camera-progress" class="recognition-progress" hidden aria-live="polite">正在识别菜品并查询食材营养，请稍候…</div><p class="sub">结果包含估算份量和待核对的食品匹配。隐藏的油、盐、糖及过敏原不能由照片可靠确定。</p>');
 const dialog=$('#modal');
 function stopCamera(){stream?.getTracks().forEach(t=>t.stop());stream=null}
 function cleanup(){closed=true;generation++;stopCamera();controller?.abort();document.removeEventListener('visibilitychange',onVisibility)}
 function onVisibility(){if(document.hidden){stopCamera();const video=$('#camera-video');if(video)video.hidden=true;const take=$('#take-photo');if(take)take.hidden=true;}}
 dialog.addEventListener('close',cleanup,{once:true});document.addEventListener('visibilitychange',onVisibility);
 let ready=false,busy=false;
 function refresh(){if(closed)return;$('#recognize-photo').disabled=!ready||!prepared||!$('#photo-consent').checked||busy;$('#start-camera').disabled=busy;$('#photo-file').disabled=busy;}
 fetch('/api/status').then(r=>r.json()).then(s=>{if(closed)return;ready=s.ready;$('#photo-consent').parentElement.lastChild.textContent='我同意将这张照片发送给 '+s.provider+'，并将食材名称发送给 USDA 查询营养；身体指标不会上传。';$('#camera-service').textContent=(s.testOnly?'接口测试模式 · 使用固定测试结果，并非真实识别。':s.ready?s.provider+' · 识别服务已配置（尚需真实联调验证）':!s.live?'真实外部调用已关闭；可先测试相机和选图。':'尚未配置模型或食品数据库凭据。');refresh()}).catch(()=>{if(!closed)$('#camera-service').textContent='无法连接应用服务，请检查网络。'});
 $('#photo-consent').onchange=refresh;
 async function prepare(blob){
  if(closed)return;
  const current=++generation;$('#camera-error').textContent='';prepared=null;refresh();
  if(blob.size>MAX_SIZE)throw Error('图片不能超过 20MB');
  if(!['image/jpeg','image/png','image/webp'].includes(blob.type))throw Error('请选择 JPEG、PNG 或 WebP；HEIC 请先转为 JPEG');
  let bitmap;
  try{
   bitmap=await createImageBitmap(blob);
   if(bitmap.width*bitmap.height>60_000_000)throw Error('图片分辨率过大，请选择较小的图片');
   const ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
   const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const data=canvas.toDataURL('image/jpeg',.85);
   if(data.length>8_000_000)throw Error('压缩后图片仍过大，请缩小图片');
   if(closed||current!==generation)return;
   prepared=data;stopCamera();$('#camera-video').hidden=true;$('#take-photo').hidden=true;$('#camera-empty').hidden=true;
   $('#camera-preview').src=data;$('#camera-preview').hidden=false;
   $('#capture-info').textContent='已准备照片 · '+canvas.width+' × '+canvas.height+' · '+Math.round(data.length*.75/1024)+' KB；尚未上传。';
  }finally{bitmap?.close();refresh()}
 }
 $('#photo-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{await prepare(f)}catch(err){if(!closed)$('#camera-error').textContent=err.message}};
 $('#start-camera').onclick=async()=>{
  $('#camera-error').textContent='';
  if(!navigator.mediaDevices?.getUserMedia){$('#camera-error').textContent='当前浏览器或地址不支持相机，请通过 HTTPS 打开，或使用选择照片。';return}
  stopCamera();prepared=null;refresh();const attempt=++generation;$('#start-camera').disabled=true;try{const result=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1600},height:{ideal:1200}},audio:false});if(closed||attempt!==generation||document.hidden){result.getTracks().forEach(t=>t.stop());return}stream=result;$('#camera-video').srcObject=stream;$('#camera-video').hidden=false;$('#camera-preview').hidden=true;$('#camera-empty').hidden=true;$('#take-photo').hidden=false;}catch(err){if(!closed)$('#camera-error').textContent=err.name==='NotAllowedError'?'相机权限未允许，可改为选择照片。':'无法打开相机，请确认摄像头未被占用。'}finally{if(!closed)refresh()}
 };
 $('#take-photo').onclick=async()=>{const video=$('#camera-video');if(!video.videoWidth){$('#camera-error').textContent='相机还在准备，请稍后拍摄';return}const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext('2d').drawImage(video,0,0);canvas.toBlob(async blob=>{try{if(!blob)throw Error('拍摄失败，请重试');await prepare(blob)}catch(err){if(!closed)$('#camera-error').textContent=err.message}},'image/jpeg',.9)};
 $('#cancel-recognition').onclick=()=>controller?.abort();
 $('#recognize-photo').onclick=async()=>{
  if(!prepared||busy||!ready||!$('#photo-consent').checked)return;
  busy=true;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),150000);
  $('#camera-error').textContent='';$('#camera-progress').hidden=false;$('#cancel-recognition').hidden=false;$('#recognize-photo').textContent='正在识别…';refresh();
  try{
   const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:prepared,consent:true}),signal:controller.signal});
   const result=await r.json();if(closed)return;
   if(!r.ok)throw Error(result.error||'识别失败，请重试');
   if(result.status==='not_food')throw Error('这张照片中没有识别到食物，请重新拍摄');
   if(result.status!=='food'||!result.dish)throw Error('暂时无法可靠判断这道菜，请换个角度拍摄');
   cleanup();dialog.close();onRecognized(result.dish,!!result.testOnly);
  }catch(err){if(!closed)$('#camera-error').textContent=err.name==='AbortError'?'识别已取消或超时，可以重试。':err.message}
  finally{clearTimeout(timeout);busy=false;if(!closed){$('#camera-progress').hidden=true;$('#cancel-recognition').hidden=true;$('#recognize-photo').textContent='重新识别并填写';refresh()}}
 };
}
