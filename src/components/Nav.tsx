"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Générer" },
  { href: "/gallery", label: "Historique" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
    <header className="border-b border-line">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="display text-lg">Studio</span>
          <nav className="flex gap-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={pathname === l.href ? "text-ink" : "text-muted hover:text-ink transition"}
              >
                {l.label}
              </Link>
            ))}
            {role === "ADMIN" && (
              <Link
                href="/admin/users"
                className={pathname === "/admin/users" ? "text-ink" : "text-muted hover:text-ink transition"}
              >
                Équipe
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted">{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-muted hover:text-accent transition">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
