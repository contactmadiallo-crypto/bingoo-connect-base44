import { resolveProfileAppearance } from "@/lib/profileLayouts";

const radiusFor = (shape) => ({ circle:"50%", rounded:"18%", squircle:"28%", card:"12px" }[shape] || "50%");

function Avatar({ profile, size=54, border="3px solid #fff", radius }) {
  const r = radius ?? radiusFor(profile?.avatar_shape);
  if (profile?.profile_photo) {
    return <img src={profile.profile_photo} alt="" style={{width:size,height:size,borderRadius:r,objectFit:"cover",objectPosition:profile.avatar_position||"center top",border,boxShadow:"0 5px 16px rgba(15,23,42,.18)",flexShrink:0}}/>;
  }
  const accent = profile?.cover_color || "#f97316";
  return <div style={{width:size,height:size,borderRadius:r,background:accent,border,boxShadow:"0 5px 16px rgba(15,23,42,.18)",display:"grid",placeItems:"center",color:"#fff",fontWeight:900,fontSize:Math.round(size*.34),flexShrink:0}}>{(profile?.display_name||"?").charAt(0).toUpperCase()}</div>;
}

function Cover({ profile, accent, height=76, overlay=true }) {
  return <div style={{height,position:"relative",overflow:"hidden"}}>
    {profile?.cover_photo
      ? <img src={profile.cover_photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:profile.cover_position||"center",display:"block"}}/>
      : <div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${accent},#0b2149)`}}/>}
    {overlay && <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,23,42,.34),transparent 65%)"}}/>}
  </div>;
}

function Name({ profile, color="#0f172a", accent="#f97316", align="left", serif=false, small=false }) {
  return <div style={{minWidth:0,textAlign:align}}>
    <div style={{fontSize:small?13:14,fontWeight:900,lineHeight:1.05,color,fontFamily:serif?"Georgia,serif":"inherit",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile?.display_name||"Profile"}</div>
    {profile?.job_title && <div style={{marginTop:3,fontSize:8.5,fontWeight:800,color:accent,textTransform:serif?"none":"uppercase",letterSpacing:serif?0:".04em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.job_title}</div>}
    {profile?.company_name && <div style={{marginTop:2,fontSize:8,color:color==="white"?"rgba(255,255,255,.58)":"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.company_name}</div>}
  </div>;
}

function Lines({ accent, dark=false, count=3 }) {
  return <div style={{display:"grid",gap:6}}>
    {Array.from({length:count}).map((_,i)=><div key={i} style={{height:11,borderRadius:6,background:dark?"rgba(255,255,255,.08)":"rgba(255,255,255,.78)",border:dark?"1px solid rgba(255,255,255,.08)":"1px solid rgba(148,163,184,.20)",display:"flex",alignItems:"center",padding:"0 7px",gap:5}}>
      <span style={{width:5,height:5,borderRadius:2,background:accent,display:"block"}}/>
      <span style={{height:2.5,width:`${46+i*10}%`,borderRadius:3,background:dark?"rgba(255,255,255,.20)":"rgba(100,116,139,.24)",display:"block"}}/>
    </div>)}
  </div>;
}

export default function ProfileLayoutCardPreview({ profile, height=190, compact=false }) {
  const a = resolveProfileAppearance(profile);
  const layout = a.canonicalLayout;
  const accent = a.accent;
  const h = compact ? Math.min(height,168) : height;
  const base = {height:h,borderRadius:16,overflow:"hidden",position:"relative",background:a.recipe.defaultBackground};

  if (layout === "minimal") return <div style={{...base,background:"#fff",padding:"15px"}}>
    <div style={{height:4,background:accent,position:"absolute",top:0,left:0,right:0}}/>
    <div style={{display:"flex",gap:11,alignItems:"center",marginTop:8}}><Avatar profile={profile} size={50} radius={12}/><Name profile={profile} accent={accent}/></div>
    <div style={{marginTop:16}}><Lines accent={accent} count={3}/></div>
  </div>;

  if (layout === "card") return <div style={{...base,background:"#f1f5f9",paddingBottom:10}}>
    <Cover profile={profile} accent={accent} height={68}/>
    <div style={{margin:"-20px 10px 0",background:"#fff",borderRadius:14,padding:"9px",display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 22px rgba(15,23,42,.12)",position:"relative"}}>
      <Avatar profile={profile} size={44} radius={11}/><Name profile={profile} accent={accent} small/>
    </div>
    <div style={{margin:"9px 10px 0"}}><Lines accent={accent} count={2}/></div>
  </div>;

  if (layout === "image_hero") return <div style={{...base,background:"#0f172a"}}>
    <div style={{height:"100%",position:"relative"}}>
      {profile?.cover_photo?<img src={profile.cover_photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${accent},#0f172a)`}}/>}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(5,11,24,.92),rgba(5,11,24,.04) 68%)"}}/>
      <div style={{position:"absolute",left:13,right:13,bottom:12,display:"flex",alignItems:"end",gap:9}}><div style={{flex:1}}><Name profile={profile} color="white" accent="#fff"/></div><Avatar profile={profile} size={48}/></div>
    </div>
  </div>;

  if (layout === "glassmorphic") return <div style={{...base,background:`radial-gradient(circle at 20% 10%,${accent}55,transparent 38%),linear-gradient(145deg,#dbe4ff,#f8fafc)`,padding:14}}>
    <div style={{height:"100%",borderRadius:15,background:"rgba(255,255,255,.58)",backdropFilter:"blur(15px)",border:"1px solid rgba(255,255,255,.82)",display:"grid",placeItems:"center",padding:12}}>
      <div style={{textAlign:"center",width:"100%"}}><div style={{display:"flex",justifyContent:"center"}}><Avatar profile={profile} size={48}/></div><div style={{marginTop:7}}><Name profile={profile} align="center" accent={accent}/></div><div style={{marginTop:9}}><Lines accent={accent} count={2}/></div></div>
    </div>
  </div>;

  if (layout === "dark") return <div style={{...base,background:"#080c16",padding:16}}>
    <div style={{textAlign:"center"}}><div style={{display:"flex",justifyContent:"center"}}><Avatar profile={profile} size={54} border={`2px solid ${accent}`}/></div><div style={{marginTop:8}}><Name profile={profile} color="white" align="center" accent={accent}/></div></div>
    <div style={{marginTop:13}}><Lines accent={accent} dark count={3}/></div>
  </div>;

  if (layout === "aurora") return <div style={{...base,background:"linear-gradient(155deg,#07111f,#15204a 45%,#0f766e)",padding:14}}>
    <div style={{position:"absolute",width:120,height:120,borderRadius:"50%",background:`radial-gradient(circle,${accent}66,transparent 68%)`,top:-52,left:-20}}/>
    <div style={{position:"relative",textAlign:"center"}}><div style={{display:"flex",justifyContent:"center"}}><Avatar profile={profile} size={52}/></div><div style={{marginTop:7}}><Name profile={profile} color="white" accent="#67e8f9" align="center"/></div><div style={{marginTop:11}}><Lines accent="#22d3ee" dark count={2}/></div></div>
  </div>;

  if (layout === "magazine") return <div style={{...base,background:"#fffdf7"}}>
    <Cover profile={profile} accent={accent} height={78}/>
    <div style={{display:"grid",gridTemplateColumns:"52px 1fr",gap:9,padding:"10px 12px"}}><Avatar profile={profile} size={48} radius={4}/><div><div style={{fontSize:7,fontWeight:900,letterSpacing:".13em",color:accent,marginBottom:4}}>PROFILE / EDITION</div><Name profile={profile} accent={accent} serif/></div></div>
  </div>;

  if (layout === "executive") return <div style={{...base,background:"#0d1728",borderTop:`4px solid ${accent}`,display:"grid",gridTemplateColumns:"1fr 88px"}}>
    <div style={{padding:"22px 13px",display:"flex",alignItems:"center"}}><Name profile={profile} color="white" accent={accent}/></div>
    <div style={{background:"#172338",overflow:"hidden"}}>{profile?.profile_photo?<img src={profile.profile_photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>:<div style={{height:"100%",display:"grid",placeItems:"center"}}><Avatar profile={profile} size={52}/></div>}</div>
  </div>;

  if (layout === "premium_salon") return <div style={{...base,background:"linear-gradient(160deg,#1b0b16,#3a1730)"}}>
    <Cover profile={profile} accent={accent} height={72}/>
    <div style={{textAlign:"center",marginTop:-24,position:"relative",padding:"0 12px"}}><div style={{display:"flex",justifyContent:"center"}}><Avatar profile={profile} size={52} border="3px solid #1b0b16"/></div><div style={{marginTop:6}}><Name profile={profile} color="white" accent="#f9a8d4" align="center" serif/></div><div style={{marginTop:9}}><Lines accent="#ec4899" dark count={2}/></div></div>
  </div>;

  if (layout === "modern_law") return <div style={{...base,background:"#f8fafc"}}>
    <div style={{background:"#0b172a",height:102,padding:"15px 13px",borderTop:`4px solid ${accent}`,display:"flex",alignItems:"center",gap:10}}><div style={{flex:1}}><Name profile={profile} color="white" accent={accent} serif/></div><Avatar profile={profile} size={50} radius={5} border={`1px solid ${accent}`}/></div>
    <div style={{padding:"10px 12px"}}><Lines accent={accent} count={2}/></div>
  </div>;

  if (layout === "corporate") return <div style={{...base,background:"#fff"}}>
    <div style={{height:5,background:`linear-gradient(90deg,${accent},#0b2149)`}}/>
    {profile?.cover_photo && <Cover profile={profile} accent={accent} height={55}/>}
    <div style={{display:"flex",gap:9,alignItems:"center",padding:"10px 12px",borderBottom:"1px solid #e2e8f0"}}><Avatar profile={profile} size={46} radius={10}/><div style={{flex:1}}><Name profile={profile} accent={accent}/></div>{profile?.company_logo&&<img src={profile.company_logo} alt="" style={{width:28,height:28,objectFit:"contain"}}/>}</div>
    <div style={{padding:"8px 12px"}}><Lines accent={accent} count={2}/></div>
  </div>;

  if (layout === "modern_saas") return <div style={{...base,background:"#fff"}}>
    <div style={{height:5,background:`linear-gradient(90deg,${accent},#0b2149)`}}/>
    {profile?.cover_photo && <Cover profile={profile} accent={accent} height={58}/>}
    <div style={{display:"grid",gridTemplateColumns:"48px 1fr auto",gap:9,alignItems:"center",padding:"10px 12px",borderBottom:"1px solid #e2e8f0"}}><Avatar profile={profile} size={46} radius={10}/><Name profile={profile} accent={accent}/>{profile?.company_logo&&<img src={profile.company_logo} alt="" style={{width:26,height:26,objectFit:"contain"}}/>}</div>
    <div style={{padding:"8px 12px"}}><Lines accent={accent} count={2}/></div>
  </div>;

  if (layout === "ny_championship") return <div style={{...base,background:"#070b16",padding:13}}>
    <div style={{fontSize:7,fontWeight:900,color:"#f97316",letterSpacing:".12em",textAlign:"center"}}>🏆 NY FINALS EDITION 🏀</div>
    <div style={{display:"flex",justifyContent:"center",marginTop:8}}><Avatar profile={profile} size={52} border="2px solid #f97316"/></div>
    <div style={{marginTop:7}}><Name profile={profile} color="white" accent="#f97316" align="center"/></div>
    <div style={{marginTop:10}}><Lines accent="#f97316" dark count={2}/></div>
  </div>;

  if (layout === "lions_teranga") return <div style={{...base,background:"linear-gradient(160deg,#063f2d,#0b5b3f)",padding:13}}>
    <div style={{fontSize:7,fontWeight:900,color:"#D4AF37",letterSpacing:".11em",textAlign:"center"}}>🇸🇳 LIONS DE LA TÉRANGA 🦁</div>
    <div style={{display:"flex",justifyContent:"center",marginTop:8}}><Avatar profile={profile} size={52} border="2px solid #D4AF37"/></div>
    <div style={{marginTop:7}}><Name profile={profile} color="white" accent="#D4AF37" align="center"/></div>
    <div style={{marginTop:10}}><Lines accent="#D4AF37" dark count={2}/></div>
  </div>;

  return <div style={{...base,background:"#fff"}}>
    <Cover profile={profile} accent={accent} height={78}/>
    <div style={{textAlign:"center",marginTop:-25,position:"relative",padding:"0 12px"}}><div style={{display:"flex",justifyContent:"center"}}><Avatar profile={profile} size={54}/></div><div style={{marginTop:6}}><Name profile={profile} accent={accent} align="center"/></div><div style={{marginTop:10}}><Lines accent={accent} count={2}/></div></div>
  </div>;
}
