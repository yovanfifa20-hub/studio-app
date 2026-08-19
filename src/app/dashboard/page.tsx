"use client";
import { useCallback, useEffect, useState } from "react";
import Nav from "@/components/Nav";
import GenerateForm from "@/components/GenerateForm";
import AssetGrid from "@/components/AssetGrid";

export default function DashboardPage() {
  const [assets, setAssets] = useState([]);

  const refresh = useCallback(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((d) => setAssets((d.assets || []).slice(0, 12)));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="display text-2xl mb-1">Nouvelle génération</h1>
          <p className="text-muted text-sm">
            Chaque image passe automatiquement par le nettoyage de métadonnées et la détection de
            doublons avant d&apos;être enregistrée.
          </p>
        </div>

        <GenerateForm onGenerated={refresh} />

        <div className="sprocket-rule" />

        <div>
          <h2 className="display text-lg mb-3">Dernières générations</h2>
          <AssetGrid assets={assets} />
        </div>
      </main>
    </div>
  );
}
