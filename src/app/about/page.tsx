import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import type { Profile } from "@/types";

export const metadata = {
  title: "About — Al Huda Review",
};

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, identity_status, batch_year, role, created_at")
      .eq("id", user.id)
      .single();
    profile = data as Profile | null;
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Header user={user} profile={profile} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">About Al Huda Review</h1>
          <p className="mt-3 text-lg text-indigo-600 font-medium">
            Constructive Critique and Perspectives on Reformation
          </p>
          <div className="mt-4 h-0.5 bg-gray-200 w-16" />
        </div>

        <article className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed text-[1.0625rem]">
          <p>
            Founded in 1986, Darul Huda Islamic University pioneered a revolutionary academic paradigm. At a time when
            modern and religious education existed in silos, and societal skepticism was high, Darul Huda broke barriers
            by integrating both streams into a unified curriculum. As its graduates stepped into the global arena, the
            success of this model became undeniable, cementing its reputation as a vanguard of modern Islamic schooling.
          </p>
          <p>
            However, four decades later, the educational landscape has shifted entirely. What was once an exclusive
            innovation of Darul Huda has now become the industry standard across almost every traditional seminary and
            localized Dars system in Kerala and beyond. Today, the institutional distinction has blurred.
          </p>
          <p>
            We find ourselves well into the 21st century — an era defined by rapid technological advancements, evolving
            socio-political dynamics, and unprecedented intellectual challenges. An institution cannot successfully
            navigate the complex realities of today using pedagogical frameworks frozen in the 20th century. Doing so
            risks stagnation and, critically, compromises the invaluable 12 years that students commit to this system
            during their formative years.
          </p>
          <p>
            <em>Al Huda Review</em> is established to address this critical evolutionary juncture. We believe that true
            institutional loyalty lies not in uncritical praise, but in rigorous, constructive critique and structural
            reformation. Our mission is to foster open intellectual discourse, scrutinize contemporary trends, and
            advocate for necessary structural reforms within Darul Huda — ensuring that it evolves with the changing
            tides of time while maintaining its core academic integrity.
          </p>
        </article>

        <div className="mt-14 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contribute Your Perspectives</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We welcome analytical essays, critical reflections, and reform proposals from current students, alumni,
            faculty, and informed guests. Rigorous thought and constructive argument are the currency here.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            <strong>Absolute anonymity is guaranteed.</strong> We understand that honest critique requires safety,
            particularly for current students and those within the institution. Your identity will never be disclosed
            under any circumstances. Submit your piece and we will handle the rest.
          </p>
          <a
            href="mailto:contact@alhudareview.com"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            contact@alhudareview.com
          </a>
        </div>
      </main>
    </div>
  );
}
