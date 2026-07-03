import WalletPassButtons from "@/components/bingoo/WalletPassButtons";

export default function OwnerWalletPanel({ profile, isDark, panelBorder, panelBg, headText, mutedText }) {
  return (
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
      <p className={`font-bold text-sm ${headText} mb-1`}>Add to Wallet</p>
      <p className={`text-xs mb-3 ${mutedText}`}>Save your Bingoo QR card to your phone's wallet for quick sharing.</p>
      <WalletPassButtons profile={profile} color="#0B2E6B" isDark={isDark} />
    </div>
  );
}