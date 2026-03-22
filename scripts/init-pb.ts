#!/usr/bin/env tsx
/**
 * Script d'initialisation PocketBase
 * Crée toutes les collections nécessaires au premier démarrage
 * Usage: npm run init-pb
 */

import PocketBase from "pocketbase";

const PB_URL = process.env.POCKETBASE_URL || "http://localhost:8090";
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@studio-ia.local";
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || "admin123456";

async function waitForPocketBase(pb: PocketBase, maxRetries = 30): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fetch(`${PB_URL}/api/health`);
      console.log("✅ PocketBase est accessible");
      return;
    } catch {
      console.log(`⏳ Attente de PocketBase... (${i + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("PocketBase n'est pas accessible après plusieurs tentatives");
}

async function createCollectionIfNotExists(
  pb: PocketBase,
  schema: Record<string, unknown>
): Promise<void> {
  const name = schema.name as string;
  try {
    await pb.collections.getOne(name);
    console.log(`⏭️  Collection '${name}' existe déjà`);
  } catch {
    await pb.collections.create(schema);
    console.log(`✅ Collection '${name}' créée`);
  }
}

async function main(): Promise<void> {
  console.log("🚀 Initialisation de PocketBase Studio IA...\n");

  const pb = new PocketBase(PB_URL);

  await waitForPocketBase(pb);

  // Authentification admin
  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log("✅ Authentifié en tant qu'admin\n");
  } catch {
    // Essayer de créer l'admin s'il n'existe pas
    try {
      await pb.admins.create({
        email: PB_ADMIN_EMAIL,
        password: PB_ADMIN_PASSWORD,
        passwordConfirm: PB_ADMIN_PASSWORD,
      });
      await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
      console.log("✅ Admin créé et authentifié\n");
    } catch (err) {
      console.error("❌ Impossible de s'authentifier ou créer l'admin:", err);
      process.exit(1);
    }
  }

  // Collection: artists
  await createCollectionIfNotExists(pb, {
    name: "artists",
    type: "base",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "bio_short", type: "text" },
      { name: "bio_long", type: "text" },
      {
        name: "avatar",
        type: "file",
        options: { maxSelect: 1, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
      },
      { name: "musical_dna", type: "json" },
      { name: "lyrical_dna", type: "json" },
      { name: "visual_identity", type: "json" },
      { name: "lore", type: "json" },
    ],
  });

  // Collection: templates
  await createCollectionIfNotExists(pb, {
    name: "templates",
    type: "base",
    schema: [
      {
        name: "artist",
        type: "relation",
        required: true,
        options: { collectionId: "artists", cascadeDelete: false, maxSelect: 1 },
      },
      { name: "name", type: "text", required: true },
      { name: "structure", type: "json" },
      { name: "style", type: "json" },
      { name: "theme", type: "json" },
      { name: "narrative", type: "json" },
    ],
  });

  // Collection: albums
  await createCollectionIfNotExists(pb, {
    name: "albums",
    type: "base",
    schema: [
      {
        name: "artist",
        type: "relation",
        required: true,
        options: { collectionId: "artists", cascadeDelete: false, maxSelect: 1 },
      },
      { name: "title", type: "text", required: true },
      { name: "concept", type: "text" },
      { name: "lore", type: "text" },
      {
        name: "cover",
        type: "file",
        options: { maxSelect: 1, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
      },
      { name: "cover_prompt", type: "text" },
      {
        name: "status",
        type: "select",
        options: { values: ["idea", "in_progress", "complete"] },
      },
      { name: "release_date", type: "date" },
    ],
  });

  // Collection: tracks
  await createCollectionIfNotExists(pb, {
    name: "tracks",
    type: "base",
    schema: [
      {
        name: "artist",
        type: "relation",
        required: true,
        options: { collectionId: "artists", cascadeDelete: false, maxSelect: 1 },
      },
      {
        name: "album",
        type: "relation",
        options: { collectionId: "albums", cascadeDelete: false, maxSelect: 1 },
      },
      {
        name: "template",
        type: "relation",
        options: { collectionId: "templates", cascadeDelete: false, maxSelect: 1 },
      },
      { name: "title", type: "text", required: true },
      {
        name: "status",
        type: "select",
        options: { values: ["idea", "draft", "in_progress", "final"] },
      },
      { name: "concept_sheet", type: "text" },
      { name: "lore_connections", type: "text" },
      { name: "lyrics_raw", type: "text" },
      { name: "lyrics_suno", type: "text" },
      { name: "prompt_style", type: "text" },
      { name: "prompt_cover", type: "text" },
      { name: "suno_url", type: "url" },
      {
        name: "master_mp3",
        type: "file",
        options: {
          maxSelect: 1,
          maxSize: 524288000, // 500MB
          mimeTypes: ["audio/mpeg"],
        },
      },
      {
        name: "master_wav",
        type: "file",
        options: {
          maxSelect: 1,
          maxSize: 524288000,
          mimeTypes: ["audio/wav", "audio/x-wav"],
        },
      },
      {
        name: "stem_instrumental",
        type: "file",
        options: {
          maxSelect: 1,
          maxSize: 524288000,
          mimeTypes: ["audio/mpeg", "audio/wav", "audio/x-wav"],
        },
      },
      {
        name: "stem_vocals",
        type: "file",
        options: {
          maxSelect: 1,
          maxSize: 524288000,
          mimeTypes: ["audio/mpeg", "audio/wav", "audio/x-wav"],
        },
      },
      {
        name: "stems_other",
        type: "file",
        options: {
          maxSelect: 10,
          maxSize: 524288000,
          mimeTypes: ["audio/mpeg", "audio/wav", "audio/x-wav"],
        },
      },
      {
        name: "cover",
        type: "file",
        options: { maxSelect: 1, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
      },
      {
        name: "cover_variants",
        type: "file",
        options: { maxSelect: 10, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
      },
      { name: "tags", type: "json" },
    ],
  });

  // Collection: agents
  await createCollectionIfNotExists(pb, {
    name: "agents",
    type: "base",
    schema: [
      {
        name: "artist",
        type: "relation",
        required: true,
        options: { collectionId: "artists", cascadeDelete: false, maxSelect: 1 },
      },
      {
        name: "type",
        type: "select",
        options: {
          values: [
            "artistic_director",
            "lyricist",
            "arranger",
            "visual_director",
            "lore_keeper",
            "producer",
          ],
        },
      },
      { name: "name", type: "text" },
      { name: "system_prompt", type: "text", required: true },
      { name: "model", type: "text" },
      { name: "temperature", type: "number" },
      { name: "memory_access", type: "json" },
    ],
  });

  // Collection: projects
  await createCollectionIfNotExists(pb, {
    name: "projects",
    type: "base",
    schema: [
      {
        name: "artist",
        type: "relation",
        required: true,
        options: { collectionId: "artists", cascadeDelete: false, maxSelect: 1 },
      },
      {
        name: "type",
        type: "select",
        options: { values: ["track", "album"] },
      },
      {
        name: "track",
        type: "relation",
        options: { collectionId: "tracks", cascadeDelete: false, maxSelect: 1 },
      },
      {
        name: "album",
        type: "relation",
        options: { collectionId: "albums", cascadeDelete: false, maxSelect: 1 },
      },
      { name: "title", type: "text", required: true },
      {
        name: "status",
        type: "select",
        options: { values: ["active", "archived"] },
      },
    ],
  });

  // Collection: sessions
  await createCollectionIfNotExists(pb, {
    name: "sessions",
    type: "base",
    schema: [
      {
        name: "project",
        type: "relation",
        required: true,
        options: { collectionId: "projects", cascadeDelete: false, maxSelect: 1 },
      },
      {
        name: "agent",
        type: "relation",
        required: true,
        options: { collectionId: "agents", cascadeDelete: false, maxSelect: 1 },
      },
      { name: "messages", type: "json" },
    ],
  });

  console.log("\n🎉 Initialisation PocketBase terminée avec succès!");
  console.log(`\n📌 Interface admin PocketBase: ${PB_URL}/_/`);
  console.log(`📧 Email admin: ${PB_ADMIN_EMAIL}`);
  console.log(`🔑 Mot de passe admin: ${PB_ADMIN_PASSWORD}`);
  console.log("\n⚠️  Pensez à changer le mot de passe admin!");
}

main().catch((err) => {
  console.error("❌ Erreur d'initialisation:", err);
  process.exit(1);
});
