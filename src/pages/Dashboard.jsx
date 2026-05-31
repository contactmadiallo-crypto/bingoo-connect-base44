import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ExternalLink, Copy, Eye, BarChart3, User, LogOut, Check, Smartphone, Settings
} from "lucide-react";
import AnalyticsPanel from "@/components/bingoo/AnalyticsPanel";

const COVER_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#d97706", "#16a34a", "#0891b2", "#dc2626", "#1e293b"];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    username: "", display_name: "", job_title: "", company_name: "", bio: "",
    cover_color: "#2563eb", phone: "", whatsapp_number: "", email: "", website: "",
    location: "", facebook_url: "", instagram_url: "", tiktok_url: "",
    linkedin_url: "", youtube_url: "", payment_link: "",
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, email: u.email || "", display_name: u.full_name || "" }));
    }).catch(() => base44.auth.redirectToLogin()).finally(() => setLoading(false));
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || "",
        display_name: profile.display_name || "",
        job_title: profile.job_title || "",
        company_name: profile.company_name || "",
        bio: profile.bio || "",
        cover_color: profile.cover_color || "#2563eb",
        phone: profile.phone || "",
        whatsapp_number: profile.whatsapp_number || "",
        email: profile.email || "",
        website: profile.website || "",
        location: profile.location || "",
        facebook_url: profile.facebook_url || "",
        instagram_url: profile.instagram_url || "",
        tiktok_url: profile.tiktok_url || "",
        linkedin_url: profile.linkedin_url || "",
        youtube_url: profile.youtube_url || "",
        payment_link: profile.payment_link || "",
      });
    }
  }, [profile?.id]);

  const saveProfile = useMutation({
    mutationFn: () => profile
      ? base44.entities.Profile.update(profile.id, { ...form, is_active: true })
      : base44.entities.Profile.create({ ...form, is_active: true, plan: "free" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile saved!");
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${profile?.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const profileUrl = `${window.location.origin}/p/${profile?.username}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&color=1e293b`;

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="font-black text-slate-900">Bingoo<span className="text-blue-600">Connect</span></span>
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 hidden sm:flex">Dashboard</Badge>
          </div>
          <div className="flex items-center gap-2">
            {profile && (
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Eye className="w-3.5 h-3.5" /> View Profile
                </Button>
              </a>
            )}
            <Button variant="ghost" size="sm" onClick={() => base44.auth.logout()} className="text-slate-400 hover:text-red-500">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome bar */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">
            Hello, {user?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
          {profile ? (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-slate-500 text-sm">Your profile:</p>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                /p/{profile.username} <ExternalLink className="w-3 h-3" />
              </a>
              <button onClick={copyLink} className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg px-2 py-1 transition-colors">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          ) : (
            <p className="text-slate-500 text-sm mt-1">Set up your profile to get your shareable link.</p>
          )}
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 bg-white border border-slate-100">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"><Smartphone className="w-4 h-4" /> Overview</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"><Settings className="w-4 h-4" /> Edit Profile</TabsTrigger>
            <TabsTrigger value="analytics" disabled={!profile} className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"><BarChart3 className="w-4 h-4" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile preview card */}
              <Card className="border-slate-100">
                <CardHeader>
                  <CardTitle className="text-base">Your Public Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 max-w-xs mx-auto">
                      <div className="h-20 relative" style={{ background: profile.cover_color || "#2563eb" }} />
                      <div className="bg-white px-4 pb-4">
                        <div className="flex justify-center -mt-8 mb-2">
                          {profile.profile_photo ? (
                            <img src={profile.profile_photo} alt="" className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover" />
                          ) : (
                            <div className="w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center text-2xl font-black text-white" style={{ background: profile.cover_color || "#2563eb" }}>
                              {profile.display_name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h3 className="text-center font-black text-slate-900">{profile.display_name}</h3>
                        <p className="text-center text-blue-600 text-xs font-medium">{profile.job_title}</p>
                        <p className="text-center text-slate-400 text-xs">{profile.company_name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No profile yet</p>
                      <p className="text-xs mt-1">Go to Edit Profile to get started</p>
                    </div>
                  )}
                  {profile && (
                    <div className="flex gap-2 mt-4">
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2" size="sm">
                          <Eye className="w-4 h-4" /> View Live
                        </Button>
                      </a>
                      <Button variant="outline" size="sm" onClick={copyLink} className="gap-2 border-slate-200">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* QR Code card */}
              <Card className="border-slate-100">
                <CardHeader>
                  <CardTitle className="text-base">QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile ? (
                    <div className="text-center">
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 inline-block shadow-sm">
                        <img src={qrUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
                      </div>
                      <p className="text-xs text-slate-500 mt-3">Scan to open your profile</p>
                      <a href={qrUrl} download="bingoo-qr.png" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="mt-3 border-slate-200 text-xs">
                          Download QR Code
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <div className="text-5xl mb-3 opacity-30">⬛</div>
                      <p className="text-sm">Create a profile first to get your QR code</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Editor Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Basic Info */}
              <Card className="border-slate-100">
                <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Username <span className="text-red-500">*</span></Label>
                    <div className="flex mt-1">
                      <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm">/p/</span>
                      <Input className="rounded-l-none border-slate-200" placeholder="mamadou" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name <span className="text-red-500">*</span></Label>
                      <Input className="mt-1 border-slate-200" placeholder="Amadou Diallo" value={form.display_name} onChange={set("display_name")} />
                    </div>
                    <div>
                      <Label>Job Title</Label>
                      <Input className="mt-1 border-slate-200" placeholder="Real Estate Agent" value={form.job_title} onChange={set("job_title")} />
                    </div>
                  </div>
                  <div>
                    <Label>Company Name</Label>
                    <Input className="mt-1 border-slate-200" placeholder="Agence Immobilière Dakar" value={form.company_name} onChange={set("company_name")} />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea className="mt-1 border-slate-200" placeholder="A short description about yourself..." value={form.bio} onChange={set("bio")} rows={3} />
                  </div>
                  <div>
                    <Label>Cover Color</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {COVER_COLORS.map(c => (
                        <button key={c} onClick={() => setForm(f => ({ ...f, cover_color: c }))} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${form.cover_color === c ? "border-slate-900 scale-110" : "border-transparent"}`} style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="border-slate-100">
                <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: "phone", label: "Phone", placeholder: "+221 77 000 0000" },
                      { key: "whatsapp_number", label: "WhatsApp Number", placeholder: "+221 77 000 0000" },
                      { key: "email", label: "Email", placeholder: "you@example.com" },
                      { key: "website", label: "Website", placeholder: "https://yoursite.com" },
                      { key: "location", label: "Location", placeholder: "Dakar, Senegal" },
                      { key: "payment_link", label: "Payment Link", placeholder: "https://paypal.me/..." },
                    ].map(f => (
                      <div key={f.key}>
                        <Label>{f.label}</Label>
                        <Input className="mt-1 border-slate-200" placeholder={f.placeholder} value={form[f.key]} onChange={set(f.key)} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border-slate-100">
                <CardHeader><CardTitle className="text-base">Social Media Links</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: "instagram_url", label: "📸 Instagram", placeholder: "https://instagram.com/..." },
                      { key: "facebook_url", label: "👤 Facebook", placeholder: "https://facebook.com/..." },
                      { key: "tiktok_url", label: "🎵 TikTok", placeholder: "https://tiktok.com/@..." },
                      { key: "linkedin_url", label: "💼 LinkedIn", placeholder: "https://linkedin.com/in/..." },
                      { key: "youtube_url", label: "▶️ YouTube", placeholder: "https://youtube.com/@..." },
                    ].map(f => (
                      <div key={f.key}>
                        <Label>{f.label}</Label>
                        <Input className="mt-1 border-slate-200" placeholder={f.placeholder} value={form[f.key]} onChange={set(f.key)} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="bg-blue-600 hover:bg-blue-700 px-8 shadow-md shadow-blue-200">
                {saveProfile.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsPanel profileId={profile?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}