import { useNavigate } from "react-router-dom";

export default function DashboardPortal() {
  const navigate = useNavigate();
  const dashboards = [
    {
      key:"freelancer",
      route:"/freelancer-dashboard",
      gradient:"linear-gradient(135deg,#1A1D2E 0%,#141624 100%)",
      accentGrad:"linear-gradient(135deg,#635BFF,#7C3AED)",
      accent:"#635BFF",
      icon:"⚡",
      title:"Freelancer Dashboard",
      subtitle:"Find jobs & grow your career",
      description:"Browse thousands of jobs, submit proposals, track applications, manage active projects, and monitor your earnings — all in one place.",
      features:["Browse & Search Jobs","Submit Proposals","Track Applications","Manage Active Projects","View Earnings & Reviews"],
      cta:"Enter as Freelancer",
      badge:"Job Seeker",
    },
    {
      key:"client",
      route:"/client-dashboard",
      gradient:"linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%)",
      accentGrad:"linear-gradient(135deg,#3B82F6,#1D4ED8)",
      accent:"#3B82F6",
      icon:"🏢",
      title:"Client Dashboard",
      subtitle:"Post jobs & hire top talent",
      description:"Create detailed job postings, receive and review freelancer applications, manage ongoing projects, and communicate with your team.",
      features:["Post & Publish Jobs","Review Applicants","Manage Active Projects","Track Job Status Pipeline","Direct Messaging"],
      cta:"Enter as Client",
      badge:"Job Poster",
      dark:false,
    },
    {
      key:"selection",
      route:"/selection-dashboard",
      gradient:"linear-gradient(135deg,#0D0D1A 0%,#0A1628 100%)",
      accentGrad:"linear-gradient(135deg,#F59E0B,#EF4444)",
      accent:"#F59E0B",
      icon:"🎯",
      title:"Talent Finder",
      subtitle:"Filter, compare & select the best",
      description:"Use advanced filters to discover the perfect freelancer for your project. Compare candidates side-by-side and send direct work requests.",
      features:["Advanced Talent Filters","Side-by-Side Comparison","Job Match Scoring","Direct Work Requests","Real-Time Chat"],
      cta:"Open Talent Finder",
      badge:"Smart Selection",
    },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#060814",fontFamily:"'Plus Jakarta Sans',sans-serif",padding:"4rem 1.5rem"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes portalFade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .portal-card{animation:portalFade 0.5s ease-out both;}
        .portal-card:nth-child(1){animation-delay:0.1s}
        .portal-card:nth-child(2){animation-delay:0.2s}
        .portal-card:nth-child(3){animation-delay:0.3s}
      `}</style>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"3.5rem"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"0.6rem",background:"rgba(99,91,255,0.1)",border:"1px solid rgba(99,91,255,0.25)",borderRadius:99,padding:"0.35rem 1rem",marginBottom:"1.5rem"}}>
            <span style={{fontSize:"1rem"}}>⚡</span>
            <span style={{fontSize:"0.8rem",fontWeight:700,color:"#635BFF",letterSpacing:"0.04em"}}>FREELANCING PLATFORM</span>
          </div>
          <h1 style={{fontSize:"clamp(2rem,5vw,3.2rem)",fontWeight:800,color:"#F1F5F9",lineHeight:1.15,marginBottom:"1rem"}}>
            Choose Your<br/>
            <span style={{background:"linear-gradient(135deg,#635BFF,#F59E0B,#EF4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Dashboard Experience</span>
          </h1>
          <p style={{fontSize:"1.05rem",color:"#64748B",maxWidth:560,margin:"0 auto",lineHeight:1.7}}>
            Three purpose-built dashboards — one platform. Whether you are looking for work, posting jobs, or selecting the perfect freelancer.
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"1.5rem"}}>
          {dashboards.map((d,i)=>(
            <div key={d.key} className="portal-card" style={{background:d.gradient,borderRadius:24,padding:"2rem",cursor:"pointer",border:`1px solid rgba(255,255,255,${d.dark===false?"0.15":"0.07"})`,transition:"all 0.3s",position:"relative",overflow:"hidden"}}
              onClick={()=>navigate(d.route)}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow=`0 20px 60px ${d.accent}30`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{position:"absolute",top:-40,right:-40,width:120,height:120,borderRadius:"50%",background:`${d.accent}15`,pointerEvents:"none"}}></div>
              <div style={{position:"absolute",bottom:-30,left:-30,width:80,height:80,borderRadius:"50%",background:`${d.accent}08`,pointerEvents:"none"}}></div>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.5rem"}}>
                <div style={{width:52,height:52,background:d.accentGrad,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",boxShadow:`0 8px 20px ${d.accent}40`}}>{d.icon}</div>
                <span style={{background:`${d.accent}18`,color:d.accent,border:`1px solid ${d.accent}35`,padding:"0.25rem 0.7rem",borderRadius:99,fontSize:"0.72rem",fontWeight:800,letterSpacing:"0.04em"}}>{d.badge}</span>
              </div>
              <h2 style={{fontSize:"1.3rem",fontWeight:800,color:d.dark===false?"#0F172A":"#F1F5F9",marginBottom:"0.35rem"}}>{d.title}</h2>
              <div style={{fontSize:"0.85rem",color:d.accent,fontWeight:700,marginBottom:"0.75rem"}}>{d.subtitle}</div>
              <p style={{fontSize:"0.83rem",color:d.dark===false?"#475569":"#64748B",lineHeight:1.7,marginBottom:"1.5rem"}}>{d.description}</p>
              <ul style={{listStyle:"none",padding:0,margin:"0 0 1.75rem",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                {d.features.map(f=>(
                  <li key={f} style={{display:"flex",alignItems:"center",gap:"0.5rem",fontSize:"0.82rem",color:d.dark===false?"#334155":"#94A3B8"}}>
                    <span style={{color:d.accent,fontWeight:700,fontSize:"0.9rem"}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button style={{width:"100%",padding:"0.85rem",background:d.accentGrad,border:"none",borderRadius:12,color:"#fff",fontWeight:800,fontSize:"0.9rem",cursor:"pointer",fontFamily:"inherit",boxShadow:`0 6px 20px ${d.accent}40`,transition:"all 0.2s"}}>
                {d.cta} →
              </button>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:"3rem",fontSize:"0.82rem",color:"#334155"}}>
          All three dashboards are connected — jobs posted by clients appear for freelancers, applications flow back to clients, and the talent finder helps pick the best candidate.
        </div>
      </div>
    </div>
  );
}
