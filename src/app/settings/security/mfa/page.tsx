"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ShieldCheck, Smartphone, Copy, Check,
  Download, CheckCircle2, KeyRound,
} from "lucide-react";

const MANUAL_KEY = "GLMR-F4BK-7X2P-QN9W";
const RECOVERY_CODES = [
  "a4f2-9c1e-b7d3", "k8m5-p3r7-t2x6", "h1j4-w6y9-v5n8", "d3g7-s2f6-q9l1",
  "b5c8-m4k2-r7p3", "x9w1-j6h4-t3v7", "n2q5-y8d1-f6s4", "l7r3-c9b5-g2m8",
];

export default function MfaEnrollmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [savedCodes, setSavedCodes] = useState(false);

  const handleVerify = () => {
    if (code === "123456") {
      setStep(4);
      setCodeError("");
    } else {
      setCodeError("Invalid code. Try 123456 for testing.");
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(MANUAL_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(RECOVERY_CODES.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDownloadCodes = () => {
    const blob = new Blob([`Glimmora Fabric Recovery Codes\n${"=".repeat(35)}\n\n${RECOVERY_CODES.join("\n")}\n\nKeep these codes safe. Each can only be used once.`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "glimmora-recovery-codes.txt";
    a.click();
  };

  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };
  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => router.push("/settings/security")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Security
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Set up Two-Factor Authentication</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Add an extra layer of security to your account</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              s < step ? "bg-green-500 text-white" : s === step ? "text-white" : "text-gray-500"
            }`} style={s === step ? { backgroundColor: "var(--gf-accent)" } : s > step ? { backgroundColor: "var(--gf-bg-elevated)" } : {}}>
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 4 && <div className={`h-0.5 w-8 rounded ${s < step ? "bg-green-500" : "bg-gray-700"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs" style={{ color: "var(--gf-text-muted)" }}>Step {step} of 4</span>
      </div>

      {/* Step 1: Choose Method */}
      {step === 1 && (
        <div className="rounded-xl border p-6 space-y-4" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Choose authentication method</h3>
          <button onClick={() => setStep(2)}
            className="w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:border-[var(--gf-accent)]"
            style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
              <Smartphone className="h-6 w-6" style={{ color: "var(--gf-accent)" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Authenticator App</p>
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                Use Google Authenticator, Authy, or any TOTP-compatible app
              </p>
            </div>
            <ArrowRight className="h-5 w-5" style={{ color: "var(--gf-text-muted)" }} />
          </button>
        </div>
      )}

      {/* Step 2: QR Code */}
      {step === 2 && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Scan QR code</h3>
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            Open your authenticator app and scan this QR code, or enter the key manually.
          </p>

          <div className="flex justify-center">
            <div className="rounded-xl border-2 border-dashed p-4" style={{ borderColor: "var(--gf-border)" }}>
              {/* Fake QR code grid */}
              <div className="grid grid-cols-8 gap-0.5 w-40 h-40">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${
                    [0,1,2,5,6,7,8,14,15,16,22,23,24,25,26,31,32,33,39,40,41,42,47,48,49,55,56,57,58,59,63].includes(i)
                      ? "" : ""
                  }`} style={{ backgroundColor: Math.random() > 0.4 ? "var(--gf-text-primary)" : "var(--gf-bg-base)" }} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              Or enter this key manually:
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border px-3 py-2.5 text-sm font-mono tracking-wider"
                style={fieldStyle}>{MANUAL_KEY}</code>
              <button onClick={handleCopyKey}
                className="rounded-lg border px-3 py-2.5 transition-colors hover:opacity-80"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button onClick={() => setStep(1)} className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Back</button>
            <button onClick={() => setStep(3)} className="rounded-lg px-6 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--gf-accent)" }}>Next</button>
          </div>
        </div>
      )}

      {/* Step 3: Verify TOTP */}
      {step === 3 && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Verify setup</h3>
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            Enter the 6-digit code from your authenticator app to verify the setup.
          </p>

          {codeError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{codeError}</div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Verification Code</label>
            <input type="text" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setCodeError(""); }}
              placeholder="000000" maxLength={6}
              className="w-full rounded-lg border px-3 py-2.5 text-sm text-center tracking-[0.5em] font-mono outline-none"
              style={fieldStyle} />
          </div>

          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button onClick={() => setStep(2)} className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Back</button>
            <button onClick={handleVerify} disabled={code.length < 6}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>Verify</button>
          </div>
        </div>
      )}

      {/* Step 4: Recovery Codes */}
      {step === 4 && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>MFA enabled successfully!</h3>
          </div>

          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            Save these recovery codes in a secure place. Each code can only be used once if you lose access to your authenticator app.
          </p>

          <div className="grid grid-cols-2 gap-2 rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            {RECOVERY_CODES.map((c) => (
              <code key={c} className="rounded px-2 py-1.5 text-xs font-mono text-center"
                style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-primary)" }}>{c}</code>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={handleDownloadCodes}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <Download className="h-4 w-4" /> Download
            </button>
            <button onClick={handleCopyCodes}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              {copiedCodes ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copiedCodes ? "Copied!" : "Copy all"}
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={savedCodes} onChange={(e) => setSavedCodes(e.target.checked)}
              className="h-4 w-4 rounded accent-teal-500" />
            <span className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>I have saved my recovery codes</span>
          </label>

          <div className="flex justify-end pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button onClick={() => router.push("/settings/security")} disabled={!savedCodes}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
