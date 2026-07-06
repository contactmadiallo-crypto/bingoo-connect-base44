import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const MOCKUPS = [
  {
    id: 1,
    img: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/225261f8a_IMG_2061.png',
    caption: 'Your Digital Identity — One Tap to Connect',
    label: 'Slot 1 · Hero · Public Profile'
  },
  {
    id: 2,
    img: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/3aa4fca5b_IMG_2325.png',
    caption: 'Manage Multiple Profiles',
    label: 'Slot 2 · Profiles Hub'
  },
  {
    id: 3,
    img: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/bd20e9803_image.png',
    caption: 'Appointments & Bookings — All in One Place',
    label: 'Slot 3 · Appointments'
  },
  {
    id: 4,
    img: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/347f9fac8_image.png',
    caption: 'Capture Leads. Manage Your Pipeline.',
    label: 'Slot 4 · Leads CRM'
  },
  {
    id: 5,
    img: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/703143d5c_image.png',
    caption: 'Real-Time Analytics — Every Tap & View',
    label: 'Slot 5 · Analytics'
  },
  {
    id: 6,
    img: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/efc9045c5_image.png',
    caption: 'Smart QR + Apple & Google Wallet',
    label: 'Slot 6 · QR + Wallet'
  },
  {
    id: 7,
    img: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/286315a20_IMG_2329.png',
    caption: 'Save to Google Wallet — Always With You',
    label: 'Slot 7 · Wallet Pass'
  },
  {
    id: 8,
    img: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/a9fc69969_IMG_2295.png',
    caption: 'Lost Mode — Help Finders Return Your Device',
    label: 'Slot 8 · Lost Mode'
  }
];

const frameStyle = {
  width: 540,
  height: 960,
  background: 'linear-gradient(160deg, #0b2149 0%, #13284f 60%, #0b2149 100%)',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 0
};

const phoneStyle = {
  width: 300,
  height: 620,
  background: '#000',
  borderRadius: 42,
  padding: 8,
  position: 'relative',
  zIndex: 1,
  boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.08), 0 0 80px rgba(249,115,22,0.15)'
};

export default function PlaystoreMockups() {
  const frameRefs = useRef({});
  const [busy, setBusy] = useState(null);

  const downloadOne = async (m) => {
    setBusy(m.id);
    try {
      const node = frameRefs.current[m.id];
      // Use dynamic import to avoid bundle bloat
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `bingoo-playstore-screenshot-${m.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert('Auto-download blocked by browser image security. Right-click the frame and take a screenshot instead — the frame is exactly 1080×1920 at 2× scale.');
    }
    setBusy(null);
  };

  const downloadAll = async () => {
    for (const m of MOCKUPS) {
      await downloadOne(m);
      await new Promise(r => setTimeout(r, 700));
    }
  };

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif",
      background: '#0b2149',
      color: '#fff',
      minHeight: '100vh',
      padding: '40px 16px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, #f97316, #fb923c)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 22, color: '#0b2149'
            }}>∞</div>
            <span style={{ fontSize: 20, fontWeight: 800 }}>Bingoo Connect</span>
          </div>
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Google Play Store Mockups</h1>
        <p style={{ color: '#fb923c', marginTop: 6, fontSize: 14 }}>
          8 ready-to-download screenshots · 1080 × 1920 · Bingoo brand frames
        </p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <button
          onClick={downloadAll}
          style={{
            background: '#f97316', color: '#fff', border: 'none',
            padding: '12px 28px', borderRadius: 999, fontSize: 15, fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ⬇ Download All 8 (one by one)
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>
        {MOCKUPS.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
              {m.label}
            </div>

            <div
              ref={(el) => (frameRefs.current[m.id] = el)}
              style={frameStyle}
            >
              {/* glow accents */}
              <div style={{
                position: 'absolute', top: -120, left: -120,
                width: 360, height: 360, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)'
              }} />
              <div style={{
                position: 'absolute', bottom: -100, right: -100,
                width: 320, height: 320, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,146,60,0.12), transparent 70%)'
              }} />

              {/* brand */}
              <div style={{
                position: 'absolute', top: 28, left: 0, right: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 2
              }}>
                <div style={{
                  width: 30, height: 30,
                  background: 'linear-gradient(135deg, #f97316, #fb923c)',
                  borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 17, color: '#0b2149'
                }}>∞</div>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                  Bingoo Connect
                </span>
              </div>

              {/* phone */}
              <div style={phoneStyle}>
                <div style={{
                  position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                  width: 90, height: 24, background: '#000', borderRadius: 14, zIndex: 3
                }} />
                <div style={{
                  width: '100%', height: '100%', borderRadius: 34, overflow: 'hidden', background: '#000'
                }}>
                  <img
                    src={m.img}
                    crossOrigin="anonymous"
                    alt={`screenshot ${m.id}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                  />
                </div>
              </div>

              {/* caption */}
              <div style={{
                position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
                background: '#f97316', color: '#fff',
                padding: '13px 26px', borderRadius: 999,
                fontSize: 16, fontWeight: 700, textAlign: 'center',
                maxWidth: 460, zIndex: 2,
                boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
                whiteSpace: 'nowrap'
              }}>
                {m.caption}
              </div>

              {/* footer tag */}
              <div style={{
                position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center',
                fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, zIndex: 2
              }}>
                CONNECT · SHARE · GROW · SUCCEED
              </div>
            </div>

            <button
              onClick={() => downloadOne(m)}
              disabled={busy === m.id}
              style={{
                background: '#f97316', color: '#fff', border: 'none',
                padding: '9px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                cursor: busy === m.id ? 'default' : 'pointer',
                opacity: busy === m.id ? 0.6 : 1
              }}
            >
              {busy === m.id ? 'Generating…' : '⬇ Download PNG (1080×1920)'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}