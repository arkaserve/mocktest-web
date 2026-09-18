export default function TermsPage() {
  const updated='25 May 2026'
  const S={page:{fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",background:'#fff',color:'#111'},inner:{maxWidth:760,margin:'0 auto',padding:'0 24px'}}
  const sections=[
    {title:'1. Acceptance of terms',body:`By accessing or using MockTest (mocktest.arkaserve.com), a service of Arkaserve, you agree to be bound by these Terms of Service and our Privacy Policy.`},
    {title:'2. Description of service',body:`MockTest provides expert-crafted mock tests for competitive examinations including Bank Clerk Prelims (IBPS/SBI), UPSC Prelims, SSC CGL, and GATE. The platform is provided for educational preparation purposes only.`},
    {title:'3. Eligibility and accounts',list:['You must be 18 years or older, or have parental consent if under 18','You must provide accurate information during registration','You are responsible for maintaining the security of your account and password','One account per person — creating multiple accounts is not permitted','We reserve the right to suspend or terminate accounts that violate these terms']},
    {title:'4. Acceptable use — you agree NOT to:',list:['Share your account or test questions with others for commercial purposes','Use automated tools, bots, or scripts to access or scrape the platform','Attempt to reverse-engineer, decompile, or hack the platform or its systems','Upload or transmit malicious code, spam, or any harmful content','Use the platform for any unlawful purpose under Indian law']},
    {title:'5. Intellectual property',body:`All content on MockTest — including expert-crafted questions, explanations, platform design, branding, and code — is the intellectual property of Arkaserve. You may download your own solution PDFs for personal study only. Redistribution or commercial use of platform content is not permitted without written permission.`},
    {title:'6. Free and premium tiers',list:['Free tier: Access to a limited number of mock tests per month','Premium tier: Unlimited tests, full smart predictions, study plans — billed monthly','Institute tier: Custom pricing for coaching institutes — contact us for details','Pricing is in Indian Rupees (INR) and inclusive of applicable taxes','Subscriptions auto-renew unless cancelled before the renewal date']},
    {title:'7. Refund policy',body:`We offer a 7-day refund for Premium subscriptions if you are not satisfied, provided you have not taken more than 3 full mock tests during the period. Refunds are processed within 7 business days to the original payment method.`},
    {title:'8. Auto-generated content disclaimer',body:`MockTest uses an automated question generation system to create examination questions. While we employ multi-layer validation to ensure accuracy, all content is for practice purposes only and should not be considered a substitute for official study materials.`},
    {title:'9. Exam results disclaimer',body:`Performance on MockTest does not guarantee success in the actual examination. Weakness predictions and readiness scores are algorithmic estimates. They are educational tools, not guarantees of outcome.`},
    {title:'10. Governing law',body:`These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana, India.`},
    {title:'11. Contact',contact:true},
  ]
  return (
    <div style={S.page}>
      <section style={{background:'#111',padding:'48px 32px'}}>
        <div style={{...S.inner,textAlign:'center'}}>
          <h1 style={{fontSize:36,fontWeight:900,color:'#fff',letterSpacing:'-1px',marginBottom:8}}>Terms of Service</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,.4)'}}>Last updated: {updated} · Effective immediately</p>
        </div>
      </section>
      <section style={{padding:'48px 32px'}}>
        <div style={S.inner}>
          <div style={{background:'#FFF3EE',border:'1.5px solid #fec9b0',borderRadius:11,padding:'14px 18px',marginBottom:32,fontSize:13,color:'#111',lineHeight:1.6}}>
            Please read these terms carefully before using MockTest. By creating an account, you agree to these terms.
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
                <div><strong>Arkaserve</strong></div>
                <div><strong>Founder:</strong> Anil Kumar Mikkili</div>
                <div><strong>Website:</strong> www.arkaserve.com</div>
                <div><strong>Platform:</strong> mocktest.arkaserve.com</div>
              </div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
