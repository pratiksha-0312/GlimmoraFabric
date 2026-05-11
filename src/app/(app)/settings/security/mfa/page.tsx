"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  ArrowLeft, ArrowRight, Check, Copy, Download,
  CheckCircle2, Smartphone, MessageSquare, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { authApi, smsMfaApi, emailMfaApi, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

type MfaMethodId = "sms" | "authenticator" | "email";

const METHOD_CONFIG: Record<MfaMethodId, { label: string; icon: React.ReactNode; description: string; disabled?: boolean }> = {
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
  const { refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("method") as MfaMethodId | null;

  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<MfaMethodId | null>(
    preselected && preselected in METHOD_CONFIG ? preselected : null,
  );
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [savedCodes, setSavedCodes] = useState(false);

  // TOTP enrollment data from backend
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [qrUri, setQrUri] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // SMS-specific
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [smsSending, setSmsSending] = useState(false);

  // Email-specific
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    if (preselected && preselected in METHOD_CONFIG) {
      setSelectedMethod(preselected);
      setStep(2);
    }
  }, [preselected]);

  // Trigger TOTP enrollment when entering step 2 for authenticator
  useEffect(() => {
    if (step === 2 && selectedMethod === "authenticator" && !qrUri && !enrollLoading) {
      setEnrollLoading(true);
      authApi
        .mfaEnroll()
        .then((data) => {
          setQrUri(data.qr_uri);
          setSecret(data.secret);
          setRecoveryCodes(data.recovery_codes ?? []);
        })
        .catch((err) => {
          const msg = err instanceof ApiError ? err.message : "Failed to start MFA enrollment";
          toast.error(msg);
        })
        .finally(() => setEnrollLoading(false));
    }
  }, [step, selectedMethod, qrUri, enrollLoading]);

  const handleVerify = async () => {
    if (!selectedMethod) return;
    setCodeError("");
    setVerifying(true);
    try {
      if (selectedMethod === "authenticator") {
        await authApi.mfaVerify(code);
        await refreshProfile();
      } else if (selectedMethod === "sms") {
        await smsMfaApi.verify(code);
      } else {
        await emailMfaApi.verify(code);
      }
      setStep(4);
      toast.success(`${METHOD_CONFIG[selectedMethod].label} enabled`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Invalid code";
      setCodeError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyCodes = () => {
    if (recoveryCodes.length === 0) return;
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDownloadCodes = () => {
    if (recoveryCodes.length === 0) return;
    const blob = new Blob(
      [`Glimmora Fabric Recovery Codes\n${"=".repeat(35)}\n\n${recoveryCodes.join("\n")}\n\nKeep these codes safe. Each can only be used once.`],
      { type: "text/plain" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "glimmora-recovery-codes.txt";
    a.click();
  };

  const handleSendEmailCode = async () => {
    setEmailSending(true);
    try {
      const res = await emailMfaApi.sendOtp();
      setEmailSent(true);
      toast.success("Code sent!", {
        description: res.otp ? `(dev) OTP: ${res.otp}` : "A verification code has been sent to your registered email",
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to send email";
      toast.error(msg);
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendSmsCode = async () => {
    if (phoneNumber.replace(/\D/g, "").length < 10) return;
    setSmsSending(true);
    try {
      const res = await smsMfaApi.sendOtp(phoneNumber);
      setPhoneSent(true);
      const masked = phoneNumber.slice(0, 3) + " •••• " + phoneNumber.slice(-2);
      toast.success("Code sent!", {
        description: res.otp ? `(dev) OTP: ${res.otp}` : `A verification code has been sent to ${masked}`,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to send SMS";
      toast.error(msg);
    } finally {
      setSmsSending(false);
    }
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

      {/* Step 1: Choose Method */}
      {step === 1 && (
        <div className="rounded-xl border p-6 space-y-4" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Choose authentication method</h3>

          {(Object.entries(METHOD_CONFIG) as [MfaMethodId, typeof METHOD_CONFIG.sms][]).map(([id, cfg]) => (
            <button key={id} onClick={() => !cfg.disabled && selectMethodAndAdvance(id)} disabled={cfg.disabled}
              className="w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-colors enabled:hover:border-[var(--gf-accent)] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>
                {cfg.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{cfg.label}</p>
                  {cfg.disabled && (
                    <span className="rounded-full bg-gray-500/15 px-2 py-0.5 text-[10px] font-semibold" style={{ color: "var(--gf-text-muted)" }}>
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{cfg.description}</p>
              </div>
              {!cfg.disabled && <ArrowRight className="h-5 w-5" style={{ color: "var(--gf-text-muted)" }} />}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Authenticator */}
      {step === 2 && selectedMethod === "authenticator" && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Scan QR code</h3>
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            Open your authenticator app and scan this QR code, or enter the key manually.
          </p>

          <div className="flex justify-center">
            <div className="rounded-xl border-2 border-dashed p-4" style={{ borderColor: "var(--gf-border)" }}>
              {enrollLoading || !qrUri ? (
                <div className="flex items-center justify-center w-40 h-40 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                  {enrollLoading ? "Generating..." : "—"}
                </div>
              ) : (
                <QRCodeSVG value={qrUri} size={160} bgColor="transparent" fgColor="var(--gf-text-primary)" level="M" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              Or enter this key manually:
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border px-3 py-2.5 text-sm font-mono tracking-wider break-all"
                style={fieldStyle}>{secret || (enrollLoading ? "..." : "—")}</code>
              <button onClick={handleCopySecret} disabled={!secret}
                className="rounded-lg border px-3 py-2.5 transition-colors hover:opacity-80 disabled:opacity-50"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                {copiedSecret ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button onClick={() => { setStep(1); setSelectedMethod(null); }} className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Back</button>
            <button onClick={() => setStep(3)} disabled={!secret}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>Next</button>
          </div>
        </div>
      )}

      {/* Step 2: SMS */}
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
                  disabled={smsSending || phoneNumber.replace(/\D/g, "").length < 10}
                  className="rounded-lg px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50 whitespace-nowrap"
                  style={{ backgroundColor: "var(--gf-accent)" }}>
                  {smsSending ? "Sending..." : "Send Code"}
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

      {/* Step 2: Email */}
      {step === 2 && selectedMethod === "email" && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Send code to your email</h3>
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            We&apos;ll send a 6-digit verification code to your registered email address.
          </p>

          <div className="flex items-center justify-between rounded-lg border p-3"
            style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5" style={{ color: "var(--gf-text-muted)" }} />
              <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>Your registered email</span>
            </div>
            {emailSent ? (
              <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Sent
              </span>
            ) : (
              <button onClick={handleSendEmailCode}
                disabled={emailSending}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "var(--gf-accent)" }}>
                {emailSending ? "Sending..." : "Send Code"}
              </button>
            )}
          </div>

          {emailSent && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              <p className="text-xs text-green-400">
                Verification code sent to your email. Code expires in 5 minutes.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button onClick={() => { setStep(1); setSelectedMethod(null); setEmailSent(false); }}
              className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Back</button>
            <button onClick={() => setStep(3)} disabled={!emailSent}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>Next</button>
          </div>
        </div>
      )}

      {/* Step 3: Verify */}
      {step === 3 && selectedMethod && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Verify setup</h3>
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
            {selectedMethod === "authenticator"
              ? "Enter the 6-digit code from your authenticator app to verify the setup."
              : selectedMethod === "sms"
                ? "Enter the 6-digit code sent to your phone via SMS."
                : "Enter the 6-digit code sent to your email."}
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
            <button onClick={handleVerify} disabled={code.length < 6 || verifying}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>{verifying ? "Verifying..." : "Verify"}</button>
          </div>
        </div>
      )}

      {/* Step 4: Recovery Codes (only meaningful for authenticator) */}
      {step === 4 && selectedMethod && (
        <div className="rounded-xl border p-6 space-y-5" style={cardStyle}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              {METHOD_CONFIG[selectedMethod].label} enabled successfully!
            </h3>
          </div>

          {selectedMethod === "authenticator" && recoveryCodes.length > 0 ? (
            <>
              <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                Save these recovery codes in a secure place. Each code can only be used once if you lose access to your authenticator.
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                {recoveryCodes.map((c) => (
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
            </>
          ) : (
            <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
              You can now use {METHOD_CONFIG[selectedMethod].label} when signing in.
            </p>
          )}

          <div className="flex justify-end pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button
              onClick={() => router.push("/settings/security")}
              disabled={selectedMethod === "authenticator" && recoveryCodes.length > 0 && !savedCodes}
              className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>Done</button>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
