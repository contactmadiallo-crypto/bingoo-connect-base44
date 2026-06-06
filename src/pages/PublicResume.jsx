import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FileText, Mail, Phone, MapPin, Linkedin, Globe, Download } from "lucide-react";

export default function PublicResume() {
  const { resumeId } = useParams();

  const { data: resume, isLoading, isError } = useQuery({
    queryKey: ["public-resume", resumeId],
    queryFn: () => base44.entities.Resume.filter({ id: resumeId }),
    select: (data) => data?.[0],
    enabled: !!resumeId,
  });

  const printPDF = () => window.print();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (isError || !resume) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <FileText className="w-16 h-16 mx-auto text-slate-200 mb-4" />
        <p className="text-slate-500 font-semibold">Resume not found</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 print:py-0 print:px-0 print:bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Download button - hidden when printing */}
        <div className="flex justify-end mb-4 print:hidden">
          <button onClick={printPDF}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
            <Download className="w-4 h-4" /> Download / Print PDF
          </button>
        </div>

        {/* Resume card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 print:p-6">
            <h1 className="text-3xl font-black text-white mb-1">{resume.display_name}</h1>
            {resume.job_title && (
              <p className="text-blue-300 font-bold text-lg">
                {resume.job_title}{resume.company_name ? ` · ${resume.company_name}` : ""}
              </p>
            )}
            <div className="flex flex-wrap gap-4 mt-4">
              {resume.email && (
                <a href={`mailto:${resume.email}`} className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm transition-colors">
                  <Mail className="w-4 h-4" /> {resume.email}
                </a>
              )}
              {resume.phone && (
                <a href={`tel:${resume.phone}`} className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm transition-colors">
                  <Phone className="w-4 h-4" /> {resume.phone}
                </a>
              )}
              {resume.location && (
                <span className="flex items-center gap-1.5 text-slate-300 text-sm">
                  <MapPin className="w-4 h-4" /> {resume.location}
                </span>
              )}
              {resume.linkedin_url && (
                <a href={resume.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm transition-colors">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {resume.website && (
                <a href={resume.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm transition-colors">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-8 print:p-6 space-y-6">
            {resume.bio && (
              <Section title="Summary">
                <p className="text-slate-600 leading-relaxed">{resume.bio}</p>
              </Section>
            )}
            {resume.skills && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {resume.skills.split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean).map(skill => (
                    <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-semibold print:border-gray-300 print:text-gray-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}
            {resume.experience && (
              <Section title="Experience">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{resume.experience}</p>
              </Section>
            )}
            {resume.education && (
              <Section title="Education">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{resume.education}</p>
              </Section>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-8 py-4 print:hidden">
            <p className="text-xs text-slate-400 text-center">
              Created with <span className="font-bold text-slate-500">Bingoo Connect</span> · bingooconnect.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-3">{title}</h2>
      {children}
    </div>
  );
}