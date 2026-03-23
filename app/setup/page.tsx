"use client";

import { useState } from "react";
import PocketBase from "pocketbase";

const COLLECTIONS = [
  {
    name: "artists",
    schema: [
      { name: "name",            type: "text",   required: true  },
      { name: "bio_short",       type: "text"                    },
      { name: "bio_long",        type: "text"                    },
      { name: "musical_dna",     type: "json"                    },
      { name: "lyrical_dna",     type: "json"                    },
      { name: "visual_identity", type: "json"                    },
      { name: "lore",            type: "json"                    },
      { name: "avatar",          type: "file",   maxSelect: 1,
        maxSize: 5242880, mimeTypes: ["image/jpeg","image/png","image/webp"] },
    ],
  },
  {
    name: "agents",
    schema: [
      { name: "artist",         type: "relation", collectionName: "artists", cascadeDelete: true,  maxSelect: 1, required: true },
      { name: "type",           type: "select",   maxSelect: 1, required: true,
        values: ["artistic_director","lyricist","arranger","visual_director","lore_keeper","producer"] },
      { name: "name",           type: "text",   required: true },
      { name: "system_prompt",  type: "text"                   },
      { name: "model",          type: "text"                   },
      { name: "temperature",    type: "number"                 },
      { name: "memory_access",  type: "json"                   },
    ],
  },
  {
    name: "albums",
    schema: [
      { name: "artist",       type: "relation", collectionName: "artists", cascadeDelete: true, maxSelect: 1, required: true },
      { name: "title",        type: "text",   required: true },
      { name: "concept",      type: "text"                   },
      { name: "lore",         type: "text"                   },
      { name: "cover_prompt", type: "text"                   },
      { name: "status",       type: "select", maxSelect: 1,
        values: ["idea","in_progress","complete"] },
      { name: "release_date", type: "text" },
      { name: "cover",        type: "file", maxSelect: 1, maxSize: 10485760,
        mimeTypes: ["image/jpeg","image/png","image/webp"] },
    ],
  },
  {
    name: "templates",
    schema: [
      { name: "artist",    type: "relation", collectionName: "artists", cascadeDelete: true, maxSelect: 1, required: true },
      { name: "name",      type: "text", required: true },
      { name: "structure", type: "json" },
      { name: "style",     type: "json" },
      { name: "theme",     type: "json" },
      { name: "narrative", type: "json" },
    ],
  },
  {
    name: "tracks",
    schema: [
      { name: "artist",           type: "relation", collectionName: "artists",   cascadeDelete: true,  maxSelect: 1, required: true },
      { name: "album",            type: "relation", collectionName: "albums",    cascadeDelete: false, maxSelect: 1 },
      { name: "template",         type: "relation", collectionName: "templates", cascadeDelete: false, maxSelect: 1 },
      { name: "title",            type: "text",   required: true },
      { name: "status",           type: "select", maxSelect: 1,
        values: ["idea","draft","in_progress","final"] },
      { name: "concept_sheet",    type: "text" },
      { name: "lore_connections", type: "text" },
      { name: "lyrics_raw",       type: "text" },
      { name: "lyrics_suno",      type: "text" },
      { name: "prompt_style",     type: "text" },
      { name: "prompt_cover",     type: "text" },
      { name: "suno_url",         type: "url"  },
      { name: "tags",             type: "json" },
      { name: "master_mp3",       type: "file", maxSelect: 1, maxSize: 52428800,  mimeTypes: ["audio/mpeg","audio/mp3"] },
      { name: "master_wav",       type: "file", maxSelect: 1, maxSize: 209715200, mimeTypes: ["audio/wav","audio/x-wav"] },
      { name: "cover",            type: "file", maxSelect: 1, maxSize: 10485760,  mimeTypes: ["image/jpeg","image/png","image/webp"] },
    ],
  },
  {
    name: "projects",
    schema: [
      { name: "artist", type: "relation", collectionName: "artists", cascadeDelete: true,  maxSelect: 1, required: true },
      { name: "type",   type: "select", maxSelect: 1, values: ["track","album"] },
      { name: "track",  type: "relation", collectionName: "tracks", cascadeDelete: false, maxSelect: 1 },
      { name: "album",  type: "relation", collectionName: "albums", cascadeDelete: false, maxSelect: 1 },
      { name: "title",  type: "text" },
      { name: "status", type: "select", maxSelect: 1, values: ["active","archived"] },
    ],
  },
  {
    name: "sessions",
    schema: [
      { name: "project",  type: "relation", collectionName: "projects", cascadeDelete: true, maxSelect: 1 },
      { name: "agent",    type: "relation", collectionName: "agents",   cascadeDelete: true, maxSelect: 1 },
      { name: "messages", type: "json" },
    ],
  },
];

type Log = { text: string; ok: boolean };

export default function SetupPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [logs, setLogs]         = useState<Log[]>([]);
  const [running, setRunning]   = useState(false);
  const [done, setDone]         = useState(false);

  const addLog = (text: string, ok = true) =>
    setLogs((l) => [...l, { text, ok }]);

  const run = async () => {
    setLogs([]);
    setRunning(true);
    setDone(false);

    const pbUrl = "http://localhost:8090";
    const pb = new PocketBase(pbUrl);

    try {
      addLog("Connexion à PocketBase admin...");
      // Try new superusers API first (PocketBase v0.23+)
      try {
        await pb.collection("_superusers").authWithPassword(email, password);
      } catch {
        // Fallback to old admins API (PocketBase v0.22)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (pb as any).admins.authWithPassword(email, password);
      }
      addLog("Connecté ✓");
    } catch (e) {
      addLog(`Echec de connexion : ${String(e)}`, false);
      setRunning(false);
      return;
    }

    // Resolve relation collectionIds
    const idMap: Record<string, string> = {};
    try {
      const existing = await pb.collections.getFullList();
      for (const c of existing) idMap[c.name] = c.id;
    } catch (_) {}

    for (const col of COLLECTIONS) {
      // Already exists?
      if (idMap[col.name]) {
        addLog(`${col.name} — déjà présente, ignorée`);
        continue;
      }

      // Resolve relation collectionIds in schema
      const schema = col.schema.map((f) => {
        if (f.type === "relation" && "collectionName" in f) {
          const { collectionName, ...rest } = f as typeof f & { collectionName: string };
          return { ...rest, collectionId: idMap[collectionName] ?? "" };
        }
        return f;
      });

      try {
        const created = await pb.collections.create({
          name: col.name,
          type: "base",
          listRule: "",
          viewRule: "",
          createRule: "",
          updateRule: "",
          deleteRule: "",
          schema,
        });
        idMap[col.name] = created.id;
        addLog(`${col.name} — créée ✓`);
      } catch (e) {
        addLog(`${col.name} — ERREUR : ${String(e)}`, false);
      }
    }

    setRunning(false);
    setDone(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <div style={{ width: 480, padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Setup — Studio IA</h1>
        <p style={{ color: "#71717a", fontSize: 13, marginBottom: 24 }}>
          Crée toutes les collections PocketBase.<br />
          Utilise les identifiants du compte superuser créé sur{" "}
          <a href="http://localhost:8090/_/" target="_blank" style={{ color: "#a78bfa" }}>localhost:8090/_/</a>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <input
            type="email"
            placeholder="Email admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px 14px", background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff", fontSize: 14 }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px 14px", background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff", fontSize: 14 }}
          />
          <button
            onClick={() => void run()}
            disabled={running || !email || !password}
            style={{
              padding: "10px 14px", background: running ? "#52525b" : "#7c3aed",
              border: "none", borderRadius: 8, color: "#fff", fontSize: 14,
              cursor: running ? "not-allowed" : "pointer", fontWeight: 600,
            }}
          >
            {running ? "En cours..." : "Lancer le setup"}
          </button>
        </div>

        {logs.length > 0 && (
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, padding: 16, fontSize: 13, lineHeight: "1.8" }}>
            {logs.map((l, i) => (
              <div key={i} style={{ color: l.ok ? "#86efac" : "#f87171" }}>{l.text}</div>
            ))}
          </div>
        )}

        {done && (
          <div style={{ marginTop: 16, padding: 16, background: "#14532d", borderRadius: 8, fontSize: 13 }}>
            Setup terminé.{" "}
            <a href="/" style={{ color: "#86efac", textDecoration: "underline" }}>
              Retour à l&apos;application →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
