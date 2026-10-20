function go(v){dro(0);if(v==='admin'&&!authed){gopen();return}CV=v;
['shop','admin'].forEach(function(k){$('v_'+k).classList.toggle('on',k===v)});window.scrollTo(0,0);rAll()}
function lout(){authed=false;try{sessionStorage.removeItem('sh_auth')}catch(e){}CV='shop';gopen()}
function logout(){lout()}

/* site lock (PIN + password) */
var HC='b341cedd3cc55ab3463b63f93757ac13d88d4bc3628d1fe4a59f94e580509dbc',SALT='neko-api-key|v1',ITER=150000,pinv='';
function kdf(s){if(!window.crypto||!crypto.subtle)return Promise.resolve('');var e=new TextEncoder();return crypto.subtle.importKey('raw',e.encode(s),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:e.encode(SALT),iterations:ITER,hash:'SHA-256'},k,256)}).then(function(d){return Array.from(new Uint8Array(d)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')})}
function lkL(){try{return +localStorage.getItem('nk_lt')||0}catch(e){return 0}}
function gopen(){document.body.classList.add('lock');pinv='';$('g1').style.display='block';$('g2').style.display='none';$('pin').value='';$('cod').value='';$('ge').textContent='';$('gate').classList.add('open');setTimeout(function(){$('pin').focus()},50)}
function unlock(){authed=true;try{sessionStorage.setItem('sh_auth','1');localStorage.removeItem('nk_f');localStorage.removeItem('nk_lt')}catch(e){}pinv='';$('gate').classList.remove('open');document.body.classList.remove('lock');go('shop')}
function gs(n){var e=$('ge'),w=lkL()-Date.now();if(w>0){setm(e,'Too many attempts. Try again in '+Math.ceil(w/1000)+'s','var(--bad)');return}
if(n===1){var v=$('pin').value.trim();if(!v){setm(e,'Enter your PIN','var(--bad)');return}pinv=v;e.textContent='';$('g1').style.display='none';$('g2').style.display='block';$('cod').focus();return}
var pw=$('cod').value.trim().toLowerCase();if(!pw){setm(e,'Enter your password','var(--bad)');return}
setm(e,'Checking...','var(--mut)');
kdf(pinv+'|'+pw).then(function(h){if(h&&h===HC){unlock();return}
var f=0;try{f=(+localStorage.getItem('nk_f')||0)+1;localStorage.setItem('nk_f',f)}catch(x){}
if(f%5===0){var s=Math.min(30*Math.pow(2,f/5-1),3600);try{localStorage.setItem('nk_lt',Date.now()+s*1000)}catch(x){}setm(e,'Too many attempts. Locked for '+Math.round(s)+'s','var(--bad)')}else setm(e,'Wrong PIN or password','var(--bad)');
$('cod').value='';pinv='';setTimeout(function(){$('g1').style.display='block';$('g2').style.display='none';$('pin').value='';$('pin').focus()},900)})}
$('pin').onkeydown=function(e){if(e.key==='Enter')gs(1)};
$('cod').onkeydown=function(e){if(e.key==='Enter')gs(2)};

/* project */
function mkproj(){if(DB.proj){msg('cmsg','Only one project is allowed','var(--bad)');return}var i=$('jn'),n=i.value.trim();if(!n){msg('cmsg','Enter a project name','var(--bad)');return}
DB.proj={id:rs(8,'abcdefghijklmnopqrstuvwxyz0123456789'),n:n,av:'',st:'active',keys:[]};i.value='';dbS();rAll();msg('cmsg','Project created','var(--ok)')}
function psave(){var p=DB.proj;if(!p)return;p.n=$('pn').value.trim().slice(0,30)||p.n;var f=$('pf').files[0];
if(!f){dbS();rAll();msg('cmsg','Saved','var(--ok)');return}
var r=new FileReader();r.onload=function(){var i=new Image();i.onload=function(){var c=document.createElement('canvas');c.width=c.height=160;var s=Math.min(i.width,i.height);c.getContext('2d').drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,160,160);p.av=c.toDataURL('image/jpeg',.85);dbS();rAll();msg('cmsg','Saved','var(--ok)')};i.src=r.result};r.readAsDataURL(f)}
function tgl(){on=!on;var b=$('tg');b.classList.toggle('on',on);b.setAttribute('aria-checked',on);$('gm').textContent=''}
function gen(){var g=$('gm'),p=P();if(!p)return;if(p.st!=='active'){setm(g,'Project is suspended. Reactivate it first.','var(--bad)');return}
if(!on){setm(g,'Generation is off. Flip the switch first.','var(--bad)');return}
