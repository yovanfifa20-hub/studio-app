"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import AssetGrid from "@/components/AssetGrid";

type Persona = { id: string; name: string };

export default function GalleryPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personaId, setPersonaId] = useState("");
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetch("/api/personas").then((r) => r.json()).then((d) => setPersonas(d.personas || []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (personaId) params.set("personaId", personaId);
    if (search) params.set("search", search);
    fetch(`/api/assets?${params}`).then((r) => r.json()).then((d) => setAssets(d.assets || []));
  }, [personaId, search]);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="display text-2xl">Historique</h1>
          <div className="flex gap-3">
            <select
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
              className="bg-surface border border-line rounded px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">Toutes les personas</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Rechercher un prompt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface border border-line rounded px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>
        <AssetGrid assets={assets} />
      </main>
    </div>
  );
}
