import { Phone, Mail, MapPin, Trash2, Clock } from "lucide-react";

/**
 * Displays found/finder reports for a device with action buttons.
 * Actions: Mark Contacted, Mark Found (recovered), Delete Report
 */
export default function FoundReportsList({ reports, isDark, onMarkContacted, onMarkFound, onDeleteReport }) {
  if (!reports || reports.length === 0) return null;

  const headText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-white/50" : "text-slate-500";

  return (
    <div className="space-y-2">
      <p className={`text-xs font-bold uppercase tracking-wider ${subText} mb-2`}>
        📍 Found Reports ({reports.length})
      </p>
      {reports.map((report) => (
        <div key={report.id} className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`font-bold text-sm ${headText}`}>{report.finder_name || "Anonymous"}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  report.status === "recovered" ? "bg-emerald-100 text-emerald-700"
                  : report.status === "contacted" ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
                }`}>
                  {report.status === "recovered" ? "✓ Recovered" : report.status === "contacted" ? "Contacted" : "New"}
                </span>
              </div>
              {report.finder_phone && (
                <a href={`tel:${report.finder_phone}`} className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <Phone className="w-3 h-3" /> {report.finder_phone}
                </a>
              )}
              {report.finder_email && (
                <a href={`mailto:${report.finder_email}`} className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold">
                  <Mail className="w-3 h-3" /> {report.finder_email}
                </a>
              )}
              {report.finder_location && (
                <p className={`flex items-center gap-1.5 text-xs ${subText}`}>
                  <MapPin className="w-3 h-3" /> {report.finder_location}
                </p>
              )}
              {report.finder_message && (
                <p className={`text-xs ${subText} italic`}>"{report.finder_message}"</p>
              )}
              {report.latitude && report.longitude && (
                <a href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-violet-500 font-semibold">
                  <MapPin className="w-3 h-3" /> View GPS Location
                </a>
              )}
              <p className={`flex items-center gap-1 text-[11px] ${subText}`}>
                <Clock className="w-3 h-3" /> {report.scan_time ? new Date(report.scan_time).toLocaleString() : "Unknown time"}
              </p>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0 items-end">
              {report.status !== "recovered" && (
                <>
                  {report.status === "new" && (
                    <button onClick={() => onMarkContacted(report.id)}
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500">
                      Contacted
                    </button>
                  )}
                  <button onClick={() => onMarkFound(report.id)}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500">
                    Mark Found ✓
                  </button>
                </>
              )}
              <button onClick={() => {
                if (window.confirm("Delete this found report?")) onDeleteReport(report.id);
              }} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}