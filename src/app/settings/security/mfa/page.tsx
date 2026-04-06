"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  ArrowLeft, ArrowRight, Check, Copy, Download,
  CheckCircle2, Smartphone, Mail, MessageSquare, KeyRound,
} from "lucide-react";
import { toast } from "sonner";

const MFA_STORAGE_KEY = "glimmora_mfa_methods";
const MANUAL_KEY = "GLMR-F4BK-7X2P-QN9W";
const RECOVERY_CODES = [
  "a4f2-9c1e-b7d3", "k8m5-p3r7-t2x6", "h1j4-w6y9-v5n8", "d3g7-s2f6-q9l1",
  "b5c8-m4k2-r7p3", "x9w1-j6h4-t3v7", "n2q5-y8d1-f6s4", "l7r3-c9b5-g2m8",
];

type MfaMethodId = "email" | "sms" | "authenticator";

const METHOD_CONFIG: Record<MfaMethodId, { label: string; icon: React.ReactNode; description: string }> = {
  email: {
    label: "Email OTP",
    icon: <Mail className="h-6 w-6" />,
    description: "Receive a verification code to your registered email address",
  },
  sms: {
    label: "SMS OTP",
    icon: <MessageSquare className="h-6 w-6" />,
    description: "Receive a verification code via text message to your phone",
  },
  authenticator: {
    label: "Authenticator App",
    icon: <Smartphone className="h-6 w-6" />,
    description: "Use Google Authenticator, Authy, or any TOTP-compatible app",
  },
};

export default function MfaEnrollmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("method") as MfaMethodId | null;

  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<MfaMethodId | null>(preselected && preselected in METHOD_CONFIG ? preselected : null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [savedCodes, setSavedCodes] = useState(false);

  // SMS-specific
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);

  // Email-specific
  const [emailSent, setEmailSent] = useState(false);

  // If method is preselected via URL, skip to step 2 (unless already enabled)
  useEffect(() => {
    if (preselected && preselected in METHOD_CONFIG) {
      try {
        const stored = localStorage.getItem(MFA_STORAGE_KEY);
        if (stored) {
          const state = JSON.parse(stored);
          if (state.methods?.[preselected]) {
            // Already enabled — redirect back
            toast.info(`${METHOD_CONFIG[preselected].label} is already enabled`);
            router.replace("/settings/security");
            return;
          }
        }
      } catch { /* ignore */ }
      setSelectedMethod(preselected);
      setStep(2);
    }
  }, [preselected, router]);

  const handleVerify = () => {
    if (code === "123456") {
      // Persist the enabled method to localStorage
      try {
        const stored = localStorage.getItem(MFA_STORAGE_KEY);
        const state = stored ? JSON.parse(stored) : { methods: { email: false, sms: false, authenticator: false }, recoveryCodes: false };
        state.methods[selectedMethod!] = true;
        state.recoveryCodes = true;
        localStorage.setItem(MFA_STORAGE_KEY, JSON.stringify(state));
      } catch { /* ignore */ }

      setStep(4);
      setCodeError("");
      toast.success(`${METHOD_CONFIG[selectedMethod!].label} enabled`, {
        description: "Two-factor authentication method has been set up successfully.",
      });
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

  const handleSendEmailCode = () => {
    setEmailSent(true);
    toast.success("Code sent!", {
      description: "A verification code has been sent to su***@glimmora.com",
    });
  };

  const handleSendSmsCode = () => {
    if (phoneNumber.replace(/\D/g, "").length < 10) return;
    setPhoneSent(true);
    const masked = phoneNumber.slice(0, 3) + " •••• " + phoneNumber.slice(-2);
    toast.success("Code sent!", {
      description: `A verification code has been sent to ${masked}`,
    });
  };

  const selectMethodAndAdvance = (method: MfaMethodId) => {
    setSelectedMethod(method);
    setStep(2);
  };

  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };
  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  const totalSteps = 4;

  return (
    <AuthGuard>
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => router.push("/settings/security")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Security
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Set up Two-Factor Authentication</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
          {selectedMethod ? `Setting up ${METHOD_CONFIG[selectedMethod].label}` : "Choose a method to add an extra layer of security"}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              s < step ? "bg-green-500 text-white" : s === step ? "text-white" : "text-gray-500"
            }`} style={s === step ? { backgroundColor: "var(--gf-accent)" } : s > step ? { backgroundColor: "var(--gf-bg-elevated)" } : {}}>
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < totalSteps && <div className={`h-0.5 w-8 rounded ${s < step ? "bg-green-500" : "bg-gray-700"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs" style={{ color: "var(--gf-text-muted)" }}>Step {step} of {totalSteps}</span>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Step 1: Choose Method                                             */}
      {/* ----------------------------------------------------------------- */}
      {step === 1 && (
        <div className="rounded-xl border p-6 space-y-4" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Choose authentication method</h3>

          {(Object.entries(METHOD_CONFIG) as [MfaMethodId, typeof METHOD_CONFIG.email][]).map(([id, cfg]) => (
            <button key={id} onClick={() => selectMethodAndAdvance(id)}
              className="w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:border-[var(--gf-accent)]"
              style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>
                {cfg.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{cfg.label}</p>
                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{cfg.description}</p>
              </div>
              <ArrowRight className="h-5 w-5" style={{ color: "var(--gf-text-muted)" }} />
            </button>
          ))}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Step 2: Method-specific setup                                     */}
      {/* ----------------------------------------------------------------- */}
      {step === 2 && selectedMethod === "authenticator" && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Scan QR code</h3>
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            Open your authenticator app and scan this QR code, or enter the key manually.
          </p>

          <div className="flex justify-center">
            <div className="rounded-xl border-2 border-dashed p-4" style={{ borderColor: "var(--gf-border)" }}>
              <div className="grid grid-cols-8 gap-0.5 w-40 h-40">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="rounded-[1px]"
                    style={{ backgroundColor: [0,1,2,5,6,7,8,14,15,16,22,23,24,25,26,31,32,33,39,40,41,42,47,48,49,55,56,57,58,59,63].includes(i)
                      ? "var(--gf-text-primary)" : "var(--gf-bg-base)" }} />
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
            <button onClick={() => { setStep(1); setSelectedMethod(null); }} className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Back</button>
            <button onClick={() => setStep(3)} className="rounded-lg px-6 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--gf-accent)" }}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && selectedMethod === "email" && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Verify your email</h3>
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            We&apos;ll send a 6-digit verification code to your registered email address to confirm you have access.
          </p>

          <div className="rounded-lg border p-4 flex items-center gap-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
              <Mail className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>su***@glimmora.com</p>
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Your registered email address</p>
            </div>
            {emailSent ? (
              <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Sent
              </span>
            ) : (
              <button onClick={handleSendEmailCode}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: "var(--gf-accent)" }}>
                Send Code
              </button>
            )}
          </div>

          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button onClick={() => { setStep(1); setSelectedMethod(null); setEmailSent(false); }} className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Back</button>
            <button onClick={() => setStep(3)} disabled={!emailSent}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && selectedMethod === "sms" && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Add your phone number</h3>
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            Enter your mobile phone number. We&apos;ll send a 6-digit verification code via SMS to confirm.
          </p>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Phone Number</label>
            <div className="flex items-center gap-2">
              <input type="tel" placeholder="+1 (555) 000-0000" value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={phoneSent}
                className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-50"
                style={fieldStyle} />
              {phoneSent ? (
                <span className="flex items-center gap-1 text-xs text-green-400 font-medium whitespace-nowrap">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                </span>
              ) : (
                <button onClick={handleSendSmsCode}
                  disabled={phoneNumber.replace(/\D/g, "").length < 10}
                  className="rounded-lg px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50 whitespace-nowrap"
                  style={{ backgroundColor: "var(--gf-accent)" }}>
                  Send Code
                </button>
              )}
            </div>
          </div>

          {phoneSent && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              <p className="text-xs text-green-400">
                Verification code sent to {phoneNumber.slice(0, 3)} •••• {phoneNumber.slice(-2)}. Code expires in 10 minutes.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button onClick={() => { setStep(1); setSelectedMethod(null); setPhoneSent(false); setPhoneNumber(""); }}
              className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Back</button>
            <button onClick={() => setStep(3)} disabled={!phoneSent}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>Next</button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Step 3: Verify Code (same for all methods)                        */}
      {/* ----------------------------------------------------------------- */}
      {step === 3 && selectedMethod && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Verify setup</h3>
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            {selectedMethod === "authenticator"
              ? "Enter the 6-digit code from your authenticator app to verify the setup."
              : selectedMethod === "email"
                ? "Enter the 6-digit code sent to your email address."
                : "Enter the 6-digit code sent to your phone via SMS."}
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
            <button onClick={() => { setStep(2); setCode(""); setCodeError(""); }}
              className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Back</button>
            <button onClick={handleVerify} disabled={code.length < 6}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>Verify</button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Step 4: Recovery Codes                                            */}
      {/* ----------------------------------------------------------------- */}
      {step === 4 && selectedMethod && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              {METHOD_CONFIG[selectedMethod].label} enabled successfully!
            </h3>
          </div>

          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            Save these recovery codes in a secure place. Each code can only be used once if you lose access to your {METHOD_CONFIG[selectedMethod].label.toLowerCase()}.
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
    </AuthGuard>
  );
}
