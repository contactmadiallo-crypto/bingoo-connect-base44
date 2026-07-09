import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Send, Upload, Sparkles, ArrowRight, CheckCircle, PenLine } from "lucide-react";
import { ACCOUNT_TYPES, BUSINESS_TYPES } from "@/lib/accountTypes";

// ── User types — split by account group
const INDIVIDUAL_TYPES = [
  { id: "individual",  label: "Professional",  emoji: "👤", desc: "Personal branding & networking" },
  { id: "consultant",  label: "Consultant",   emoji: "💼", desc: "Business & professional services" },
  { id: "realtor",     label: "Realtor",       emoji: "🏠", desc: "Real estate & property" },
  { id: "student",     label: "Student",      emoji: "🎓", desc: "Academic & career profile" },
  { id: "job_seeker",  label: "Job Seeker",   emoji: "📄", desc: "Resume & career profile" },
];

const BUSINESS_TYPES_LIST = [
  { id: "lawyer",      label: "Law Firm",     emoji: "⚖️", desc: "Law firm & legal services" },
  { id: "salon",       label: "Salon",        emoji: "💇", desc: "Hair, beauty & wellness" },
  { id: "restaurant",  label: "Restaurant",   emoji: "🍽️", desc: "Food, drinks & hospitality" },
  { id: "consultant",  label: "Agency",       emoji: "📣", desc: "Agency & professional services" },
  { id: "individual",  label: "General Biz",  emoji: "🏢", desc: "Other business type" },
];

// Combined for legacy use
const USER_TYPES = [...INDIVIDUAL_TYPES, ...BUSINESS_TYPES_LIST];

// ── Questions per type
const QUESTIONS = {
  individual: [
    { key: "full_name",    q: "What's your full name?" },
    { key: "title",        q: "What's your professional title or role? (e.g. Photographer, Coach, Freelancer)" },
    { key: "bio",          q: "Tell me a bit about yourself — what do you do and who do you help?" },
    { key: "phone",        q: "What's the best phone number to reach you?" },
    { key: "email",        q: "Your email address?" },
    { key: "location",     q: "Where are you based? (City, Country)" },
    { key: "instagram",    q: "Do you have an Instagram? Share the full URL, or type 'skip'." },
    { key: "linkedin",     q: "LinkedIn profile URL? (or 'skip')" },
    { key: "website",      q: "Do you have a personal website or portfolio? (or 'skip')" },
  ],
  lawyer: [
    { key: "full_name",    q: "What's your full name and title? (e.g. John Smith, Esq.)" },
    { key: "firm_name",    q: "What's the name of your law firm?" },
    { key: "practice",     q: "What are your practice areas? (e.g. Family Law, Criminal Defense, Corporate)" },
    { key: "bio",          q: "Write a short professional bio for your profile." },
    { key: "phone",        q: "Office phone number?" },
    { key: "email",        q: "Professional email address?" },
    { key: "location",     q: "Office address or city?" },
    { key: "linkedin",     q: "LinkedIn profile URL? (or 'skip')" },
    { key: "website",      q: "Law firm website URL? (or 'skip')" },
    { key: "booking",      q: "Would you like clients to book consultations directly from your profile? (yes/no)" },
  ],
  salon: [
    { key: "full_name",    q: "What's the name of your salon or your personal name?" },
    { key: "salon_name",   q: "Business name? (e.g. Glam Studio, Cuts & Colors)" },
    { key: "services",     q: "List your main services (e.g. Haircuts, Coloring, Braids, Nails)" },
    { key: "bio",          q: "Describe your salon in 1-2 sentences." },
    { key: "phone",        q: "Booking phone number?" },
    { key: "email",        q: "Email address?" },
    { key: "location",     q: "Salon address or neighborhood?" },
    { key: "instagram",    q: "Instagram URL to showcase your work? (or 'skip')" },
    { key: "booking",      q: "Would you like clients to book appointments online? (yes/no)" },
  ],
  restaurant: [
    { key: "full_name",    q: "What's the restaurant or owner's name?" },
    { key: "restaurant_name", q: "Restaurant name?" },
    { key: "cuisine",      q: "What type of cuisine do you serve?" },
    { key: "bio",          q: "Describe your restaurant in 1-2 sentences." },
    { key: "phone",        q: "Reservation/contact phone?" },
    { key: "email",        q: "Contact email?" },
    { key: "location",     q: "Restaurant address?" },
    { key: "website",      q: "Do you have a website or online menu? (or 'skip')" },
    { key: "instagram",    q: "Instagram page URL? (or 'skip')" },
    { key: "booking",      q: "Do you want customers to book tables from your profile? (yes/no)" },
  ],
  consultant: [
    { key: "full_name",    q: "Your full name?" },
    { key: "title",        q: "Your consulting title? (e.g. Business Consultant, Marketing Strategist)" },
    { key: "company",      q: "Company or firm name? (or your name if independent)" },
    { key: "services",     q: "What services do you offer? List them." },
    { key: "bio",          q: "Professional bio in 2-3 sentences." },
    { key: "phone",        q: "Contact phone number?" },
    { key: "email",        q: "Professional email?" },
    { key: "location",     q: "City or region you serve?" },
    { key: "linkedin",     q: "LinkedIn URL? (or 'skip')" },
    { key: "website",      q: "Website URL? (or 'skip')" },
    { key: "booking",      q: "Want clients to book strategy calls directly? (yes/no)" },
  ],
  realtor: [
    { key: "full_name",    q: "Your full name?" },
    { key: "agency",       q: "Which real estate agency or brokerage do you work for?" },
    { key: "specialties",  q: "What are your specialties? (e.g. Residential, Luxury Homes, Commercial, Rentals)" },
    { key: "bio",          q: "Your realtor bio in 2-3 sentences." },
    { key: "phone",        q: "Mobile phone number?" },
    { key: "email",        q: "Professional email?" },
    { key: "location",     q: "City/area you serve?" },
    { key: "instagram",    q: "Instagram URL for property listings? (or 'skip')" },
    { key: "linkedin",     q: "LinkedIn URL? (or 'skip')" },
    { key: "website",      q: "Agency website or personal site? (or 'skip')" },
    { key: "booking",      q: "Want prospects to book property viewings from your profile? (yes/no)" },
  ],
  student: [
    { key: "full_name",    q: "Your full name?" },
    { key: "school",       q: "What school or university do you attend?" },
    { key: "major",        q: "What's your major or field of study?" },
    { key: "year",         q: "What year are you in? (e.g. Sophomore, Senior, Graduate)" },
    { key: "bio",          q: "Tell me about yourself and your goals." },
    { key: "skills",       q: "What skills do you have? (e.g. Python, Graphic Design, Marketing)" },
    { key: "email",        q: "Your email address?" },
    { key: "linkedin",     q: "LinkedIn URL? (or 'skip')" },
    { key: "portfolio",    q: "Portfolio or project website? (or 'skip')" },
  ],
  job_seeker: [
    { key: "full_name",    q: "Your full name?" },
    { key: "title",        q: "Your current or desired job title?" },
    { key: "bio",          q: "A short professional summary (2-3 sentences)." },
    { key: "skills",       q: "List your top skills." },
    { key: "experience",   q: "Briefly describe your most recent or key experience." },
    { key: "education",    q: "Your highest education level and field?" },
    { key: "phone",        q: "Contact phone number?" },
    { key: "email",        q: "Email address?" },
    { key: "location",     q: "City you're based in or open to?" },
    { key: "linkedin",     q: "LinkedIn URL? (or 'skip')" },
    { key: "resume",       q: "Would you like to upload your resume? I'll extract everything automatically! (yes / skip)" },
  ],
};

// ── Generate profile data from collected answers using LLM
async function generateProfileFromAnswers(userType, answers) {
  const context = Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join("\n");
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a professional profile writer for Bingoo Connect, a digital business card platform.
Based on the following information from a ${userType}, generate a complete professional profile.

User Information:
${context}

Generate a JSON response with these exact fields:
- display_name: Full professional name
- job_title: Professional title (concise, 3-6 words)
- company_name: Company/business name (if applicable, else empty string)
- bio: Professional bio (2-4 sentences, engaging, written in first person)
- email: Email from answers
- phone: Phone from answers
- location: Location from answers
- website: Website URL (or empty string)
- instagram_url: Instagram URL (or empty string)
- facebook_url: Facebook URL (or empty string)
- linkedin_url: LinkedIn URL (or empty string)
- tiktok_url: TikTok URL (or empty string)
- youtube_url: YouTube URL (or empty string)
- booking_enabled: true if booking was requested, false otherwise
- services_description: A brief description of services offered (2-3 sentences, or empty string)
- suggested_username: lowercase letters/numbers/underscore only, based on their name (max 20 chars)

Return ONLY valid JSON, no markdown, no explanation.`,
    response_json_schema: {
      type: "object",
      properties: {
        display_name: { type: "string" },
        job_title: { type: "string" },
        company_name: { type: "string" },
        bio: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        website: { type: "string" },
        instagram_url: { type: "string" },
        facebook_url: { type: "string" },
        linkedin_url: { type: "string" },
        tiktok_url: { type: "string" },
        youtube_url: { type: "string" },
        booking_enabled: { type: "boolean" },
        services_description: { type: "string" },
        suggested_username: { type: "string" },
      },
    },
  });
  return res;
}

// ── Extract data from resume text
async function extractFromResume(resumeText) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `Extract structured professional data from this resume text and return as JSON.

Resume:
${resumeText.slice(0, 4000)}

Return JSON with:
- display_name: Full name
- job_title: Current or most recent title
- bio: Professional summary (2-3 sentences, first person)
- skills: Comma-separated list of top skills
- experience: Most recent role and company
- education: Highest degree and institution
- email: Email address if found
- phone: Phone if found
- location: City/location if found
- linkedin_url: LinkedIn URL if found
- suggested_username: lowercase username from name

Return ONLY valid JSON.`,
    response_json_schema: {
      type: "object",
      properties: {
        display_name: { type: "string" },
        job_title: { type: "string" },
        bio: { type: "string" },
        skills: { type: "string" },
        experience: { type: "string" },
        education: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        linkedin_url: { type: "string" },
        suggested_username: { type: "string" },
      },
    },
  });
  return res;
}

// ── Chat bubble
function Bubble({ msg, isAI }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", justifyContent: isAI ? "flex-start" : "flex-end", marginBottom: 12 }}
    >
      {isAI && (
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0b2149,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 2 }}>✦</div>
      )}
      <div style={{
        maxWidth: "78%", padding: "12px 16px", borderRadius: isAI ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
        background: isAI ? "#f1f5f9" : "linear-gradient(135deg,#0b2149,#13284f)",
        color: isAI ? "#1e293b" : "#fff",
        fontSize: 14, lineHeight: 1.6, fontWeight: 500,
        boxShadow: isAI ? "0 2px 8px rgba(0,0,0,0.06)" : "0 4px 16px rgba(11,33,73,0.35)",
      }}>
        {msg}
      </div>
    </motion.div>
  );
}

// ── Main component
export default function AIOnboardingAssistant({ userName, user, onComplete, onDismiss }) {
  const [phase, setPhase] = useState("welcome"); // welcome | account_type | type | chat | resume | generating | review | manual
  const [selectedAccountType, setSelectedAccountType] = useState(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState(null);
  const [manualForm, setManualForm] = useState({ display_name: "", suggested_username: "", job_title: "", company_name: "", bio: "", phone: "", email: "", location: "", website: "", linkedin_url: "", instagram_url: "" });
  const [userType, setUserType] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [generatedProfile, setGeneratedProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (text, isAI = true) => {
    setMessages(prev => [...prev, { text, isAI }]);
  };

  const startChat = (type) => {
    setUserType(type);
    setPhase("chat");
    setQIndex(0);
    setAnswers({});
    const questions = QUESTIONS[type] || QUESTIONS.individual;
    addMessage(`Great choice! I'll help you build a perfect ${USER_TYPES.find(u => u.id === type)?.label} profile. Let's start — this only takes about 2 minutes. 🚀`);
    setTimeout(() => addMessage(questions[0].q), 600);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMessage(text, false);

    const questions = QUESTIONS[userType] || QUESTIONS.individual;
    const currentQ = questions[qIndex];

    // Check for resume upload trigger
    if (currentQ?.key === "resume" && text.toLowerCase() === "yes") {
      setPhase("resume");
      addMessage("Perfect! Please upload your resume file (PDF or text). I'll extract everything automatically.");
      return;
    }

    const newAnswers = { ...answers, [currentQ.key]: text };
    setAnswers(newAnswers);

    const nextIndex = qIndex + 1;

    if (nextIndex < questions.length) {
      setQIndex(nextIndex);
      setTimeout(() => addMessage(questions[nextIndex].q), 400);
    } else {
      // All answered — generate
      addMessage("Amazing! I have everything I need. Let me generate your professional profile now... ✨");
      setGenerating(true);
      setPhase("generating");
      try {
        const result = await generateProfileFromAnswers(userType, newAnswers);
        const profile = typeof result === "string" ? JSON.parse(result) : result;
        setGeneratedProfile(profile);
        setEditedProfile(profile);
        setPhase("review");
      } catch (e) {
        addMessage("Hmm, something went wrong. Let me try again...");
        setPhase("chat");
      }
      setGenerating(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeUploading(true);
    addMessage(`Uploading "${file.name}"...`, false);
    try {
      const text = await file.text();
      setResumeText(text);
      addMessage("Got it! Extracting your information from the resume... 🔍");
      const result = await extractFromResume(text);
      const profile = typeof result === "string" ? JSON.parse(result) : result;
      setGeneratedProfile(profile);
      setEditedProfile(profile);
      setPhase("review");
      addMessage("Your profile has been generated from your resume! Review and edit it below.");
    } catch (e) {
      addMessage("Couldn't read the file. Please try a plain text or PDF file.");
      setPhase("chat");
    }
    setResumeUploading(false);
  };

  const handlePublish = async () => {
    localStorage.setItem("bingoo_onboarding_done", "1");
    // If this was a job seeker or resume-based profile, also save as a Resume record
    if (userType === "job_seeker" || userType === "student" || resumeText) {
      try {
        await base44.entities.Resume.create({
          display_name: editedProfile.display_name || "",
          job_title: editedProfile.job_title || "",
          bio: editedProfile.bio || "",
          skills: editedProfile.skills || answers.skills || "",
          experience: editedProfile.experience || answers.experience || "",
          education: editedProfile.education || answers.education || "",
          email: editedProfile.email || "",
          phone: editedProfile.phone || "",
          location: editedProfile.location || "",
          linkedin_url: editedProfile.linkedin_url || "",
          website: editedProfile.website || "",
          company_name: editedProfile.company_name || "",
          is_public: true,
          attached_to_profile: false,
          source: resumeText ? "resume_upload" : "ai_chat",
        });
      } catch (e) {
        // non-blocking
      }
    }
    onComplete(editedProfile);
  };

  const handleDismiss = () => {
    localStorage.setItem("bingoo_onboarding_done", "1");
    onDismiss();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: "#fff", borderRadius: 28, width: "100%", maxWidth: 520, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0b2149, #13284f)", padding: "18px 22px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 15, margin: 0 }}>Bingoo AI Assistant</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, margin: 0, fontWeight: 600 }}>
              {phase === "welcome" && "Let's build your digital profile"}
              {phase === "account_type" && "Choose your account type"}
              {phase === "type" && "Select your profile type"}
              {(phase === "chat" || phase === "resume") && `${userType ? USER_TYPES.find(u => u.id === userType)?.label : ""} profile`}
              {phase === "generating" && "Generating your profile..."}
              {phase === "review" && "Review & publish"}
              {phase === "manual" && "Manual profile setup"}
            </p>
          </div>
          <button onClick={handleDismiss} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>
            <X size={15} />
          </button>
        </div>

        {/* Progress bar */}
        {(phase === "chat") && userType && (
          <div style={{ height: 3, background: "#f1f5f9" }}>
            <motion.div
              style={{ height: "100%", background: "linear-gradient(90deg,#0b2149,#f97316)", borderRadius: 999 }}
              animate={{ width: `${((qIndex) / (QUESTIONS[userType]?.length || 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 8px" }}>

          {/* WELCOME phase */}
          {phase === "welcome" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "28px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🤖</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>
                Hi{userName ? `, ${userName.split(" ")[0]}` : ""}! 👋
              </h2>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
                I'm your Bingoo AI assistant. I'll ask you a few quick questions and <strong>automatically build your entire digital business card</strong> — bio, contact info, services, and more.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
                {[{ e: "💬", t: "Quick chat" }, { e: "✨", t: "AI generates" }, { e: "🚀", t: "Go live" }].map(item => (
                  <div key={item.t} style={{ padding: "14px 8px", borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{item.e}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{item.t}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPhase("account_type")}
                style={{ width: "100%", padding: "15px", borderRadius: 16, background: "linear-gradient(135deg,#0b2149,#13284f)", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(11,33,73,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Sparkles size={18} /> Get Started
              </button>
              <button onClick={() => setPhase("manual")} style={{ marginTop: 10, background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>
                Fill in manually instead
              </button>
            </motion.div>
          )}

          {/* ACCOUNT TYPE SELECTION */}
          {phase === "account_type" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "24px 20px 8px" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 6, textAlign: "center" }}>How will you use Bingoo?</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 18, textAlign: "center" }}>This helps us tailor your experience.</p>

              {/* Individual / Business toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                {ACCOUNT_TYPES.map(t => (
                  <button key={t.id} onClick={() => { setSelectedAccountType(t.id); if (t.id === "individual") setSelectedBusinessType(null); }}
                    style={{
                      padding: "18px 12px", borderRadius: 18, border: `2px solid ${selectedAccountType === t.id ? "#0b2149" : "#e2e8f0"}`,
                      background: selectedAccountType === t.id ? "rgba(11,33,73,0.06)" : "#f8fafc",
                      cursor: "pointer", textAlign: "center", transition: "all 0.2s"
                    }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{t.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: selectedAccountType === t.id ? "#0b2149" : "#1e293b" }}>{t.label}</div>
                  </button>
                ))}
              </div>

              {/* Business type — shown only when business selected */}
              {selectedAccountType === "business" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Business Type</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                    {BUSINESS_TYPES.map(t => (
                      <button key={t.id} onClick={() => setSelectedBusinessType(t.id)}
                        style={{
                          padding: "12px 8px", borderRadius: 14, border: `2px solid ${selectedBusinessType === t.id ? "#f97316" : "#e2e8f0"}`,
                          background: selectedBusinessType === t.id ? "rgba(249,115,22,0.06)" : "#f8fafc",
                          cursor: "pointer", textAlign: "center", transition: "all 0.2s"
                        }}>
                        <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: 11, color: selectedBusinessType === t.id ? "#c2410c" : "#475569" }}>{t.label}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TYPE SELECTION — filtered by selected account type */}
          {phase === "type" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "20px 20px 8px" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#475569", marginBottom: 14, textAlign: "center" }}>What best describes you?</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(selectedAccountType === "business" ? BUSINESS_TYPES_LIST : INDIVIDUAL_TYPES).map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startChat(type.id)}
                    style={{ padding: "14px 12px", borderRadius: 18, background: "#f8fafc", border: "2px solid #e2e8f0", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{type.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{type.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, lineHeight: 1.4 }}>{type.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* CHAT phase */}
          {(phase === "chat" || phase === "resume") && (
            <div style={{ padding: "16px 16px 0" }}>
              {messages.map((msg, i) => <Bubble key={i} msg={msg.text} isAI={msg.isAI} />)}
              {phase === "resume" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "16px", borderRadius: 16, background: "#f0f9ff", border: "2px dashed #0284c7", textAlign: "center", marginBottom: 12 }}>
                  <Upload size={24} style={{ color: "#0284c7", margin: "0 auto 8px", display: "block" }} />
                  <label style={{ cursor: "pointer", display: "block" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0284c7" }}>{resumeUploading ? "Processing..." : "Click to upload your resume"}</span>
                    <br /><span style={{ fontSize: 11, color: "#64748b" }}>PDF or TXT file</span>
                    <input type="file" accept=".pdf,.txt,.doc,.docx" style={{ display: "none" }} onChange={handleResumeUpload} disabled={resumeUploading} />
                  </label>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* GENERATING */}
          {phase === "generating" && (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{ width: 56, height: 56, borderRadius: "50%", border: "4px solid #e2e8f0", borderTopColor: "#0b2149", margin: "0 auto 20px" }}
              />
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>Building your profile...</h3>
              <p style={{ color: "#64748b", fontSize: 13 }}>AI is writing your bio, generating content & setting up your card.</p>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, maxWidth: 280, margin: "20px auto 0" }}>
                {["Writing professional bio...", "Setting up contact info...", "Configuring services..."].map((t, i) => (
                  <motion.div key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.6 }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#f8fafc", fontSize: 12, color: "#475569", fontWeight: 600 }}>
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.4 }}
                      style={{ width: 8, height: 8, borderRadius: "50%", background: "#0b2149", flexShrink: 0 }} />
                    {t}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEW phase */}
          {phase === "review" && editedProfile && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "20px 20px 8px" }}>
              <div style={{ padding: "12px 16px", borderRadius: 14, background: "linear-gradient(135deg,rgba(11,33,73,0.07),rgba(249,115,22,0.05))", border: "1px solid rgba(11,33,73,0.15)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: "#475569", margin: 0, fontWeight: 600 }}>Your profile has been generated! Review and edit below, then publish.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { key: "display_name", label: "Full Name *", multi: false },
                  { key: "suggested_username", label: "Username (URL slug) *", multi: false },
                  { key: "job_title", label: "Job Title", multi: false },
                  { key: "company_name", label: "Company / Business Name", multi: false },
                  { key: "bio", label: "Bio", multi: true },
                  { key: "phone", label: "Phone", multi: false },
                  { key: "email", label: "Email", multi: false },
                  { key: "location", label: "Location", multi: false },
                  { key: "website", label: "Website URL", multi: false },
                  { key: "linkedin_url", label: "LinkedIn URL", multi: false },
                  { key: "instagram_url", label: "Instagram URL", multi: false },
                ].map(({ key, label, multi }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>{label}</label>
                    {multi ? (
                      <textarea
                        rows={3}
                        value={editedProfile[key] || ""}
                        onChange={e => setEditedProfile(p => ({ ...p, [key]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 500, color: "#1e293b", resize: "vertical", outline: "none", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}
                      />
                    ) : (
                      <input
                        value={editedProfile[key] || ""}
                        onChange={e => setEditedProfile(p => ({ ...p, [key]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 500, color: "#1e293b", outline: "none", background: "#fff", boxSizing: "border-box" }}
                      />
                    )}
                  </div>
                ))}

                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: editedProfile.booking_enabled ? "#f0fdf4" : "#f8fafc", border: `1.5px solid ${editedProfile.booking_enabled ? "#bbf7d0" : "#e2e8f0"}`, cursor: "pointer" }}
                  onClick={() => setEditedProfile(p => ({ ...p, booking_enabled: !p.booking_enabled }))}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: editedProfile.booking_enabled ? "#16a34a" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {editedProfile.booking_enabled && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: editedProfile.booking_enabled ? "#166534" : "#64748b" }}>Enable appointment booking</span>
                </div>
              </div>
            </motion.div>
          )}
          {/* MANUAL phase */}
          {phase === "manual" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "20px 20px 8px" }}>
              <div style={{ padding: "12px 16px", borderRadius: 14, background: "#f0f9ff", border: "1px solid #bae6fd", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <PenLine size={16} style={{ color: "#0284c7", flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: "#0369a1", margin: 0, fontWeight: 600 }}>Fill in your profile details below. Only name and username are required.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { key: "display_name", label: "Full Name *", placeholder: "Jane Smith", multi: false },
                  { key: "suggested_username", label: "Username (your profile URL) *", placeholder: "janesmith", multi: false },
                  { key: "job_title", label: "Job Title", placeholder: "Marketing Manager", multi: false },
                  { key: "company_name", label: "Company / Business Name", placeholder: "Acme Corp", multi: false },
                  { key: "bio", label: "Short Bio", placeholder: "Tell people what you do and who you help...", multi: true },
                  { key: "phone", label: "Phone Number", placeholder: "+1 555 000 0000", multi: false },
                  { key: "email", label: "Email Address", placeholder: "jane@example.com", multi: false },
                  { key: "location", label: "Location", placeholder: "New York, USA", multi: false },
                  { key: "website", label: "Website URL", placeholder: "https://yoursite.com", multi: false },
                  { key: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/...", multi: false },
                  { key: "instagram_url", label: "Instagram URL", placeholder: "https://instagram.com/...", multi: false },
                ].map(({ key, label, placeholder, multi }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>{label}</label>
                    {multi ? (
                      <textarea
                        rows={3}
                        placeholder={placeholder}
                        value={manualForm[key] || ""}
                        onChange={e => setManualForm(p => ({ ...p, [key]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 500, color: "#1e293b", resize: "vertical", outline: "none", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}
                      />
                    ) : (
                      <input
                        placeholder={placeholder}
                        value={manualForm[key] || ""}
                        onChange={e => {
                          let val = e.target.value;
                          if (key === "suggested_username") val = val.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
                          setManualForm(p => ({ ...p, [key]: val }));
                        }}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 500, color: "#1e293b", outline: "none", background: "#fff", boxSizing: "border-box" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Chat input */}
        {phase === "chat" && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Type your answer..."
                style={{ flex: 1, padding: "12px 14px", borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", background: "#f8fafc", fontFamily: "inherit" }}
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{ width: 46, height: 46, borderRadius: 14, background: input.trim() ? "linear-gradient(135deg,#0b2149,#13284f)" : "#e2e8f0", border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}
              >
                <Send size={18} style={{ color: input.trim() ? "#fff" : "#94a3b8" }} />
              </button>
            </div>
          </div>
        )}

        {/* Publish footer */}
        {phase === "review" && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 10 }}>
            <button onClick={handleDismiss} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#f1f5f9", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#475569" }}>
              Edit Manually
            </button>
            <button
              onClick={handlePublish}
              disabled={!editedProfile?.display_name || !editedProfile?.suggested_username}
              style={{ flex: 2, padding: "13px", borderRadius: 14, background: "linear-gradient(135deg,#0b2149,#13284f)", border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(11,33,73,0.4)", opacity: (!editedProfile?.display_name || !editedProfile?.suggested_username) ? 0.5 : 1 }}
            >
              <ArrowRight size={16} /> Publish My Profile
            </button>
          </div>
        )}

        {/* Account type footer */}
        {phase === "account_type" && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 10 }}>
            <button onClick={() => setPhase("welcome")} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#f1f5f9", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#475569" }}>
              ← Back
            </button>
            <button
              disabled={!selectedAccountType || (selectedAccountType === "business" && !selectedBusinessType)}
              onClick={async () => {
                // Save account_type (and optionally business_type) to the user record non-blockingly
                const updates = { account_type: selectedAccountType };
                if (selectedAccountType === "business" && selectedBusinessType) updates.business_type = selectedBusinessType;
                try { await base44.auth.updateMe(updates); } catch (e) { /* non-blocking */ }
                setPhase("type");
              }}
              style={{
                flex: 2, padding: "13px", borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 800,
                fontSize: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "linear-gradient(135deg,#0b2149,#13284f)",
                boxShadow: "0 8px 24px rgba(11,33,73,0.4)",
                opacity: (!selectedAccountType || (selectedAccountType === "business" && !selectedBusinessType)) ? 0.45 : 1
              }}
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Manual entry footer */}
        {phase === "manual" && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 10 }}>
            <button onClick={() => setPhase("welcome")} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#f1f5f9", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#475569" }}>
              ← Back
            </button>
            <button
              onClick={() => { localStorage.setItem("bingoo_onboarding_done", "1"); onComplete(manualForm); }}
              disabled={!manualForm.display_name || !manualForm.suggested_username}
              style={{ flex: 2, padding: "13px", borderRadius: 14, background: "linear-gradient(135deg,#0b2149,#13284f)", border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(11,33,73,0.4)", opacity: (!manualForm.display_name || !manualForm.suggested_username) ? 0.5 : 1 }}
            >
              <ArrowRight size={16} /> Create My Profile
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}