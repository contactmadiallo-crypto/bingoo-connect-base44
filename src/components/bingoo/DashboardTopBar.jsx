import React from 'react';
import { ChevronLeft, Grid3x3, Wand2, RotateCw, Plus, MoreHorizontal, Eye, Monitor, Maximize, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardTopBar({ 
  user, 
  profile, 
  isDark, 
  onBack,
  onPreview,
  onPublish,
  onUpgrade,
  lang = 'EN',
  onToggleLang,
  copied,
  onCopyLink,
}) {
  const color = profile?.cover_color || '#0b2149';
  
  return (
    <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b sticky top-0 z-40`}>
      {/* Top navigation bar */}
      <div className={`flex items-center justify-between px-4 py-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className={`flex items-center gap-1 rounded-xl p-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isDark ? 'bg-slate-600 text-white' : 'bg-white text-slate-700'}`}>
              Preview
            </button>
            <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>
              Dashboard
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            aria-label="AI Assistant"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold ${isDark ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}
          >
            <Plus className="w-4 h-4" /> AI
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="More options"
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            aria-label="Upgrade plan"
            onClick={onUpgrade}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            💎 Upgrade
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Publish profile"
            onClick={onPublish}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Publish
          </motion.button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`flex items-center justify-between px-4 py-3 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="flex items-center gap-2">
          <label className={`p-2 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
            <input type="checkbox" className="w-4 h-4 rounded" />
          </label>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            aria-label="Layout grid"
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <Grid3x3 className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            aria-label="Edit mode"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
          >
            <Wand2 className="w-4 h-4" /> Edit
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            aria-label="Refresh"
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <RotateCw className="w-5 h-5" />
          </motion.button>
        </div>

        <div className={`flex items-center px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-200'}`}>
          <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>/</span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            aria-label="Desktop view"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <Monitor className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            aria-label="Fullscreen"
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <Maximize className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Profile header */}
      <div className={`relative mx-4 my-4 rounded-3xl p-6 overflow-hidden`}
        style={{
          background: isDark 
            ? `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`
            : `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${color}25`
        }}>
        
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1" 
          style={{ background: `linear-gradient(90deg, #0b2149, #f97316, #FDBA21)` }} 
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              DASHBOARD
            </p>
            <h2 className={`text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {user?.full_name?.split(' ')[0] || 'User'} 👋
            </h2>

            {profile && (
              <div className="flex items-center gap-2 mb-3">
                <a 
                  href={`https://bingooconnect.com/p/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                >
                  /p/{profile.username}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCopyLink}
                    aria-label={copied ? "Link copied" : "Copy profile link"}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-500" />
                    )}
                  </motion.button>
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {profile?.plan && profile.plan !== 'free' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                  ['salon', 'restaurant'].includes(profile.plan)
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-blue-100 text-blue-700 border border-blue-300'
                }`}
              >
                ● {profile.plan.toUpperCase()}
              </motion.span>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={onToggleLang}
              className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                isDark
                  ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border border-slate-300 text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'EN' ? '🇫🇷 FR' : '🇺🇸 EN'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPreview}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> Preview
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}