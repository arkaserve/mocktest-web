export default function PrivacyPage() {
  const updated='25 May 2026'
  const S={page:{fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",background:'#fff',color:'#111'},inner:{maxWidth:760,margin:'0 auto',padding:'0 24px'}}
  const sections=[
    {title:'1. Who we are',body:`MockTest is a product of Anil Software Technologies, operated by Anil Kumar Mikkili, accessible at mocktest.anilsofttech.com. We provide expert-crafted mock tests for competitive exams including Bank Clerk Prelims, UPSC, SSC, and GATE.`},
    {title:'2. What data we collect',list:['Account information: Full name, email address, target exam — provided at registration','Test data: Your answers, time spent per question, score, and performance metrics','Usage data: Pages visited, features used, session duration','Device data: Browser type, operating system, IP address for security purposes','We do NOT collect: Aadhaar, PAN, payment card details, biometric data, or location data']},
    {title:'3. Why we collect your data',list:['To create and manage your account','To generate personalised mock tests and track your progress','To provide automated weakness analysis and study recommendations','To generate solution PDFs for completed tests','To send important account notifications','We do NOT use your data for advertising or sell it to third parties — ever']},
    {title:'4. How we store and protect your data',body:`Your data is stored securely on Supabase (PostgreSQL) hosted on AWS. We use TLS 1.3 for data in transit and AES-256 for data at rest. We follow OWASP security standards including rate limiting, input validation, and security headers.`},
    {title:'5. Your rights under DPDP Act 2023',list:['Right to access: Request a copy of all data we hold about you','Right to correction: Request correction of inaccurate data','Right to erasure: Request deletion of your account and all associated data','Right to grievance: Contact our Data Protection Officer for any concern','To exercise any right, contact us. We respond within 30 days.']},
    {title:'6. Data retention',body:`We retain your account data as long as your account is active. Test results are retained for 2 years to provide progress tracking. If you delete your account, all personally identifiable data is permanently deleted within 30 days.`},
    {title:'7. Third-party services',list:['Supabase: Database and authentication','Anthropic Claude API: question generation (no student data sent)','Groq API: Question validation (no student data sent)','Google Analytics 4: Usage analytics (if enabled)','Vercel: Frontend hosting']},
    {title:'8. Cookies',body:`We use essential cookies for authentication. If Google Analytics is enabled, we use analytics cookies. You can disable analytics cookies via the cookie banner. We do not use advertising or tracking cookies.`},
    {title:"9. Children's privacy",body:`MockTest is intended for users who are 18 years of age or older, or students preparing for competitive exams with parental consent if under 18. We do not knowingly collect data from children under 13.`},
    {title:'10. Contact us',contact:true},
  ]
  return (
    <div style={S.page}>
      <section style={{background:'#111',padding:'48px 32px'}}>
        <div style={{...S.inner,textAlign:'center'}}>
          <h1 style={{fontSize:36,fontWeight:900,color:'#fff',letterSpacing:'-1px',marginBottom:8}}>Privacy Policy</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,.4)'}}>Last updated: {updated} · Effective immediately</p>
        </div>
      </section>
      <section style={{padding:'48px 32px'}}>
        <div style={S.inner}>
          <div style={{background:'#FFF3EE',border:'1.5px solid #fec9b0',borderRadius:11,padding:'14px 18px',marginBottom:32,fontSize:13,color:'#111',lineHeight:1.6}}>
            This policy complies with India's <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>. We believe your data belongs to you — not us.
          </div>
          {sections.map(sec=>(
            <div key={sec.title} style={{marginBottom:36}}>
              <h2 style={{fontSize:17,fontWeight:700,color:'#111',marginBottom:12,paddingBottom:10,borderBottom:'1px solid #EBEBEB'}}>{sec.title}</h2>
              {sec.body&&<p style={{fontSize:14,color:'#555',lineHeight:1.75}}>{sec.body}</p>}
              {sec.list&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{sec.list.map(item=>(
                <div key={item} style={{display:'flex',gap:10,fontSize:13,color:'#555',lineHeight:1.6}}>
                  <span style={{color:'#FF653F',marginTop:3,flexShrink:0}}>—</span>{item}
                </div>
              ))}</div>}
              {sec.contact&&<div style={{background:'#F8F8F8',border:'1px solid #EBEBEB',borderRadius:11,padding:18,fontSize:13,color:'#555',display:'flex',flexDirection:'column',gap:6}}>
                <div><strong>Data Protection Officer:</strong> Anil Kumar Mikkili</div>
                <div><strong>Website:</strong> www.anilsofttech.com</div>
                <div><strong>Platform:</strong> mocktest.anilsofttech.com</div>
                <div><strong>Response time:</strong> Within 30 working days</div>
              </div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
