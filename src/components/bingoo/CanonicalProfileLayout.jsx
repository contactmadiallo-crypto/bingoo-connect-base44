import { getAvatarRadius, hexRgb } from "./ProfileLayoutRenderer";
import { profileProfessionLabel } from "@/lib/profileProfessions";

const DISPLAY = "'Plus Jakarta Sans','Inter',system-ui,sans-serif";
const BODY = "'Inter',system-ui,sans-serif";

function Avatar({ profile, size=88, radius, border="none", shadow="none" }) {
  const r = radius || getAvatarRadius(profile?.avatar_shape);
  if (profile?.profile_photo) {
    return <img src={profile.profile_photo} alt="" style={{width:size,height:size,borderRadius:r,objectFit:"cover",objectPosition:profile.avatar_position||"center top",border,boxShadow:shadow,display:"block",flexShrink:0}} />;
  }
  return <div style={{width:size,height:size,borderRadius:r,background:`linear-gradient(135deg,${profile?.cover_color||"#f97316"},${hexRgb(profile?.cover_color||"#f97316",.62)})`,border,boxShadow:shadow,display:"grid",placeItems:"center",color:"#fff",fontWeight:900,fontSize:Math.round(size*.36),flexShrink:0}}>{(profile?.display_name||"?").charAt(0).toUpperCase()}</div>;
}

function Identity({ profile, accent, align="left", dark=false, serif=false, compact=false }) {
  const text = dark ? "#fff" : "#0f172a";
  const sub = dark ? "rgba(255,255,255,.58)" : "#64748b";
  const profession = profile?.custom_profile_category?.trim() || profileProfessionLabel(profile?.profile_category, profile?.language || "en");
  return <div style={{textAlign:align,minWidth:0}}>
    <div style={{display:"flex",justifyContent:align==="center"?"center":"flex-start",marginBottom:6}}><span style={{display:"inline-flex",alignItems:"center",maxWidth:"100%",padding:"4px 8px",borderRadius:999,background:dark?"rgba(255,255,255,.10)":hexRgb(accent,.10),color:dark?"rgba(255,255,255,.82)":accent,fontFamily:BODY,fontSize:8.5,fontWeight:900,letterSpacing:".055em",textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profession}</span></div>
    <h1 style={{margin:0,color:text,fontFamily:serif?"Georgia,'Times New Roman',serif":DISPLAY,fontSize:compact?18:22,lineHeight:1.08,fontWeight:900,letterSpacing:"-.025em"}}>{profile?.display_name}</h1>
    {profile?.job_title && <p style={{margin:"5px 0 0",fontFamily:BODY,color:accent,fontSize:11.5,fontWeight:800,textTransform:serif?"none":"uppercase",letterSpacing:serif?"0":".035em"}}>{profile.job_title}</p>}
    {profile?.company_name && <p style={{margin:"3px 0 0",fontFamily:BODY,color:sub,fontSize:11.5,fontWeight:600}}>{profile.company_name}</p>}
  </div>;
}

function Cover({ profile, accent, height=140, overlay="linear-gradient(to bottom,rgba(0,0,0,.02),rgba(0,0,0,.42))" }) {
  return <div style={{height,position:"relative",overflow:"hidden"}}>
    {profile?.cover_photo
      ? <img src={profile.cover_photo} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:profile.cover_position||"center"}} />
      : <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${accent},#0b2149)`}} />}
    {overlay && <div style={{position:"absolute",inset:0,background:overlay}} />}
  </div>;
}

function Shell({ mobile, pageBg, innerBg, children, contentSections, contentPad="14px 14px 120px", radius=mobile?0:28, shadow=true }) {
  return <div style={{minHeight:"100vh",background:pageBg,padding:mobile?0:"24px 18px 60px"}}>
    <div style={{width:"100%",maxWidth:mobile?"100%":470,minHeight:mobile?"100vh":"calc(100vh - 84px)",margin:"0 auto",background:innerBg,borderRadius:radius,overflow:"hidden",boxShadow:mobile||!shadow?"none":"0 24px 70px rgba(15,23,42,.15)",position:"relative"}}>
      {children}
      <div style={{padding:contentPad}}>{contentSections}</div>
    </div>
  </div>;
}

function Classic({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg={`linear-gradient(160deg,${hexRgb(accent,.10)},#eef4ff 46%,#f8fbff)`} innerBg="#f8fbff" contentSections={contentSections}>
    <Cover profile={profile} accent={accent} height={mobile?150:180}/>
    <div style={{padding:"0 18px 14px",textAlign:"center",marginTop:-48,position:"relative"}}>
      <div style={{display:"flex",justifyContent:"center"}}><Avatar profile={profile} size={92} border="4px solid #fff" shadow="0 10px 30px rgba(15,23,42,.22)"/></div>
      <div style={{marginTop:10}}><Identity profile={profile} accent={accent} align="center"/></div>
    </div>
  </Shell>;
}

function Minimal({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg={`linear-gradient(160deg,${hexRgb(accent,.12)},#eef3f8 55%,#f8fafc)`} innerBg="#f4f7fb" contentSections={contentSections} contentPad="10px 14px 120px">
    <div style={{height:5,background:accent}}/>
    <div style={{display:"flex",alignItems:"center",gap:13,padding:"18px 16px 14px",borderBottom:"1px solid #e8edf3"}}>
      <Avatar profile={profile} size={66} radius={14}/>
      <Identity profile={profile} accent={accent} compact/>
      {profile?.company_logo && <img src={profile.company_logo} alt="" style={{width:34,height:34,objectFit:"contain",marginLeft:"auto"}}/>}
    </div>
  </Shell>;
}

function Card({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg={`linear-gradient(160deg,${hexRgb(accent,.14)},#eaf0f8 52%,#f8fafc)`} innerBg={`linear-gradient(180deg,#eef3f9,${hexRgb(accent,.06)})`} contentSections={contentSections} contentPad="8px 14px 120px">
    <Cover profile={profile} accent={accent} height={mobile?92:110} overlay="linear-gradient(to bottom,transparent,rgba(15,23,42,.15))"/>
    <div style={{margin:"-28px 14px 10px",background:"#fff",borderRadius:20,padding:"14px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 12px 34px rgba(15,23,42,.12)",position:"relative"}}>
      <Avatar profile={profile} size={64} radius={16}/>
      <Identity profile={profile} accent={accent} compact/>
    </div>
  </Shell>;
}

function ImageHero({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg={`linear-gradient(160deg,#081120,${accent})`} innerBg={`linear-gradient(180deg,#f8fbff,${hexRgb(accent,.07)})`} contentSections={contentSections} contentPad="12px 14px 120px">
    <div style={{height:mobile?250:290,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${accent},#0f172a)`}}>
      {profile?.cover_photo && <img src={profile.cover_photo} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:profile.cover_position||"center"}}/>}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(5,11,24,.90),rgba(5,11,24,.08) 62%)"}}/>
      <div style={{position:"absolute",left:18,right:18,bottom:18,display:"flex",alignItems:"flex-end",gap:13}}>
        <div style={{flex:1}}><Identity profile={profile} accent="#fff" dark/></div>
        <Avatar profile={profile} size={76} border="3px solid rgba(255,255,255,.88)" shadow="0 10px 30px rgba(0,0,0,.28)"/>
      </div>
    </div>
  </Shell>;
}

function Glass({profile,accent,mobile,contentSections}) {
  const bg=`radial-gradient(circle at 20% 10%,${hexRgb(accent,.34)},transparent 34%),radial-gradient(circle at 90% 30%,rgba(249,115,22,.18),transparent 30%),linear-gradient(145deg,#e7ecff,#f8fafc)`;
  return <Shell mobile={mobile} pageBg={bg} innerBg="transparent" contentSections={contentSections} contentPad="10px 14px 120px" shadow={false}>
    <div style={{margin:mobile?"18px 14px 10px":"22px 18px 12px",padding:"18px",borderRadius:26,background:"rgba(255,255,255,.62)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.78)",boxShadow:"0 16px 38px rgba(69,78,130,.18)",textAlign:"center"}}>
      <div style={{display:"flex",justifyContent:"center"}}><Avatar profile={profile} size={82} border="3px solid rgba(255,255,255,.85)" shadow={`0 10px 30px ${hexRgb(accent,.24)}`}/></div>
      <div style={{marginTop:10}}><Identity profile={profile} accent={accent} align="center"/></div>
    </div>
  </Shell>;
}

function Dark({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg="linear-gradient(160deg,#040713,#0b1730 58%,#111827)" innerBg="linear-gradient(180deg,#08111f,#10182b)" contentSections={contentSections}>
    <div style={{padding:"28px 18px 18px",textAlign:"center",background:"radial-gradient(circle at 50% 0%,rgba(255,255,255,.08),transparent 46%)"}}>
      <div style={{display:"flex",justifyContent:"center"}}><Avatar profile={profile} size={88} border={`2px solid ${accent}`} shadow={`0 0 0 6px ${hexRgb(accent,.10)},0 0 32px ${hexRgb(accent,.28)}`}/></div>
      <div style={{marginTop:12}}><Identity profile={profile} accent={accent} align="center" dark/></div>
    </div>
  </Shell>;
}

function Aurora({profile,accent,mobile,contentSections}) {
  const bg="linear-gradient(160deg,#07111f 0%,#15204a 42%,#0f766e 100%)";
  return <Shell mobile={mobile} pageBg="#06101a" innerBg={bg} contentSections={contentSections}>
    <div style={{height:mobile?205:235,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:230,height:230,borderRadius:"50%",background:`radial-gradient(circle,${hexRgb(accent,.48)},transparent 67%)`,top:-110,left:-40,filter:"blur(4px)"}}/>
      <div style={{position:"absolute",right:-50,top:10,width:190,height:190,borderRadius:"50%",background:"radial-gradient(circle,rgba(45,212,191,.34),transparent 68%)"}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
        <Avatar profile={profile} size={78} border="3px solid rgba(255,255,255,.72)" shadow="0 10px 36px rgba(0,0,0,.3)"/>
        <Identity profile={profile} accent="#67e8f9" align="center" dark compact/>
      </div>
    </div>
  </Shell>;
}

function Magazine({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg="linear-gradient(160deg,#eadfce,#f5e9da 55%,#efe7dc)" innerBg="linear-gradient(180deg,#fff8ee,#fffdf7)" contentSections={contentSections}>
    <Cover profile={profile} accent={accent} height={mobile?180:215} overlay="linear-gradient(to top,rgba(0,0,0,.35),transparent 65%)"/>
    <div style={{display:"grid",gridTemplateColumns:"78px 1fr",gap:14,padding:"14px 18px 16px",alignItems:"start",borderBottom:"1px solid #ded7c8"}}>
      <Avatar profile={profile} size={78} radius={6}/>
      <div><p style={{margin:"0 0 6px",fontFamily:BODY,fontSize:9,fontWeight:900,letterSpacing:".18em",textTransform:"uppercase",color:accent}}>Profile / Edition</p><Identity profile={profile} accent={accent} serif/></div>
    </div>
  </Shell>;
}

function Executive({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg="#07111f" innerBg="#0d1728" contentSections={contentSections}>
    <div style={{height:mobile?190:225,display:"grid",gridTemplateColumns:"1fr 112px",background:"linear-gradient(135deg,#0d1728,#15243d)",borderTop:`4px solid ${accent}`}}>
      <div style={{padding:"30px 20px 20px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
        {profile?.company_name && <p style={{margin:"0 0 8px",fontSize:9,fontWeight:900,letterSpacing:".18em",textTransform:"uppercase",color:accent}}>{profile.company_name}</p>}
        <Identity profile={{...profile,company_name:null}} accent={accent} dark/>
      </div>
      <div style={{position:"relative",overflow:"hidden",background:"#172338"}}>
        {profile?.profile_photo ? <img src={profile.profile_photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/> : <div style={{height:"100%",display:"grid",placeItems:"center"}}><Avatar profile={profile} size={74}/></div>}
      </div>
    </div>
  </Shell>;
}

function Salon({profile,accent,mobile,contentSections}) {
  const bg="linear-gradient(160deg,#1b0b16,#3a1730)";
  return <Shell mobile={mobile} pageBg="#160912" innerBg={bg} contentSections={contentSections}>
    <Cover profile={profile} accent={accent} height={mobile?145:175} overlay="linear-gradient(to bottom,rgba(26,10,20,.18),#1b0b16 100%)"/>
    <div style={{textAlign:"center",padding:"0 18px 18px",marginTop:-44,position:"relative"}}>
      <div style={{display:"flex",justifyContent:"center"}}><Avatar profile={profile} size={88} border="4px solid #1b0b16" shadow={`0 10px 34px ${hexRgb(accent,.30)}`}/></div>
      <div style={{marginTop:10}}><Identity profile={profile} accent="#f9a8d4" align="center" dark serif/></div>
      <div style={{width:48,height:1,background:`linear-gradient(90deg,transparent,${accent},transparent)`,margin:"13px auto 0"}}/>
    </div>
  </Shell>;
}

function Law({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg="linear-gradient(160deg,#dfe7ef,#edf2f7 55%,#f4efe5)" innerBg="linear-gradient(180deg,#f8f4ea,#f9fafb)" contentSections={contentSections}>
    <div style={{background:"#0b172a",padding:"24px 18px",borderTop:`5px solid ${accent}`,display:"flex",gap:16,alignItems:"center"}}>
      <div style={{flex:1}}>
        <p style={{margin:"0 0 7px",fontSize:9,fontWeight:900,letterSpacing:".18em",textTransform:"uppercase",color:accent}}>{profile?.company_name||"Legal Profile"}</p>
        <Identity profile={{...profile,company_name:null}} accent={accent} dark serif/>
      </div>
      <Avatar profile={profile} size={76} radius={7} border={`1px solid ${accent}`}/>
    </div>
  </Shell>;
}

function Corporate({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg={`linear-gradient(160deg,${hexRgb(accent,.14)},#e8f0fb 58%,#f5f9ff)`} innerBg="linear-gradient(180deg,#f7fbff,#eef4fb)" contentSections={contentSections}>
    <div style={{height:6,background:`linear-gradient(90deg,${accent},#0b2149)`}}/>
    {profile?.cover_photo && <Cover profile={profile} accent={accent} height={mobile?86:110} overlay="linear-gradient(to right,rgba(11,33,73,.22),transparent)"/>}
    <div style={{padding:"16px",display:"flex",alignItems:"center",gap:13,borderBottom:"1px solid #e2e8f0"}}>
      <Avatar profile={profile} size={68} radius={14}/>
      <div style={{flex:1}}><Identity profile={profile} accent={accent} compact/></div>
      {profile?.company_logo && <img src={profile.company_logo} alt="" style={{width:40,height:40,objectFit:"contain"}}/>}
    </div>
  </Shell>;
}

function Split({profile,accent,mobile,contentSections}) {
  return <Shell mobile={mobile} pageBg={`linear-gradient(160deg,${hexRgb(accent,.16)},#e5f3ef 50%,#f4fbf8)`} innerBg="linear-gradient(180deg,#f4fbf8,#e9f6f2)" contentSections={contentSections} contentPad="10px 14px 120px">
    <div style={{height:5,background:`linear-gradient(90deg,${accent},#0b2149)`}}/>
    {profile?.cover_photo && <Cover profile={profile} accent={accent} height={mobile?92:116} overlay={`linear-gradient(to right,${hexRgb(accent,.32)},transparent)`}/>}
    <div style={{display:"grid",gridTemplateColumns:"72px 1fr auto",gap:13,alignItems:"center",padding:"16px",borderBottom:"1px solid #e2e8f0",background:"#fff"}}>
      <Avatar profile={profile} size={68} radius={14}/>
      <Identity profile={profile} accent={accent} compact/>
      {profile?.company_logo && <img src={profile.company_logo} alt="" style={{width:36,height:36,objectFit:"contain"}}/>}
    </div>
  </Shell>;
}

export default function CanonicalProfileLayout({ profile, layout, accent, mobile=true, contentSections }) {
  const p={profile,accent,mobile,contentSections};
  switch(layout){
    case "minimal": return <Minimal {...p}/>;
    case "card": return <Card {...p}/>;
    case "image_hero": return <ImageHero {...p}/>;
    case "glassmorphic": return <Glass {...p}/>;
    case "dark": return <Dark {...p}/>;
    case "aurora": return <Aurora {...p}/>;
    case "magazine": return <Magazine {...p}/>;
    case "executive": return <Executive {...p}/>;
    case "premium_salon": return <Salon {...p}/>;
    case "modern_law": return <Law {...p}/>;
    case "corporate": return <Corporate {...p}/>;
    case "modern_saas": return <Split {...p}/>;
    default: return <Classic {...p}/>;
  }
}
