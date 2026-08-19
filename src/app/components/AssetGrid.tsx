"use client";
import Image from "next/image";

type Asset = {
  id: string;
  url: string;
  kind: string;
  prompt: string;
  createdAt: string;
  persona: { name: string };
  batch: { createdBy: { name: string } };
};

export default function AssetGrid({ assets }: { assets: Asset[] }) {
  if (assets.length === 0) {
    return (
      <div className="border border-dashed border-line rounded-lg py-16 text-center text-muted">
        Rien à afficher pour l&apos;instant. Génère ta première planche.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {assets.map((a) => (
        <div key={a.id} className="group relative bg-surface border border-line rounded-md overflow-hidden">
          <div className="relative aspect-[4/5] bg-surface2">
            {a.kind === "image" ? (
              <Image src={a.url} alt={a.prompt} fill sizes="300px" className="object-cover" />
            ) : (
              <video src={a.url} className="w-full h-full object-cover" muted loop playsInline />
            )}
          </div>
          <div className="p-2 text-xs">
            <p className="text-muted mono truncate" title={a.prompt}>{a.prompt}</p>
            <p className="text-muted/70 mono mt-0.5">
              {a.persona.name} · {a.batch.createdBy.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
