import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { ToggleAdminButton } from "./ToggleAdminButton";

export const metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-0.5">{profiles?.length ?? 0} registered members</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {!profiles || profiles.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No users yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                        {(profile.username ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{profile.username ?? "—"}</p>
                        <p className="text-xs text-gray-400">{profile.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(profile.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    {profile.id !== currentUser?.id && (
                      <ToggleAdminButton
                        userId={profile.id}
                        currentRole={profile.role as "user" | "admin"}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
