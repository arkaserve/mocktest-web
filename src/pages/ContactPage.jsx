import { useState } from 'react'

export default function ContactPage() {
  const [form,setForm]=useState({name:'',email:'',subject:'',message:''})
  const [sent,setSent]=useState(false)
  const [loading,setLoading]=useState(false)
  const handle=(e)=>setForm(f=>({...f,[e.target.name]:e.target.value}))
  const submit=async()=>{
    if(!form.name||!form.email||!form.message)return
    setLoading(true)
    await new Promise(r=>setTimeout(r,1200))
    setSent(true);setLoading(false)
  }
  const S={
    page:{fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",background:'#fff',color:'#111'},
    inp:{width:'100%',border:'1.5px solid #EBEBEB',borderRadius:9,padding:'11px 14px',fontSize:14,outline:'none',transition:'border-color .12s',background:'#fff'},
    label:{display:'block',fontSize:12,fontWeight:600,color:'#444',marginBottom:6},
  }
  return (
    <div style={S.page}>
      <section style={{background:'#111',padding:'clamp(40px,8vw,56px) clamp(20px,5vw,32px)'}}>
        <div style={{maxWidth:720,margin:'0 auto',textAlign:'center'}}>
          <h1 style={{fontSize:'clamp(28px,6vw,38px)',fontWeight:900,color:'#fff',letterSpacing:'-1px',marginBottom:10}}>Get in Touch</h1>
          <p style={{fontSize:'clamp(14px,3.5vw,16px)',color:'rgba(255,255,255,.55)'}}>Have a question? We would love to hear from you.</p>
        </div>
      </section>

      <section style={{padding:'clamp(36px,7vw,56px) clamp(20px,5vw,32px)'}}>
        <div style={{maxWidth:1000,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'clamp(28px,5vw,56px)'}}>

          <div>
            <div style={{fontSize:11,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Contact Info</div>
            <h2 style={{fontSize:24,fontWeight:800,color:'#111',marginBottom:24}}>We're here to help</h2>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {[{icon:'W',label:'Website',value:'www.anilsofttech.com'},{icon:'Li',label:'LinkedIn',value:'Anil Kumar Mikkili'},{icon:'24',label:'Response',value:'Within 24 hours'}].map(c=>(
                <div key={c.label} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:'#F8F8F8',borderRadius:11,border:'1px solid #EBEBEB'}}>
                  <div style={{width:36,height:36,background:'#FFF3EE',border:'1px solid #fec9b0',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',color:'#FF653F',fontSize:11,fontWeight:900,flexShrink:0}}>{c.icon}</div>
                  <div>
                    <div style={{fontSize:11,color:'#999',textTransform:'uppercase',letterSpacing:'.05em'}}>{c.label}</div>
                    <div style={{fontSize:14,fontWeight:600,color:'#111',marginTop:2}}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:24,background:'#FFF3EE',border:'1.5px solid #fec9b0',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:6}}>For coaching institutes</div>
              <p style={{fontSize:13,color:'#666',lineHeight:1.65}}>Want to offer mock tests to your students? We offer a white-label version of the platform. Get in touch to discuss.</p>
            </div>
          </div>

          <div>
            {sent ? (
              <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',textAlign:'center'}}>
                <div style={{width:56,height:56,background:'#ECFDF5',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-9" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"/></svg>
                </div>
                <h3 style={{fontSize:20,fontWeight:700,color:'#111',marginBottom:8}}>Message sent!</h3>
                <p style={{fontSize:14,color:'#666'}}>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Send a Message</div>
                <h2 style={{fontSize:24,fontWeight:800,color:'#111',marginBottom:24}}>Write to us</h2>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
                    <div><label style={S.label}>Your name</label><input name="name" value={form.name} onChange={handle} placeholder="Full name" style={S.inp} onFocus={e=>e.target.style.borderColor='#FF653F'} onBlur={e=>e.target.style.borderColor='#EBEBEB'}/></div>
                    <div><label style={S.label}>Email</label><input name="email" value={form.email} onChange={handle} placeholder="you@example.com" style={S.inp} onFocus={e=>e.target.style.borderColor='#FF653F'} onBlur={e=>e.target.style.borderColor='#EBEBEB'}/></div>
                  </div>
                  <div>
                    <label style={S.label}>Subject</label>
                    <select name="subject" value={form.subject} onChange={handle} style={{...S.inp,cursor:'pointer'}}>
                      <option value="">Select a topic</option>
                      <option value="mocktest">Mock test platform</option>
                      <option value="courses">Courses inquiry</option>
                      <option value="institute">Coaching institute partnership</option>
                      <option value="webdev">Web development project</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Message</label>
                    <textarea name="message" value={form.message} onChange={handle} rows={5} placeholder="Tell us how we can help..." style={{...S.inp,resize:'none'}} onFocus={e=>e.target.style.borderColor='#FF653F'} onBlur={e=>e.target.style.borderColor='#EBEBEB'}/>
                  </div>
                  <button onClick={submit} disabled={loading}
                    style={{width:'100%',background:loading?'#e5512f':'#FF653F',color:'#fff',border:'none',borderRadius:9,padding:'13px 0',fontSize:14,fontWeight:700,cursor:'pointer',transition:'background .12s'}}>
                    {loading?'Sending...':'Send Message →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
