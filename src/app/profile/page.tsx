import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { ProfileLogoutButton } from "./ProfileLogoutButton";
import type { Profile } from "@/types";

export const metadata = { title: "My Dashboard — Al Huda Review" };

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0 gap-1">
      <dt className="text-sm font-medium text-gray-500 sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("profiles")
    .select("id, username, full_name, identity_status, batch_year, role, created_at")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;

  const initials = (() => {
    const name = profile?.full_name?.trim();
    if (name) {
      const parts = name.split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return parts[0][0].toUpperCase();
    }
    return (user.email?.[0] ?? "U").toUpperCase();
  })();

  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Header user={user} profile={profile} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Avatar + name hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.full_name ?? user.email}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                profile?.role === "admin"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {profile?.role === "admin" ? "Admin" : "Member"}
              </span>
              {profile?.identity_status && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                  {profile.identity_status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile details card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Profile Details</h2>
          </div>
          <dl className="px-6">
            <InfoRow label="Full Name" value={profile?.full_name} />
            <InfoRow label="Email Address" value={user.email} />
            <InfoRow label="Identity / Status" value={profile?.identity_status} />
            <InfoRow
              label="Batch Year"
              value={profile?.batch_year === null ? "N/A" : profile?.batch_year}
            />
            <InfoRow label="Account Role" value={profile?.role === "admin" ? "Administrator" : "Member"} />
            <InfoRow label="Member Since" value={joinDate} />
          </dl>
        </div>

        {/* Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Account Actions</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {profile?.role === "admin" && (
              <a
                href="/admin"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Go to Admin Panel
              </a>
            )}
            <ProfileLogoutButton />
          </div>
        </div>
      </main>
    </div>
  );
}
