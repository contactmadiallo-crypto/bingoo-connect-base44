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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ExternalLink, Plus, Trash2, Edit2, Eye, BarChart3, User, Link as LinkIcon, LogOut, GripVertical } from "lucide-react";
import AnalyticsPanel from "@/components/bingoo/AnalyticsPanel";
import LinkForm from "@/components/bingoo/LinkForm";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin()).finally(() => setLoading(false));
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ["my-profiles", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });

  const profile = profiles[0];

  const { data: links = [] } = useQuery({
    queryKey: ["my-links", profile?.id],
    queryFn: () => base44.entities.Link.filter({ profile_id: profile.id }),
    enabled: !!profile?.id,
  });

  const [profileForm, setProfileForm] = useState({ username: "", display_name: "", bio: "", cover_color: "#6366f1", whatsapp: "", email: "", phone: "" });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        username: profile.username || "",
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        cover_color: profile.cover_color || "#6366f1",
        whatsapp: profile.whatsapp || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile?.id]);

  const saveProfile = useMutation({
    mutationFn: () => profile
      ? base44.entities.Profile.update(profile.id, profileForm)
      : base44.entities.Profile.create({ ...profileForm, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profiles"] });
      toast.success("Profile saved!");
    },
  });

  const createLink = useMutation({
    mutationFn: (data) => base44.entities.Link.create({ ...data, profile_id: profile.id, is_active: true, click_count: 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-links"] }); toast.success("Link added!"); },
  });

  const updateLink = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Link.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-links"] }); toast.success("Link updated!"); },
  });

  const deleteLink = useMutation({
    mutationFn: (id) => base44.entities.Link.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-links"] }); toast.success("Link deleted!"); },
  });

  const toggleLink = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Link.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-links"] }),
  });

  const handleLinkSave = (data) => {
    if (editingLink) {
      updateLink.mutate({ id: editingLink.id, data });
      setEditingLink(null);
    } else {
      createLink.mutate({ ...data, order: links.length });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  const sortedLinks = [...links].sort((a, b) => (a.order || 0) - (b.order || 0));
  const profileUrl = `${window.location.origin}/p/${profile?.username}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
            <span className="text-xl font-bold text-slate-900">Bingoo</span>
            <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200">Dashboard</Badge>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" /> Preview
                </Button>
              </a>
            )}
            <Button variant="ghost" size="sm" onClick={() => base44.auth.logout()} className="gap-2 text-slate-500">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Hello, {user?.full_name?.split(" ")[0]} 👋</h1>
          {profile ? (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 text-sm">Your profile: </p>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
                bingoo.africa/p/{profile.username} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <p className="text-slate-500 text-sm mt-1">Set up your profile to get started.</p>
          )}
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> Profile</TabsTrigger>
            <TabsTrigger value="links" className="gap-2" disabled={!profile}><LinkIcon className="w-4 h-4" /> Links</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" disabled={!profile}><BarChart3 className="w-4 h-4" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Username *</Label>
                    <div className="flex mt-1">
                      <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 rounded-l-md text-slate-500 text-sm">/p/</span>
                      <Input
                        className="rounded-l-none"
                        placeholder="amadou"
                        value={profileForm.username}
                        onChange={e => setProfileForm({ ...profileForm, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Display Name *</Label>
                    <Input className="mt-1" placeholder="Amadou Diallo" value={profileForm.display_name} onChange={e => setProfileForm({ ...profileForm, display_name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea className="mt-1" placeholder="Real Estate Agent · Dakar" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} rows={2} />
                </div>
                <div>
                  <Label>Cover Color</Label>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9", "#ef4444", "#1e293b"].map(c => (
                      <button
                        key={c}
                        onClick={() => setProfileForm({ ...profileForm, cover_color: c })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${profileForm.cover_color === c ? "border-slate-900 scale-110" : "border-transparent"}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>WhatsApp</Label>
                    <Input className="mt-1" placeholder="+221 77 000 0000" value={profileForm.whatsapp} onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input className="mt-1" placeholder="you@example.com" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input className="mt-1" placeholder="+221 77 000 0000" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </div>
                </div>
                <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                  {saveProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Links</CardTitle>
                <Button onClick={() => { setEditingLink(null); setLinkFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <Plus className="w-4 h-4" /> Add Link
                </Button>
              </CardHeader>
              <CardContent>
                {sortedLinks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <LinkIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No links yet. Add your first one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedLinks.map(link => (
                      <div key={link.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        <span className="text-xl">{link.icon || "🔗"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm">{link.title}</p>
                          <p className="text-xs text-slate-400 truncate">{link.url}</p>
                        </div>
                        <Badge variant="outline" className="text-xs hidden sm:flex">{link.click_count || 0} clicks</Badge>
                        <Switch
                          checked={link.is_active}
                          onCheckedChange={v => toggleLink.mutate({ id: link.id, is_active: v })}
                        />
                        <button onClick={() => { setEditingLink(link); setLinkFormOpen(true); }} className="text-slate-400 hover:text-indigo-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm("Delete this link?")) deleteLink.mutate(link.id); }} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsPanel profileId={profile?.id} />
          </TabsContent>
        </Tabs>
      </main>

      <LinkForm
        open={linkFormOpen}
        onOpenChange={setLinkFormOpen}
        onSave={handleLinkSave}
        initial={editingLink}
      />
    </div>
  );
}