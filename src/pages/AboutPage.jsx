export default function AboutPage({ onNav }) {
  const S = {
    page: {fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",background:'#fff',color:'#111'},
    section: {padding:'56px 32px'},
    sectionGray: {padding:'56px 32px',background:'#F8F8F8'},
    inner: {maxWidth:1100,margin:'0 auto'},
    inner720: {maxWidth:720,margin:'0 auto'},
    h1: {fontSize:40,fontWeight:900,color:'#fff',letterSpacing:'-1px',marginBottom:12},
    h2: {fontSize:28,fontWeight:800,color:'#111',letterSpacing:'-0.5px',marginBottom:8},
    p: {fontSize:15,color:'#666',lineHeight:1.7},
    orange: '#FF653F',
  }

  const facts = [
    {label:'Founded', value:'2022'},
    {label:'Location', value:'India'},
    {label:'Website', value:'arkaserve.com'},
    {label:'Focus', value:'Exam Prep + Skill Courses'},
  ]

  const offerings = [
    {icon:'📝', title:'Mock Tests',   desc:'Expert-crafted, validated mock tests for Bank Clerk, UPSC, SSC and more competitive exams.'},
    {icon:'[]', title:'Skill Courses',      desc:'Practical, beginner-friendly tech courses taught by a real IT practitioner. No fluff, just skills.'},
    {icon:'<>', title:'Web Development', desc:'Clean, fast, professional websites tailored for small businesses, startups, and professionals.'},
  ]

  return (
    <div style={S.page}>

      {/* Hero */}
      <section style={{background:'#111',padding:'64px 32px'}}>
        <div style={{...S.inner720,textAlign:'center'}}>
          <h1 style={S.h1}>About Arkaserve</h1>
          <p style={{fontSize:16,color:'rgba(255,255,255,.6)',lineHeight:1.6}}>
            Bridging complex technology and the people who need it most — since 2022.
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={S.section}>
        <div style={{...S.inner,display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center'}}>
          <div>
            <div style={{width:56,height:56,background:'#FF653F',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:18,fontWeight:900,marginBottom:20}}>AK</div>
            <h2 style={S.h2}>Founded by Anil Kumar Mikkili</h2>
            <p style={{...S.p,marginBottom:14}}>A technology practitioner with deep hands-on experience in AWS cloud architecture, MuleSoft integration, CI/CD pipelines, and enterprise systems.</p>
            <p style={S.p}>We started with a simple mission: make technology accessible to everyone — from enterprise teams to individual students preparing for competitive exams.</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {facts.map(f=>(
              <div key={f.label} style={{display:'flex',alignItems:'center',gap:14,background:'#F8F8F8',borderRadius:12,padding:'14px 18px',border:'1px solid #EBEBEB'}}>
                <div style={{width:8,height:8,background:'#FF653F',borderRadius:'50%',flexShrink:0}}/>
                <div>
                  <div style={{fontSize:11,color:'#999',textTransform:'uppercase',letterSpacing:'.06em'}}>{f.label}</div>
                  <div style={{fontSize:15,fontWeight:600,color:'#111',marginTop:2}}>{f.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section style={S.sectionGray}>
        <div style={S.inner}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontSize:11,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Our Products</div>
            <h2 style={{...S.h2,marginBottom:0}}>What We Offer</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {offerings.map(o=>(
              <div key={o.title} style={{background:'#fff',border:'1.5px solid #EBEBEB',borderRadius:14,padding:24,transition:'border-color .15s,transform .15s'}}
                onMouseOver={e=>{e.currentTarget.style.borderColor='#FF653F';e.currentTarget.style.transform='translateY(-3px)'}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='#EBEBEB';e.currentTarget.style.transform=''}}>
                <div style={{width:44,height:44,background:'#FFF3EE',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',color:'#FF653F',fontSize:13,fontWeight:900,marginBottom:16,fontFamily:'monospace'}}>{o.icon}</div>
                <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:8}}>{o.title}</div>
                <div style={{fontSize:13,color:'#666',lineHeight:1.65}}>{o.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{...S.section,textAlign:'center'}}>
        <div style={S.inner720}>
          <h2 style={S.h2}>Ready to experience it?</h2>
          <p style={{...S.p,marginBottom:24}}>Take a free expert-crafted mock test and see the difference.</p>
          <button onClick={()=>onNav('auth')}
            style={{background:'#FF653F',color:'#fff',border:'none',borderRadius:9,padding:'14px 32px',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(255,107,53,.3)',transition:'background .15s,transform .15s'}}
            onMouseOver={e=>{e.currentTarget.style.background='#e5512f';e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseOut={e=>{e.currentTarget.style.background='#FF653F';e.currentTarget.style.transform=''}}>
            Start Free Mock Test →
          </button>
        </div>
      </section>
    </div>
  )
}
