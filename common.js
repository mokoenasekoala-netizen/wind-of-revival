// Shared helpers for every page (Firebase reads, sermon cards, live check, language).
(function(){
var C=window.CFG||{},ready=!!C.projectId&&!/^YOUR/.test(C.projectId);
var B="https://firestore.googleapis.com/v1/projects/"+C.projectId+"/databases/(default)/documents/";
function f(o,k){return o.fields&&o.fields[k]?(o.fields[k].stringValue||""):""}
function yt(u){var m=(u||"").match(/(?:youtu\.be\/|v=|embed\/|live\/)([\w-]{11})/);return m&&m[1]}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("on");io.unobserve(e.target)}})},{threshold:.1});
var MASK=["title","speaker","date","url","scripture","note","preview"].map(function(k){return"&mask.fieldPaths="+k}).join("");
function embed(u){
 var y=yt(u);if(y)return"https://www.youtube.com/embed/"+y;
 if(/^https?:\/\/([\w-]+\.)?(facebook\.com|fb\.watch)\//i.test(u||""))return"https://www.facebook.com/plugins/video.php?show_text=false&href="+encodeURIComponent(u);
 return"";
}
function play(e){return e+(e.indexOf("youtube")>-1?"?autoplay=1&mute=1":"&autoplay=true")}
var WR=window.WR={embed:embed,ready:ready,f:f,yt:yt,
 sermons:function(n){return fetch(B+"sermons?orderBy=date%20desc&pageSize="+n+MASK).then(function(r){return r.json()}).then(function(d){return d.documents||[]}).catch(function(){return[]})},
 id:function(o){return o.name.split("/").pop()},
 list:function(col,n,fs){return fetch(B+col+"?orderBy=date%20desc&pageSize="+n+(fs||[]).map(function(k){return"&mask.fieldPaths="+k}).join("")).then(function(r){return r.json()}).then(function(d){return d.documents||[]}).catch(function(){return[]})},
 doc:function(col,id){return fetch(B+col+"/"+encodeURIComponent(id)).then(function(r){return r.ok?r.json():null}).catch(function(){return null})},
 tile:function(o,i,open){
  var t=document.createElement("button");t.type="button";t.className="gt rv";t.style.setProperty("--i",i%4);
  var im=document.createElement("img");im.alt=f(o,"caption")||"Photo";im.loading="lazy";im.src=f(o,"thumb");t.append(im);
  if(f(o,"caption")){var s=document.createElement("span");s.textContent=f(o,"caption");t.append(s)}
  t.onclick=open;io.observe(t);return t;
 },
 quote:function(o,i,short){
  var c=document.createElement("figure");c.className="card tq rv";c.style.setProperty("--i",i%3);
  var t=f(o,"text");if(short&&t.length>260)t=t.slice(0,260).replace(/\s+\S*$/,"")+"…";
  var q=document.createElement("blockquote");q.textContent=t;
  var n=document.createElement("figcaption");n.textContent="— "+(f(o,"name")||"A member");
  c.append(q,n);io.observe(c);return c;
 },
 sermon:function(id){return fetch(B+"sermons/"+encodeURIComponent(id)).then(function(r){return r.ok?r.json():null}).catch(function(){return null})},
 live:function(){return fetch(B+"settings/live").then(function(r){return r.ok?r.json():null}).then(function(d){var on=!!(d&&d.fields&&d.fields.live&&d.fields.live.booleanValue===true);var u=on&&d.fields.url?(d.fields.url.stringValue||""):"";on=on&&!!embed(u);return{on:on,url:on?u:""}}).catch(function(){return{on:false,url:""}})},
 isLive:function(){return WR.live().then(function(x){return x.on})},
 liveSrc:function(u){var e=embed(u);return e?play(e):""},
 card:function(o,i){
  var rid=o.name.split("/").pop(),readUrl="sermon.html?id="+encodeURIComponent(rid),hasRead=!!f(o,"preview"),u=f(o,"url"),id=yt(u),c=document.createElement("div");c.className="card sv rv";c.style.setProperty("--i",i%3);c.tabIndex=0;c.setAttribute("role","button");
  var th=document.createElement("div");th.className="th";if(id)th.style.backgroundImage="url(https://i.ytimg.com/vi/"+id+"/hqdefault.jpg)";
  var bd=document.createElement("div");bd.className="bd";
  var h=document.createElement("h3");h.textContent=f(o,"title");
  var p=document.createElement("p");p.textContent=[f(o,"speaker"),f(o,"date")].filter(Boolean).join(" · ");
  var s=document.createElement("p");s.className="when";s.textContent=f(o,"scripture");
  var n=document.createElement("p");n.textContent=f(o,"note");
  bd.append(h,p,s,n);
  if(hasRead){var a=document.createElement("a");a.className="rd";a.href=readUrl;a.setAttribute("data-en","Read the sermon →");a.setAttribute("data-st","Bala thuto →");
   var st=false;try{st=localStorage.getItem("wrlang")==="st"}catch(e){}
   a.textContent=st?"Bala thuto →":"Read the sermon →";a.onclick=function(e){e.stopPropagation()};bd.append(a)}
  c.append(th,bd);
  function go(){
   var em=embed(u);
   if(em){if(th.classList.contains("pl"))return;th.textContent="";var fr=document.createElement("iframe");fr.src=em+(em.indexOf("youtube")>-1?"?autoplay=1":"&autoplay=true");fr.title=h.textContent;fr.allow="autoplay; fullscreen";fr.allowFullscreen=true;th.append(fr);th.classList.add("pl")}
   else if(/^https?:/.test(u))open(u,"_blank","noopener");
   else if(hasRead)location.href=readUrl;
  }
  c.onclick=go;c.onkeydown=function(e){if(e.key==="Enter")go()};
  io.observe(c);return c;
 },
 countdown:function(){
  var n=new Date(),t=new Date(n);t.setHours(9,0,0,0);t.setDate(n.getDate()+(7-n.getDay())%7);if(t<=n)t.setDate(t.getDate()+7);
  var s=Math.floor((t-n)/1000),v=[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];
  ["d","h","m","s"].forEach(function(k,i){var e=document.getElementById(k);if(e)e.textContent=v[i]});
 }
};
// red LIVE pill in the header, on every page
var pill=document.getElementById("livepill");
if(pill&&ready){var t=function(){WR.isLive().then(function(on){pill.hidden=!on})};t();setInterval(t,60000)}
// the pages other than the home page share this language + header code
if(document.body.hasAttribute("data-wr")){
 var lang="en";try{lang=localStorage.getItem("wrlang")||"en"}catch(e){}
 var L=document.getElementById("lang");
 var apply=function(){
  document.documentElement.lang=lang;
  document.querySelectorAll("[data-en]").forEach(function(e){e.textContent=e.getAttribute("data-"+lang)});
  document.querySelectorAll("[data-en-ph]").forEach(function(e){e.placeholder=e.getAttribute("data-"+lang+"-ph")});
  if(L)L.textContent=lang==="en"?"Sesotho":"English";
 };
 if(L)L.onclick=function(){
  var els=document.querySelectorAll("[data-en]");els.forEach(function(e){e.classList.add("sw","off")});
  setTimeout(function(){lang=lang==="en"?"st":"en";try{localStorage.setItem("wrlang",lang)}catch(e){}apply();els.forEach(function(e){e.classList.remove("off")})},250);
 };
 apply();
 var hd=document.getElementById("hd"),bar=document.getElementById("bar");
 var sc=function(){var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;hd.classList.toggle("s",y>40);bar.style.transform="scaleX("+(h>0?y/h:0)+")"};
 addEventListener("scroll",sc,{passive:true});sc();
}
})();
