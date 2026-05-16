const SESSION="qassem-session";
const defaults={
brand:{publicName:"Qassem.net",officialName:"Kasem Adra",title:"Systems Architect & Digital Operations Strategist",logoText:"Qassem.net",logoMark:"Q",logoImage:""},
hero:{eyebrow:"Qassem.net · Systems Architect",subtitle:"Architecting intelligent digital infrastructure.",description:"I design and operate secure digital systems across media infrastructure, cloud, cybersecurity, AI, data, project management and business transformation.",primaryButton:"Explore Systems",primaryLink:"#systems",secondaryButton:"Contact",secondaryLink:"#contact",chips:["Digital Operations","Cloud","Cybersecurity","AI & Data","Strategy"]},
slider:[{label:"Operating Identity",title:"From content systems to enterprise architecture.",description:"A modern personal platform built around media infrastructure, digital operations, cloud, cybersecurity, AI and business strategy.",button:"View identity",url:"#identity"}],
about:{title:"Systems thinking shaped by real operations.",paragraph1:"I am a systems-minded digital architect with hands-on experience in media operations, CMS management, digital archiving, content strategy and multi-platform publishing.",paragraph2:"My technical path expands that operational foundation into cloud architecture, cybersecurity, DevSecOps, data science, AI, project management and business administration."},
principles:[{value:"Architecture",label:"Coherent systems"},{value:"Operations",label:"Information flows"},{value:"Security",label:"Trust & resilience"},{value:"Strategy",label:"Transformation"}],
systems:[{number:"Layer 01",title:"Digital Operations",description:"CMS, content infrastructure, publishing systems, digital archives and real-time information flows."},{number:"Layer 02",title:"Infrastructure",description:"Cloud architecture, virtualization, Linux, Kubernetes, configuration management and Infrastructure as Code."},{number:"Layer 03",title:"Security",description:"Cybersecurity architecture, threat intelligence, privileged access, DevSecOps and secure delivery."}],
projects:[{symbol:"⚙️",title:"Digital Publishing System",category:"CMS",description:"Design and management of CMS workflows for large-scale content operations.",stack:"CMS · Publishing · Archiving",url:"",visible:true}],
expertise:[{symbol:"☁️",icon:"Infrastructure",title:"Cloud & Infrastructure",description:"Cloud architecture, virtualization, Linux, Kubernetes, DevOps and Infrastructure as Code foundations."},{symbol:"🛡️",icon:"Security",title:"Cybersecurity Architecture",description:"Threat intelligence, privileged access, Azure security, DevSecOps and secure delivery principles."}],
skills:[{name:"Systems Architecture",level:94},{name:"Digital Operations",level:96},{name:"Cybersecurity",level:88}],
certifications:[{symbol:"◆",value:"Harvard CS50x — Computer Science"},{symbol:"♟",value:"Google Project Management Professional Certificate"},{symbol:"◈",value:"IBM Data Science Professional Certificate"},{symbol:"🛡️",value:"CompTIA Security+ / Cloud+ / Linux+ / A+"}],
education:[{symbol:"♟",title:"MBA + Digital Marketing & Analytics",description:"Business administration, digital marketing, analytics, strategy, project management and transformation."}],
blog:[{symbol:"⌘",title:"Why Systems Thinking Matters",category:"Architecture",excerpt:"Digital work is the design of flows, responsibilities, controls and resilience.",date:"",visible:true}],
contact:{title:"Let’s build with clarity.",description:"For collaboration, consulting, architecture or strategic systems work, send me a message.",links:[{label:"Email",url:"mailto:kasemadra@gmail.com",visible:true}],social:[{label:"LinkedIn",url:"https://www.linkedin.com/in/qassem-adra/",icon:"in",visible:true},{label:"GitHub",url:"https://github.com/",icon:"⌘",visible:false},{label:"X",url:"https://x.com/",icon:"𝕏",visible:false},{label:"YouTube",url:"https://youtube.com/",icon:"▶",visible:false},{label:"Instagram",url:"https://instagram.com/",icon:"◎",visible:false}]},
seo:{title:"Qassem.net — Systems Architect",description:"Systems Architect & Digital Operations Strategist.",image:"/og-image.png"},
theme:{bg:"#0d1014",paper:"#f4efe6",ink:"#101214",accent:"#b58b61"},
maintenance:{enabled:false,title:"Under Maintenance",message:"The website is currently being improved. Please check back soon."}
};
let content=structuredClone(defaults),active="hero";
const tabList=[["brand","Brand"],["hero","Hero"],["slider","Scenes"],["about","Identity"],["principles","Principles"],["systems","Systems"],["projects","Work"],["expertise","Expertise"],["skills","Skills"],["certifications","Credentials"],["education","Education"],["blog","Writing"],["contact","Contact"],["seo","SEO"],["theme","Theme"],["maintenance","Maintenance"],["json","Raw JSON"]];
const hints={brand:"Public brand and official name.",hero:"Homepage hero.",slider:"Homepage cinematic scenes.",about:"Identity section.",principles:"Operating principles instead of vanity numbers.",systems:"Architecture layers.",projects:"Selected systems/projects.",expertise:"Expertise cards.",skills:"Capability bars.",certifications:"Credentials.",education:"Education.",blog:"Articles.",contact:"Contact section.",seo:"Metadata.",theme:"Visual identity colors.",maintenance:"Maintenance mode controls.",json:"Advanced full JSON editor."};

function merge(a,b){const o=structuredClone(a||{});for(const[k,v]of Object.entries(b||{})){o[k]=v&&typeof v==="object"&&!Array.isArray(v)?{...(o[k]||{}),...v}:v}return o}
async function doLogin(){
  const pass=password.value.trim();
  if(!pass){alert("Enter password");return}
  try{
    const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({password:pass})});
    const data=await r.json().catch(()=>({}));
    if(!r.ok||!data.ok){alert(data.error||"Login failed");return}
    if(data.token)sessionStorage.setItem("qassem-admin-token",data.token);
    sessionStorage.setItem(SESSION,"1");
    login.classList.add("hidden");app.classList.remove("hidden");await load();
  }catch(e){alert("Cannot connect to /api/admin/login. Check Worker/API deployment.")}
}
async function logout(){
  const token=sessionStorage.getItem("qassem-admin-token")||"";
  try{await fetch("/api/auth/logout",{method:"POST",credentials:"include",headers:token?{"Authorization":"Bearer "+token}:{}})}catch(e){}
  sessionStorage.removeItem(SESSION);sessionStorage.removeItem("qassem-admin-token");location.reload();
}
async function load(){
  try{
    const r=await fetch("/api/content",{cache:"no-store",credentials:"include"});
    if(r.ok)content=merge(defaults,await r.json());
    else content=structuredClone(defaults);
  }catch(e){content=structuredClone(defaults);note("API unavailable. Check /api/content.");}
  renderTabs();render();
}
async function save(){
  const token=sessionStorage.getItem("qassem-admin-token")||"";
  try{
    const r=await fetch("/api/admin/content",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json",...(token?{"Authorization":"Bearer "+token}:{})},body:JSON.stringify(content)});
    const data=await r.json().catch(()=>({}));
    if(!r.ok||!data.ok){alert(data.error||"Save failed. Check /api/admin/content.");return}
    note("Saved to server. Changes now appear for all browsers and devices.");
  }catch(e){alert("Cannot save to server. Check /api/admin/content.");}
}
function exportContent(){const b=new Blob([JSON.stringify(content,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="qassem-content.json";a.click();URL.revokeObjectURL(u)}
function note(t){notice.innerHTML=`<div class="notice">${t}</div>`;setTimeout(()=>notice.innerHTML="",3500)}
function renderTabs(){tabs.innerHTML=tabList.map(([k,l])=>`<button class="tab ${active===k?"active":""}" onclick="setActive('${k}')">${l}</button>`).join("");count.textContent=tabList.length}
function setActive(k){active=k;renderTabs();render()}
function get(p){return p.split(".").reduce((o,k)=>o?.[k],content)}
function setv(p,v){const parts=p.split(".");let o=content;parts.slice(0,-1).forEach(k=>{o[k]??={};o=o[k]});o[parts.at(-1)]=v}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function input(l,p,t="text"){return `<div class="field"><label>${l}</label><input type="${t}" value="${esc(get(p))}" oninput="setv('${p}',this.type==='number'?Number(this.value):this.value)"></div>`}
function csvInput(l,p){const value=Array.isArray(get(p))?get(p).join(", "):(get(p)||"");return `<div class="field"><label>${l}</label><input value="${esc(value)}" oninput="setv('${p}',this.value.split(',').map(x=>x.trim()).filter(Boolean))"></div>`}
function area(l,p){return `<div class="field"><label>${l}</label><textarea oninput="setv('${p}',this.value)">${esc(get(p))}</textarea></div>`}
function check(l,p){return `<div class="field"><label>${l}</label><input style="width:auto" type="checkbox" ${get(p)!==false?"checked":""} onchange="setv('${p}',this.checked)"></div>`}
function arr(key,label,fields){content[key]??=[];return `<div class="actions" style="margin-bottom:14px"><button class="btn primary" onclick="add('${key}')">Add ${label}</button></div>`+content[key].map((it,i)=>`<div class="item"><div class="item-head"><b>${label} ${i+1}</b><button class="btn danger" onclick="remove('${key}',${i})">Remove</button></div>${fields.map(f=>field(key,i,f)).join("")}</div>`).join("")}
function field(key,i,f){const [l,p,t="text"]=f,path=`${key}.${i}.${p}`;if(t==="textarea")return area(l,path);if(t==="checkbox")return check(l,path);return input(l,path,t)}
const empty={slider:{label:"Scene",title:"Title",description:"Description",button:"Learn more",url:"#contact"},principles:{value:"Principle",label:"Description"},systems:{number:"Layer",title:"Title",description:"Description"},projects:{symbol:"✦",title:"System",category:"Category",description:"Description",stack:"Stack",url:"",visible:true},expertise:{symbol:"✦",icon:"Area",title:"Title",description:"Description"},skills:{name:"Skill",level:80},certifications:{symbol:"◆",value:"Credential"},education:{symbol:"◆",title:"Education",description:"Description"},blog:{symbol:"✦",title:"Article",category:"Category",excerpt:"Excerpt",date:"",visible:true}};
function add(k){content[k].push(structuredClone(empty[k]));render()}
function remove(k,i){content[k].splice(i,1);render()}
function resetSection(){if(defaults[active]!==undefined&&confirm("Reset section?")){content[active]=structuredClone(defaults[active]);render()}}

function render(){
  title.textContent=tabList.find(x=>x[0]===active)?.[1]||active;
  hint.textContent=hints[active]||"";
  let h="";
  if(active==="brand")h=input("Public brand","brand.publicName")+input("Official name","brand.officialName")+input("Title","brand.title")+input("Logo text","brand.logoText")+input("Logo mark / letter","brand.logoMark")+input("Logo image URL","brand.logoImage");
  else if(active==="hero")h=input("Eyebrow","hero.eyebrow")+area("Headline","hero.subtitle")+area("Description","hero.description")+input("Primary button","hero.primaryButton")+input("Primary link","hero.primaryLink")+input("Secondary button","hero.secondaryButton")+input("Secondary link","hero.secondaryLink")+csvInput("Chips comma separated","hero.chips");
  else if(active==="slider")h=arr("slider","Scene",[["Label","label"],["Title","title","textarea"],["Description","description","textarea"],["Button","button"],["URL","url"]]);
  else if(active==="about")h=input("Title","about.title")+area("Paragraph 1","about.paragraph1")+area("Paragraph 2","about.paragraph2");
  else if(active==="principles")h=arr("principles","Principle",[["Value","value"],["Label","label"]]);
  else if(active==="systems")h=arr("systems","Layer",[["Number","number"],["Symbol","symbol"],["Title","title"],["Description","description","textarea"]]);
  else if(active==="projects")h=arr("projects","System",[["Symbol","symbol"],["Category","category"],["Title","title"],["Description","description","textarea"],["Stack","stack"],["URL","url"],["Visible","visible","checkbox"]]);
  else if(active==="expertise")h=arr("expertise","Expertise",[["Symbol","symbol"],["Icon/Label","icon"],["Title","title"],["Description","description","textarea"]]);
  else if(active==="skills")h=arr("skills","Skill",[["Name","name"],["Level","level","number"]]);
  else if(active==="certifications")h=arr("certifications","Credential",[["Symbol","symbol"],["Credential","value"]]);
  else if(active==="education")h=arr("education","Education",[["Title","title"],["Description","description","textarea"]]);
  else if(active==="blog")h=arr("blog","Article",[["Category","category"],["Title","title"],["Excerpt","excerpt","textarea"],["Date","date"],["Visible","visible","checkbox"]]);
  else if(active==="contact"){
    content.contact.links??=[];
    content.contact.social??=[];
    h=input("Title","contact.title")+area("Description","contact.description")+`<h3>Contact Links</h3>`+
    content.contact.links.map((l,i)=>`<div class="item"><div class="item-head"><b>Link ${i+1}</b><button class="btn danger" onclick="content.contact.links.splice(${i},1);render()">Remove</button></div>${input("Label",`contact.links.${i}.label`)}${input("URL",`contact.links.${i}.url`)}${check("Visible",`contact.links.${i}.visible`)}</div>`).join("")+
    `<button class="btn primary" onclick="content.contact.links.push({label:'New link',url:'https://',visible:true});render()">Add Contact Link</button>`+
    `<h3 style="margin-top:24px">Social Icons</h3>`+
    content.contact.social.map((l,i)=>`<div class="item"><div class="item-head"><b>Social ${i+1}</b><button class="btn danger" onclick="content.contact.social.splice(${i},1);render()">Remove</button></div>${input("Label",`contact.social.${i}.label`)}${input("Icon / Symbol",`contact.social.${i}.icon`)}${input("URL",`contact.social.${i}.url`)}${check("Visible",`contact.social.${i}.visible`)}</div>`).join("")+
    `<button class="btn primary" onclick="content.contact.social.push({label:'New social',icon:'↗',url:'https://',visible:true});render()">Add Social Icon</button>`;
  }
  else if(active==="seo")h=input("SEO title","seo.title")+area("Description","seo.description")+input("Image","seo.image");
  else if(active==="theme")h=input("Background","theme.bg","color")+input("Paper","theme.paper","color")+input("Ink","theme.ink","color")+input("Accent","theme.accent","color");
  else if(active==="maintenance")h=check("Enable maintenance mode","maintenance.enabled")+input("Maintenance title","maintenance.title")+area("Maintenance message","maintenance.message");
  else if(active==="json")h=`<textarea class="code" oninput="try{content=JSON.parse(this.value)}catch(e){}">${esc(JSON.stringify(content,null,2))}</textarea>`;
  editor.innerHTML=h;
}
if(sessionStorage.getItem(SESSION)==="1"){login.classList.add("hidden");app.classList.remove("hidden");load()}
