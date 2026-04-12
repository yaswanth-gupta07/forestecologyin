"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/admin/dashboard");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.code, error.message);
        setError(error.message);
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error("Login exception:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-950">
        <div className="w-10 h-10 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-950 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-forest-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-forest-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest-700 mb-4">
            <svg className="w-8 h-8 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Forest Ecology</h1>
          <p className="text-forest-400/70 text-sm mt-1">
            Admin Dashboard Login
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Email
            </label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl
                  text-white placeholder-white/25 text-sm
                  focus:outline-none focus:ring-2 focus:ring-forest-500/50 focus:border-forest-500/50
                  transition-all duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl
                  text-white placeholder-white/25 text-sm
                  focus:outline-none focus:ring-2 focus:ring-forest-500/50 focus:border-forest-500/50
                  transition-all duration-150"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-forest-600 hover:bg-forest-700 text-white font-medium text-sm
              rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-forest-500/50 focus:ring-offset-2 focus:ring-offset-forest-950"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-6">
          Forest Ecology &amp; Management Research
        </p>
      </div>
    </div>
  );
}
