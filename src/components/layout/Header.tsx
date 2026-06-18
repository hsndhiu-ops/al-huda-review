import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  user: User | null;
  profile?: Profile | null;
}

export function Header({ user, profile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight text-gray-900 hover:text-indigo-600 transition-colors shrink-0"
        >
          Al Huda Review
        </Link>

        <div className="flex items-center gap-2 sm:gap-5 ml-auto">
          <nav className="hidden sm:flex items-center gap-5">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Articles
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
          </nav>

          <SearchBar />

          {user ? (
            <UserMenu email={user.email ?? ""} profile={profile ?? null} />
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </Link>
              <Link href="/auth/register" className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
