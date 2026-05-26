"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, Link } from "@/navigation";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations('Landing'); // Reusing landing translations for simplicity in this phase
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Login failed");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[#F1F5F9]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-[#475569]">{t('welcomeBack')}!</h1>
        <p className="text-center text-sm font-bold text-[#64748b] uppercase tracking-widest">QAMAR Universe</p>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-lg">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#475569]">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#475569]">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-[#FF6B6B] rounded-lg font-bold hover:bg-[#ff5252] transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="flex flex-col space-y-2 text-center">
            <p className="text-sm text-[#64748b]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#FF6B6B] font-semibold hover:underline">
                Sign up
            </Link>
            </p>
            <Link href="/" className="text-sm text-[#475569] hover:underline">
                Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}
