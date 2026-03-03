"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type Mode = "login" | "signup";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!displayName.trim()) throw new Error("이름을 입력해주세요.");
        await signUp(email, password, displayName.trim());
      } else {
        await signIn(email, password);
      }
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "오류가 발생했습니다.";
      if (msg.includes("email-already-in-use")) setError("이미 사용 중인 이메일입니다.");
      else if (msg.includes("invalid-credential") || msg.includes("wrong-password"))
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      else if (msg.includes("weak-password")) setError("비밀번호는 6자 이상이어야 합니다.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/favicon.ico" alt="Ping" width={64} height={64} className="rounded-3xl shadow-xl shadow-sky-200" />
          </div>
        </div>

        {/* 탭 */}
        <div className="flex bg-sky-100 rounded-2xl p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === "login"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === "signup"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-sky-100 p-6 border border-sky-100 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                이름 (닉네임)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="홍길동"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@ping.app"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white text-sm font-bold shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-sky-500 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          {mode === "login" ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="text-sky-500 font-bold hover:underline"
          >
            {mode === "login" ? "회원가입" : "로그인"}
          </button>
        </p>
      </div>
    </div>
  );
}
