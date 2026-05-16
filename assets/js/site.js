const defaults={
      brand:{publicName:"Qassem.net",officialName:"Kasem Adra",title:"Systems Architect & Digital Operations Strategist",logoText:"Qassem.net",logoMark:"Q",logoImage:""},
      hero:{eyebrow:"Qassem.net · Systems Architect",subtitle:"Architecting intelligent digital infrastructure.",description:"I design and operate secure digital systems across media infrastructure, cloud, cybersecurity, AI, data, project management and business transformation.",primaryButton:"Explore Systems",primaryLink:"#systems",secondaryButton:"Contact",secondaryLink:"#contact",chips:["Digital Operations","Cloud","Cybersecurity","AI & Data","Strategy"]},
      slider:[
        {label:"Operating Identity",title:"From content systems to enterprise architecture.",description:"A modern personal platform built around media infrastructure, digital operations, cloud, cybersecurity, AI and business strategy.",button:"View identity",url:"#identity"},
        {label:"Systems Architect",title:"Cloud, security, AI and operations as one architecture.",description:"A coherent professional identity: architect, operator and strategist — not a generic developer profile.",button:"Explore systems",url:"#systems"},
        {label:"Digital Operations",title:"Built for structured transformation.",description:"The public identity is designed around real operational depth: information systems, infrastructure thinking, security, data and business execution.",button:"View work",url:"#work"}
      ],
      about:{title:"Systems thinking shaped by real operations.",paragraph1:"I am a systems-minded digital architect with hands-on experience in media operations, CMS management, digital archiving, content strategy and multi-platform publishing.",paragraph2:"My technical path expands that operational foundation into cloud architecture, cybersecurity, DevSecOps, data science, AI, project management and business administration."},
      principles:[{value:"Architecture",label:"Coherent systems"},{value:"Operations",label:"Information flows"},{value:"Security",label:"Trust & resilience"},{value:"Strategy",label:"Transformation"}],
      systems:[{number:"Layer 01",title:"Digital Operations",description:"CMS, content infrastructure, publishing systems, digital archives and real-time information flows."},{number:"Layer 02",title:"Infrastructure",description:"Cloud architecture, virtualization, Linux, Kubernetes, configuration management and Infrastructure as Code."},{number:"Layer 03",title:"Security",description:"Cybersecurity architecture, threat intelligence, privileged access, DevSecOps and secure delivery."},{number:"Layer 04",title:"Intelligence",description:"Data science, analytics, AI workflows and intelligent decision support."}],
      projects:[{symbol:"⚙️",title:"Digital Publishing System",category:"CMS",description:"Design and management of CMS workflows for large-scale content operations.",stack:"CMS · Publishing · Archiving",visible:true},{symbol:"⌘",title:"Media Operations Infrastructure",category:"Operations",description:"Real-time information flow, multi-platform content distribution and editorial coordination.",stack:"Media · Crisis · Distribution",visible:true}],
      expertise:[{symbol:"☁️",icon:"Infrastructure",title:"Cloud & Infrastructure",description:"Cloud architecture, virtualization, Linux, Kubernetes, DevOps and Infrastructure as Code foundations."},{symbol:"🛡️",icon:"Security",title:"Cybersecurity Architecture",description:"Threat intelligence, privileged access, Azure security, DevSecOps and secure delivery principles."},{icon:"Strategy",title:"Business Transformation",description:"Business thinking, digital marketing analytics, project management and strategic planning."}],
      skills:[{name:"Systems Architecture",level:94},{name:"Digital Operations",level:96},{name:"Cybersecurity",level:88},{name:"Cloud & DevOps",level:86},{name:"AI & Data",level:84},{name:"Project Management",level:90}],
      certifications:[{symbol:"◆",value:"Harvard CS50x — Computer Science"},{symbol:"♟",value:"Google Project Management Professional Certificate"},{symbol:"◈",value:"IBM Data Science Professional Certificate"},{symbol:"🛡️",value:"CompTIA Security+ / Cloud+ / Linux+ / A+"},{value:"MBA + Digital Marketing & Analytics"}],
      education:[{symbol:"♟",title:"MBA + Digital Marketing & Analytics",description:"Business administration, digital marketing, analytics, strategy, project management and transformation."}],
      blog:[{symbol:"⌘",title:"Why Systems Thinking Matters",category:"Architecture",excerpt:"Digital work is the design of flows, responsibilities, controls and resilience.",visible:true}],
      contact:{title:"Let’s build with clarity.",description:"For collaboration, consulting, architecture or strategic systems work, send me a message.",links:[{label:"Email",url:"mailto:kasemadra@gmail.com"}],social:[{label:"LinkedIn",url:"https://www.linkedin.com/in/qassem-adra/",icon:"in",visible:true},{label:"GitHub",url:"https://github.com/",icon:"⌘",visible:false},{label:"X",url:"https://x.com/",icon:"𝕏",visible:false},{label:"YouTube",url:"https://youtube.com/",icon:"▶",visible:false},{label:"Instagram",url:"https://instagram.com/",icon:"◎",visible:false}]},
      seo:{title:"Qassem.net — Systems Architect",description:"Systems Architect & Digital Operations Strategist.",image:"/og-image.png"},
      maintenance:{enabled:false,title:"Under Maintenance",message:"The website is currently being improved. Please check back soon."}
    };

    let site=structuredClone(defaults),slides=[],current=0,timer=null;
    const fallback=window.QASSEM_DEFAULT_CONTENT||{};
    site=merge(site,fallback);

    function merge(a,b){
      const o=structuredClone(a||{});
      for(const[k,v]of Object.entries(b||{})){
        o[k]=v&&typeof v==="object"&&!Array.isArray(v)?{...(o[k]||{}),...v}:v;
      }
      return o;
    }
    const $=id=>document.getElementById(id);
    const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

    function maintenanceScreen(data){
      document.body.innerHTML=`
      <style>
        body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0d1014;color:#f4efe6;font-family:Inter,system-ui,sans-serif;padding:24px}
        .box{max-width:760px;border:1px solid rgba(244,239,230,.13);padding:54px;background:rgba(244,239,230,.04);text-align:center;box-shadow:0 34px 90px rgba(0,0,0,.3)}
        small{display:block;margin-bottom:18px;letter-spacing:.2em;text-transform:uppercase;color:#b58b61;font-weight:950}
        h1{font-family:"Playfair Display",serif;font-size:58px;line-height:1;margin:0 0 18px}
        p{color:rgba(244,239,230,.68);line-height:1.9;font-size:18px}
      </style>
      <div class="box"><small>Qassem.net</small><h1>${esc(data.title)}</h1><p>${esc(data.message)}</p></div>`;
    }

    async function load(){
      try{
        const r=await fetch("/api/content",{cache:"no-store",credentials:"include"});
        if(r.ok) site=merge(defaults,await r.json());
      }catch(e){}
      render();
    }


    function renderBrand(){
      const b=site.brand||{};
      const mark=$("brandMark");
      $("brandName").textContent=b.logoText||b.publicName||"Qassem.net";
      const tagline=document.getElementById("brandTagline"); if(tagline) tagline.textContent=b.title||"Systems Architect & Digital Operations";
      if(b.logoImage){
        mark.innerHTML=`<img src="${esc(b.logoImage)}" alt="${esc(b.publicName||"Qassem.net")} logo">`;
      }else{
        mark.textContent=b.logoMark||"Q";
      }
    }

    function render(){
      if(site.maintenance?.enabled){maintenanceScreen(site.maintenance);return;}
      renderBrand();
      const h=site.hero||{};
      $("heroEyebrow").textContent=h.eyebrow||"";
      $("heroTitle").textContent=h.subtitle||"";
      $("heroDescription").textContent=h.description||"";
      $("primaryBtn").textContent=h.primaryButton||"Explore";
      $("primaryBtn").href=h.primaryLink||"#systems";
      $("secondaryBtn").textContent=h.secondaryButton||"Contact";
      $("secondaryBtn").href=h.secondaryLink||"#contact";
      const chips=Array.isArray(h.chips)?h.chips:String(h.chips||"").split(",").map(x=>x.trim()).filter(Boolean);
      $("heroChips").innerHTML=chips.map(x=>`<span>${esc(x)}</span>`).join("");

      const a=site.about||{};
      $("aboutTitle").textContent=a.title||"";
      $("aboutParagraph1").textContent=a.paragraph1||"";
      $("aboutParagraph2").textContent=a.paragraph2||"";

      renderSlider();
      renderPrinciples();
      renderSystems();
      renderCards("projectsGrid",(site.projects||[]).filter(x=>x.visible!==false),"System");
      renderCards("expertiseGrid",site.expertise||[],"Expertise");
      renderSkills();
      renderSimple("certificationsGrid",site.certifications||[],"Credential");
      renderCards("educationGrid",site.education||[],"Education");
      renderBlog();
      renderContact();

      if(site.seo?.title)document.title=site.seo.title;
      $("year").textContent=new Date().getFullYear();
    }

    function renderSlider(){
      slides=site.slider?.length?site.slider:defaults.slider;
      current=Math.min(current,slides.length-1);
      updateSlide();
      clearInterval(timer);
      if(slides.length>1)timer=setInterval(nextSlide,7000);
    }
    function updateSlide(){
      const s=slides[current]||{};
      $("slideLabel").textContent=s.label||"";
      $("slideTitle").textContent=s.title||"";
      $("slideDescription").textContent=s.description||"";
      $("slideButton").textContent=s.button||"Learn more";
      $("slideButton").href=s.url||"#contact";
      $("sliderDots").innerHTML=slides.map((_,i)=>`<button class="dot ${i===current?"active":""}" onclick="goToSlide(${i})" aria-label="Scene ${i+1}"></button>`).join("");
    }
    function nextSlide(){current=(current+1)%slides.length;updateSlide()}
    function prevSlide(){current=(current-1+slides.length)%slides.length;updateSlide()}
    function goToSlide(i){current=i;updateSlide()}


    function iconFor(value){
      const text=String(value||"").toLowerCase();
      if(text.includes("security")||text.includes("cyber")||text.includes("trust"))return "🛡️";
      if(text.includes("cloud")||text.includes("infrastructure")||text.includes("devops")||text.includes("kubernetes"))return "☁️";
      if(text.includes("ai")||text.includes("data")||text.includes("intelligence")||text.includes("analytics"))return "◈";
      if(text.includes("operation")||text.includes("media")||text.includes("cms")||text.includes("publishing"))return "⚙️";
      if(text.includes("strategy")||text.includes("business")||text.includes("transformation"))return "♟";
      if(text.includes("architecture")||text.includes("system"))return "⌘";
      if(text.includes("credential")||text.includes("certification")||text.includes("education")||text.includes("mba"))return "◆";
      return "✦";
    }

    function renderPrinciples(){
      $("principlesGrid").innerHTML=(site.principles||[]).map(x=>`<div class="principle"><div class="symbol-icon">${iconFor(x.value+" "+x.label)}</div><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("");
    }
    function renderSystems(){
      $("systemsGrid").innerHTML=(site.systems||[]).map(x=>`<article class="layer"><div class="symbol-icon">${iconFor(x.title+" "+x.description)}</div><div class="layer-num">${esc(x.number)}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></article>`).join("");
    }
    function renderCards(id,arr,label){
      $(id).innerHTML=(arr&&arr.length?arr:[]).map(x=>`<article class="card"><div class="symbol-icon">${esc(x.symbol||iconFor((x.category||x.icon||label)+" "+x.title))}</div><span class="pill">${esc(x.category||x.icon||label)}</span><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><div class="card-footer">${esc(x.stack||"")}</div></article>`).join("")||`<div class="empty">Add content from dashboard.</div>`;
    }
    function renderSimple(id,arr,label){
      $(id).innerHTML=(arr&&arr.length?arr:[]).map(x=>`<article class="card"><div class="symbol-icon">${esc((typeof x==="object"&&x.symbol)||iconFor((typeof x==="string"?x:x.value)+" "+label))}</div><span class="pill">${label}</span><h3>${esc(typeof x==="string"?x:x.value)}</h3></article>`).join("")||`<div class="empty">Add content from dashboard.</div>`;
    }
    function renderBlog(){
      const arr=(site.blog||[]).filter(x=>x.visible!==false);
      $("blogGrid").innerHTML=arr.map(x=>`<article class="card"><div class="symbol-icon">${esc(x.symbol||iconFor(x.category+" "+x.title))}</div><span class="pill">${esc(x.category||"Article")}</span><h3>${esc(x.title)}</h3><p>${esc(x.excerpt||x.content||"")}</p><div class="card-footer">${esc(x.date||"")}</div></article>`).join("")||`<div class="empty">Add articles from dashboard.</div>`;
    }
    function renderSkills(){
      $("skillsGrid").innerHTML=(site.skills||[]).map(x=>{
        const n=Math.max(0,Math.min(100,Number(x.level||0)));
        return`<div class="skill"><div class="skill-top"><span>${esc(x.name)}</span><span>${n}%</span></div><div class="bar"><div class="fill" style="--v:${n}%"></div></div></div>`;
      }).join("");
    }
    function socialIcon(label,icon){
      if(icon)return icon;
      const text=String(label||"").toLowerCase();
      if(text.includes("linkedin"))return "in";
      if(text.includes("github"))return "⌘";
      if(text==="x"||text.includes("twitter"))return "𝕏";
      if(text.includes("youtube"))return "▶";
      if(text.includes("instagram"))return "◎";
      if(text.includes("facebook"))return "f";
      if(text.includes("email")||text.includes("mail"))return "✉";
      return "↗";
    }
    function renderContact(){
      const c=site.contact||{};
      $("contactTitle").textContent=c.title||"";
      $("contactDescription").textContent=c.description||"";
      $("contactLinks").innerHTML=(c.links||[])
        .filter(l=>l.visible!==false)
        .map(l=>`<a class="contact-link" href="${esc(l.url)}" target="_blank" rel="noreferrer">${esc(l.label)}</a>`)
        .join("");
      const socials=(c.social||[]).filter(l=>l.visible!==false);
      $("socialLinks").innerHTML=socials.map(l=>`<a class="social-link" title="${esc(l.label)}" href="${esc(l.url)}" target="_blank" rel="noreferrer">${esc(socialIcon(l.label,l.icon))}</a>`).join("");
    }
    load();
