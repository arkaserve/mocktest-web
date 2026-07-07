export default function CoursesPage({ onNav }) {
  const courses = [
    {title:'Productivity Fundamentals for Beginners',tag:'Beginner',duration:'4 weeks',lessons:12,desc:'Start your learning journey with practical, no-fluff lessons. Learn how LLMs work, how to prompt them, and how to use productivity tools in your daily work.',topics:['Core concepts','Prompt engineering basics','ChatGPT / Claude for productivity','Real-world use cases'],status:'coming_soon',accent:'#6366F1'},
    {title:'Build Smart Agents with Python',tag:'Intermediate',duration:'6 weeks',lessons:18,desc:'Build production-ready automation agents using LangChain, LangGraph, and Claude API. Learn from real enterprise projects, not textbooks.',topics:['LangChain basics','LangGraph agents','Tool use + function calling','Deploy to production'],status:'coming_soon',accent:'#7C3AED'},
    {title:'AWS Cloud for Developers',tag:'Intermediate',duration:'8 weeks',lessons:24,desc:'Practical AWS architecture from a professional with 3+ years of enterprise cloud experience. EC2, Lambda, RDS, S3 and deployment pipelines.',topics:['AWS core services','Serverless with Lambda','CI/CD pipelines','Cost optimisation'],status:'coming_soon',accent:'#D97706'},
    {title:'Bank Clerk Exam Preparation',tag:'Exam Prep',duration:'Self-paced',lessons:'Unlimited',desc:'expert-crafted mock tests + performance analytics for Bank Clerk Prelims. Track your weak areas and get personalised study plans.',topics:['Unlimited mock tests','Smart weakness analysis','Section-wise practice','Personalised next steps'],status:'live',accent:'#FF653F'},
  ]
  const S={page:{fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",background:'#fff',color:'#111'}}
  return (
    <div style={S.page}>
      <section style={{background:'#111',padding:'56px 32px'}}>
        <div style={{maxWidth:720,margin:'0 auto',textAlign:'center'}}>
          <h1 style={{fontSize:38,fontWeight:900,color:'#fff',letterSpacing:'-1px',marginBottom:10}}>Courses & Learning</h1>
          <p style={{fontSize:16,color:'rgba(255,255,255,.55)'}}>Practical courses built from real enterprise experience — not textbooks.</p>
        </div>
      </section>

      <section style={{padding:'56px 32px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:18}}>
            {courses.map(c=>(
              <div key={c.title} style={{border:`2px solid ${c.status==='live'?c.accent:'#EBEBEB'}`,borderRadius:16,overflow:'hidden',background:'#fff',transition:'transform .15s,box-shadow .15s'}}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 12px 32px rgba(0,0,0,.08)`}}
                onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='none'}}>
                <div style={{padding:'20px 22px',background:c.status==='live'?'#FFF3EE':'#F8F8F8',borderBottom:'1px solid #EBEBEB',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:11,fontWeight:700,background:c.status==='live'?'#FF653F':'#333',color:'#fff',padding:'3px 10px',borderRadius:20}}>{c.tag}</span>
                  <span style={{fontSize:11,fontWeight:700,color:c.status==='live'?'#FF653F':'#999'}}>{c.status==='live'?'● Available Now':'◯ Coming Soon'}</span>
                </div>
                <div style={{padding:'22px'}}>
                  <h3 style={{fontSize:17,fontWeight:700,color:'#111',marginBottom:8}}>{c.title}</h3>
                  <p style={{fontSize:13,color:'#666',lineHeight:1.65,marginBottom:14}}>{c.desc}</p>
                  <div style={{display:'flex',gap:16,fontSize:12,color:'#999',marginBottom:16}}>
                    <span>{c.duration}</span>
                    <span>·</span>
                    <span>{c.lessons} {typeof c.lessons==='number'?'lessons':''}</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:18}}>
                    {c.topics.map(t=>(
                      <div key={t} style={{display:'flex',alignItems:'center',gap:9,fontSize:13,color:'#444'}}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-7" stroke="#FF653F" strokeWidth="2" strokeLinecap="round"/></svg>
                        {t}
                      </div>
                    ))}
                  </div>
                  {c.status==='live'
                    ?<button onClick={()=>onNav('auth')} style={{width:'100%',padding:'11px 0',background:'#FF653F',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer'}}>Start Free Now →</button>
                    :<button disabled style={{width:'100%',padding:'11px 0',background:'transparent',color:'#999',border:'1.5px solid #EBEBEB',borderRadius:9,fontSize:13,cursor:'not-allowed'}}>Notify Me When Available</button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
