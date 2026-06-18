"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  currentRole: "user" | "admin";
}

export function ToggleAdminButton({ userId, currentRole }: Props) {
  const router = useRouter();

  async function handleToggle() {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmMsg = `${newRole === "admin" ? "Grant" : "Remove"} admin role for this user?`;
    if (!confirm(confirmMsg)) return;

    const supabase = createClient();
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      className={`text-sm font-medium transition-colors ${
        currentRole === "admin"
          ? "text-gray-500 hover:text-red-600"
          : "text-indigo-600 hover:text-indigo-700"
      }`}
    >
      {currentRole === "admin" ? "Remove admin" : "Make admin"}
    </button>
  );
}
