"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

type User = { id: string; name: string; email: string; role: string; createdAt: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VA");
  const [error, setError] = useState("");

  function refresh() {
    fetch("/api/users").then((r) => r.json()).then((d) => setUsers(d.users || []));
  }

  useEffect(refresh, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Erreur");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    refresh();
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <h1 className="display text-2xl">Équipe</h1>

        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-5 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-muted block mb-1">Nom</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="bg-surface2 border border-line rounded px-3 py-2 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="bg-surface2 border border-line rounded px-3 py-2 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Mot de passe temporaire</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="bg-surface2 border border-line rounded px-3 py-2 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Rôle</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="bg-surface2 border border-line rounded px-3 py-2 outline-none focus:border-accent">
              <option value="VA">VA</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="bg-accent text-ink rounded px-4 py-2 font-medium">Ajouter</button>
          {error && <p className="text-accent text-sm w-full">{error}</p>}
        </form>

        <table className="w-full text-sm">
          <thead className="text-muted text-left border-b border-line">
            <tr>
              <th className="py-2 font-normal">Nom</th>
              <th className="py-2 font-normal">Email</th>
              <th className="py-2 font-normal">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line/50">
                <td className="py-2">{u.name}</td>
                <td className="py-2 mono text-muted">{u.email}</td>
                <td className="py-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
