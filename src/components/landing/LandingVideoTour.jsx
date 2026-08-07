import { motion } from "framer-motion";

const B = {
  navy: "#0b2149",
  orange: "#f97316",
};

export default function LandingVideoTour() {
  return (
    <section className="bg-slate-100 px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10 text-center"
        >
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold"
            style={{ background: `${B.orange}15`, color: B.orange, borderColor: `${B.orange}30` }}
          >
            Watch the Demo
          </div>
          <h2 className="mb-4 text-3xl font-black md:text-4xl" style={{ color: B.navy }}>
            See Bingoo in action
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
            See how a Bingoo identity moves from a simple tap to a profile, connection and ongoing business relationship.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.12 }}
          className="relative overflow-hidden rounded-3xl border-4 shadow-2xl"
          style={{ borderColor: "rgba(11,33,73,0.1)" }}
        >
          <video
            className="aspect-video w-full bg-black object-cover"
            autoPlay
            muted
            loop
            controls
            playsInline
            preload="metadata"
            poster="https://media.base44.com/images/public/692bd9007b93ba81de543346/5bf500988_BingooconnectNFCBRAND.png"
          >
            <source
              src="https://media.base44.com/videos/public/692bd9007b93ba81de543346/3fb381cbd_BingooConnect_TheProductDocumentaryCut_1080p_caption.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white/70">🔊 Click to unmute</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
