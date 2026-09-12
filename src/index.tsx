import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Password Strength Checker — Password Lab" },
      {
        name: "description",
        content:
          "Check password entropy, security policy compliance, and common password risks privately in your browser.",
      },
      { property: "og:title", content: "Password Strength Checker — Password Lab" },
      {
        property: "og:description",
        content: "Evaluate password entropy and get practical, private security guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const COMMON_PASSWORDS = [
  "123456",
  "12345678",
  "123456789",
  "password",
  "password1",
  "qwerty",
  "qwerty123",
  "admin",
  "admin123",
  "welcome",
  "letmein",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "abc123",
  "111111",
  "000000",
  "passw0rd",
  "sunshine",
  "princess",
  "login",
  "master",
];

const POLICY = [
  { key: "length", label: "12+ characters" },
  { key: "upper", label: "Uppercase letter" },
  { key: "lower", label: "Lowercase letter" },
  { key: "digit", label: "Number" },
  { key: "special", label: "Special character" },
] as const;

type Strength = "Weak" | "Moderate" | "Strong" | "Exceptional";

function analyzePassword(password: string) {
  const checks = {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  let pool = 0;
  if (checks.lower) pool += 26;
  if (checks.upper) pool += 26;
  if (checks.digit) pool += 10;
  if (checks.special) pool += 33;

  const rawEntropy = password.length > 0 && pool > 0 ? password.length * Math.log2(pool) : 0;
  const normalized = password.toLowerCase().replace(/[^a-z0-9]/g, "");
  const exactLeak = COMMON_PASSWORDS.includes(password.toLowerCase());
  const dictionaryMatch = COMMON_PASSWORDS.some(
    (word) => word.length >= 5 && normalized.includes(word.replace(/[^a-z0-9]/g, "")),
  );
  const repeated = /(.)\1{2,}/i.test(password);
  const sequence = /(0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|qwer|asdf|zxcv)/i.test(
    password,
  );
  const policyCount = Object.values(checks).filter(Boolean).length;
  const penalty =
    (exactLeak ? 55 : dictionaryMatch ? 25 : 0) + (repeated ? 12 : 0) + (sequence ? 12 : 0);
  const entropy = Math.max(0, Math.round(rawEntropy - penalty));
  const score =
    password.length === 0
      ? 0
      : Math.max(
          4,
          Math.min(
            100,
            Math.round(entropy * 0.82 + policyCount * 5 - (password.length < 8 ? 15 : 0)),
          ),
        );

  let strength: Strength = "Weak";
  if (score >= 85 && policyCount === 5 && !dictionaryMatch) strength = "Exceptional";
  else if (score >= 65 && policyCount >= 4 && !exactLeak) strength = "Strong";
  else if (score >= 38 && !exactLeak) strength = "Moderate";

  const feedback: string[] = [];
  if (!checks.length)
    feedback.push(
      `Add ${Math.max(1, 12 - password.length)} more character${12 - password.length === 1 ? "" : "s"}.`,
    );
  if (!checks.upper || !checks.lower) feedback.push("Mix uppercase and lowercase letters.");
  if (!checks.digit || !checks.special) feedback.push("Add a number and a special character.");
  if (dictionaryMatch) feedback.push("Avoid common words and known password patterns.");
  if (repeated || sequence) feedback.push("Replace repeated characters or predictable sequences.");
  if (feedback.length === 0) feedback.push("This password has excellent length and variety.");

  return {
    checks,
    entropy,
    score,
    strength,
    exactLeak,
    dictionaryMatch,
    repeated,
    sequence,
    feedback,
  };
}

function Index() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const result = useMemo(() => analyzePassword(password), [password]);
  const hasPassword = password.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Fingerprint aria-hidden="true" className="size-5" />
            </span>
            <span className="font-semibold text-foreground">Password Lab</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-safe" />
            100% local analysis
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Security diagnostic
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              How strong is your password?
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Measure entropy, spot risky patterns, and get precise steps to create a safer
              credential. Your password never leaves this page.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="min-w-0 rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5 sm:p-7">
              <label htmlFor="password" className="text-sm font-semibold text-card-foreground">
                Enter a password to test
              </label>
              <div className="mt-3 flex h-13 items-center rounded-md border border-input bg-background focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/20">
                <LockKeyhole
                  className="ml-4 size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value.slice(0, 128))}
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Type or paste your password"
                  maxLength={128}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 font-mono text-base text-foreground outline-none placeholder:font-sans placeholder:text-muted-foreground"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mr-1 shrink-0"
                  aria-label={visible ? "Hide password" : "Show password"}
                  title={visible ? "Hide password" : "Show password"}
                  onClick={() => setVisible((current) => !current)}
                >
                  {visible ? <EyeOff /> : <Eye />}
                </Button>
                {hasPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mr-1 shrink-0"
                    aria-label="Clear password"
                    title="Clear password"
                    onClick={() => setPassword("")}
                  >
                    <X />
                  </Button>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Analyzed only in your browser</span>
                <span>{password.length}/128</span>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Strength score
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-3xl font-semibold strength-${hasPassword ? result.strength.toLowerCase() : "empty"}`}
                    >
                      {hasPassword ? result.strength : "Not tested"}
                    </span>
                    {hasPassword && (
                      <span className="font-mono text-sm text-muted-foreground">
                        {result.score}/100
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Estimated entropy</p>
                  <p className="mt-1 font-mono text-xl font-semibold text-foreground">
                    {result.entropy}{" "}
                    <span className="text-xs font-normal text-muted-foreground">bits</span>
                  </p>
                </div>
              </div>

              <div
                className="mt-5 grid grid-cols-4 gap-2"
                aria-label={`Password score: ${result.score} out of 100`}
              >
                {[25, 50, 65, 85].map((threshold, index) => (
                  <span
                    key={threshold}
                    className={`h-2 rounded-sm transition-colors duration-300 ${result.score >= threshold || (index === 0 && hasPassword) ? `meter-${result.strength.toLowerCase()}` : "bg-muted"}`}
                  />
                ))}
              </div>

              <div className="mt-8">
                <h2 className="text-sm font-semibold text-card-foreground">Security policy</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {POLICY.map((item) => {
                    const passed = result.checks[item.key];
                    return (
                      <li
                        key={item.key}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground"
                      >
                        <span
                          className={`grid size-5 shrink-0 place-items-center rounded-full ${passed ? "bg-safe-soft text-safe" : "bg-muted text-muted-foreground"}`}
                        >
                          {passed ? <Check className="size-3.5" /> : <X className="size-3" />}
                        </span>
                        {item.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-6">
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-md bg-accent text-accent-foreground">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold text-card-foreground">How to improve</h2>
                  <p className="text-xs text-muted-foreground">Prioritized for this password</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3" aria-live="polite">
                {(hasPassword
                  ? result.feedback
                  : ["Start typing to receive personalized guidance."]
                ).map((tip, index) => (
                  <li key={tip} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[10px] font-semibold text-secondary-foreground">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold text-card-foreground">Risk signals</h2>
              <div className="mt-4 space-y-3">
                <RiskRow
                  label="Common password list"
                  safe={!result.dictionaryMatch}
                  value={
                    !hasPassword
                      ? "Waiting"
                      : result.exactLeak
                        ? "Known match"
                        : result.dictionaryMatch
                          ? "Pattern found"
                          : "No match"
                  }
                />
                <RiskRow
                  label="Repeated characters"
                  safe={!result.repeated}
                  value={!hasPassword ? "Waiting" : result.repeated ? "Detected" : "Clear"}
                />
                <RiskRow
                  label="Predictable sequences"
                  safe={!result.sequence}
                  value={!hasPassword ? "Waiting" : result.sequence ? "Detected" : "Clear"}
                />
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border border-info-border bg-info p-4 text-sm leading-6 text-info-foreground">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                For sensitive accounts, use a unique password generated by a trusted password
                manager.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
          <span>Entropy is an estimate, not a guarantee.</span>
          {hasPassword && (
            <Button variant="ghost" size="sm" onClick={() => setPassword("")}>
              <RefreshCw /> Reset test
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}

function RiskRow({ label, safe, value }: { label: string; safe: boolean; value: string }) {
  const waiting = value === "Waiting";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`flex shrink-0 items-center gap-1.5 text-xs font-semibold ${waiting ? "text-muted-foreground" : safe ? "text-safe" : "text-danger"}`}
      >
        {!waiting && (safe ? <Check className="size-3.5" /> : <CircleAlert className="size-3.5" />)}
        {value}
      </span>
    </div>
  );
}
