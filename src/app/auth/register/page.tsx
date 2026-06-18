"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const IDENTITY_OPTIONS = [
  "Current Student",
  "Alumnus / Hudawi",
  "Staff / Faculty",
  "Guest",
] as const;

const BATCH_YEARS = Array.from({ length: 2029 - 1986 + 1 }, (_, i) => 1986 + i);

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identityStatus, setIdentityStatus] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!identityStatus) {
      setError("Please select your Identity / Status.");
      return;
    }
    if (!batchYear) {
      setError("Please select your Batch Year.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update the profile row created by the DB trigger with extra fields
    if (data.user) {
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          identity_status: identityStatus,
          batch_year: parseInt(batchYear, 10),
        })
        .eq("id", data.user.id);
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/auth/login"), 3000);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500">
            We sent a confirmation link to <strong>{email}</strong>. Redirecting to sign in…
          </p>
        </div>
      </div>
    );
  }

  const selectClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white";

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-2xl text-gray-900 mb-6">
            Al Huda Review
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-1 text-gray-500">Join to read full articles and leave comments</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>{" "}
                <span className="text-gray-400 font-normal">(min. 6 characters)</span>
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="identityStatus" className="block text-sm font-medium text-gray-700 mb-1.5">
                Identity / Status <span className="text-red-500">*</span>
              </label>
              <select
                id="identityStatus"
                required
                value={identityStatus}
                onChange={(e) => setIdentityStatus(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>Select your status…</option>
                {IDENTITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batchYear" className="block text-sm font-medium text-gray-700 mb-1.5">
                Batch Year <span className="text-red-500">*</span>
              </label>
              <select
                id="batchYear"
                required
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>Select batch year…</option>
                <option value="N/A">Not Applicable (N/A)</option>
                {BATCH_YEARS.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-600 font-medium hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
