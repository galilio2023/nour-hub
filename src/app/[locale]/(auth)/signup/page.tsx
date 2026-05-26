"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, Link } from "@/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [birthYear, setBirthYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
        username,
        birthYear,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (error) {
        setError(error.message || "Signup failed");
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
        <h1 className="text-3xl font-black text-center text-[#475569] uppercase tracking-tighter">Join QAMAR</h1>
        <p className="text-center text-sm text-[#64748b]">Create your account to start making art!</p>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-lg">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#475569]">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#475569]">Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Pick a cool username"
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-[#475569]">Birth Year</label>
            <input
              type="number"
              required
              min="1990"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] outline-none"
              value={birthYear}
              onChange={(e) => setBirthYear(parseInt(e.target.value))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-[#FF6B6B] rounded-lg font-bold hover:bg-[#ff5252] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-[#64748b]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#FF6B6B] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
