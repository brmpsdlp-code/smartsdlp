import { redirect } from "next/navigation";
import fransAvatar from "@/imports/nft/frans.jpg";
import rehanAvatar from "@/imports/nft/rehan.jpg";
import alifAvatar from "@/imports/nft/alif.jpg";
import haikalAvatar from "@/imports/nft/haikal.jpg";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/Sidebar";
import { getActiveSession } from "@/lib/active-session";

const team = [
  { name: "Frans Muhammed Chan", nim: "19230669", linkedin: "https://linkedin.com/in/frans-muhammed-chan", avatar: fransAvatar },
  { name: "Raihan Naufal Azhar", nim: "10230031", linkedin: "https://linkedin.com/in/raihan-naufal-azhar-898004401", avatar: rehanAvatar },
  { name: "Alif Rizki Dhaulagiri", nim: "10230091", linkedin: "https://linkedin.com/in/alif-rizki-dhaulagiri-670b10334", avatar: alifAvatar },
  { name: "Haikal Prasetya Alhakim", nim: "10230047", linkedin: "https://linkedin.com/in/haikal-alhakim-b02626287", avatar: haikalAvatar },
];

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M6.5 8.5A2 2 0 1 0 6.5 4.5a2 2 0 0 0 0 4ZM5 10h3v9H5v-9Zm5 0h2.9v1.23h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V19h-3v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V19h-3v-9Z" />
    </svg>
  );
}

export default async function TentangPage() {
  const session = await getActiveSession();
  if (!session) redirect("/login?error=inactive");
  if (session.user.mustChangePassword) redirect("/account/change-password");

  const role = session.user.role?.toLowerCase() === "admin" ? "admin" : "user";
  const userProfile = {
    nama: session.user.name,
    nip: session.user.nip ?? "",
    email: session.user.email,
    jabatan: session.user.jabatan ?? "",
    unitKerja: session.user.unitKerja ?? "",
    role,
  } as const;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <div className="print:hidden">
        <Sidebar role={role} userProfile={userProfile} />
      </div>
      <main className="flex-1 overflow-y-auto p-5 pt-16 lg:pt-8">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100">
              Tim Pengembang
            </Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Tentang Aplikasi
            </h1>
            <h2 className="mt-3 text-xl font-bold text-emerald-800 sm:text-2xl">
              Universitas Bina Sarana Informatika
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              SMART - BRMP SDLP dikembangkan oleh tim mahasiswa magang sebagai bagian dari program Praktik Kerja Lapangan (PKL) tahun 2026, bekerja sama dengan Balai Besar Perakitan dan Modernisasi Sumber Daya Lahan Pertanian.
            </p>
          </header>

          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <article
                key={member.nim}
                className="group rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-lg hover:shadow-emerald-950/10"
              >
                <img
                  src={member.avatar.src}
                  alt={`Avatar ${member.name}`}
                  className="mx-auto h-32 w-32 rounded-3xl border-4 border-emerald-50 bg-emerald-50"
                />
                <h2 className="mt-5 text-lg font-bold text-emerald-950">{member.name}</h2>
                <p className="mt-1 text-sm font-medium text-emerald-700">NIM {member.nim}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">Universitas Bina Sarana Informatika</p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Profil LinkedIn ${member.name}`}
                  className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-800 hover:text-white"
                >
                  <LinkedInIcon />
                </a>
              </article>
            ))}
          </section>

          <footer className="mt-12 border-t border-emerald-100 pt-5 text-center text-xs text-slate-400">
            Versi 1.0 · dibangun dengan Next.js, Prisma, PostgreSQL
          </footer>
        </div>
      </main>
    </div>
  );
}
