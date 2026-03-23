/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {

  // ── artists ──────────────────────────────────────────────────────────────
  const artists = new Collection({
    type: "base",
    name: "artists",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "name",             type: "text",   required: true  },
      { name: "bio_short",        type: "text"                    },
      { name: "bio_long",         type: "text"                    },
      { name: "musical_dna",      type: "json"                    },
      { name: "lyrical_dna",      type: "json"                    },
      { name: "visual_identity",  type: "json"                    },
      { name: "lore",             type: "json"                    },
      {
        name: "avatar", type: "file",
        maxSelect: 1, maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
      }
    ]
  });
  app.save(artists);

  // ── agents ───────────────────────────────────────────────────────────────
  const agents = new Collection({
    type: "base",
    name: "agents",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "artist", type: "relation", required: true,
        collectionId: app.findCollectionByNameOrId("artists").id,
        cascadeDelete: true, maxSelect: 1
      },
      {
        name: "type", type: "select", required: true, maxSelect: 1,
        values: ["artistic_director", "lyricist", "arranger", "visual_director", "lore_keeper", "producer"]
      },
      { name: "name",          type: "text",   required: true },
      { name: "system_prompt", type: "text"                   },
      { name: "model",         type: "text"                   },
      { name: "temperature",   type: "number"                 },
      { name: "memory_access", type: "json"                   }
    ]
  });
  app.save(agents);

  // ── albums ───────────────────────────────────────────────────────────────
  const albums = new Collection({
    type: "base",
    name: "albums",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "artist", type: "relation", required: true,
        collectionId: app.findCollectionByNameOrId("artists").id,
        cascadeDelete: true, maxSelect: 1
      },
      { name: "title",        type: "text", required: true },
      { name: "concept",      type: "text"                 },
      { name: "lore",         type: "text"                 },
      { name: "cover_prompt", type: "text"                 },
      {
        name: "status", type: "select", maxSelect: 1,
        values: ["idea", "in_progress", "complete"]
      },
      { name: "release_date", type: "text" },
      {
        name: "cover", type: "file",
        maxSelect: 1, maxSize: 10485760,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"]
      }
    ]
  });
  app.save(albums);

  // ── templates ────────────────────────────────────────────────────────────
  const templates = new Collection({
    type: "base",
    name: "templates",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "artist", type: "relation", required: true,
        collectionId: app.findCollectionByNameOrId("artists").id,
        cascadeDelete: true, maxSelect: 1
      },
      { name: "name",      type: "text", required: true },
      { name: "structure", type: "json"                 },
      { name: "style",     type: "json"                 },
      { name: "theme",     type: "json"                 },
      { name: "narrative", type: "json"                 }
    ]
  });
  app.save(templates);

  // ── tracks ───────────────────────────────────────────────────────────────
  const tracks = new Collection({
    type: "base",
    name: "tracks",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "artist", type: "relation", required: true,
        collectionId: app.findCollectionByNameOrId("artists").id,
        cascadeDelete: true, maxSelect: 1
      },
      {
        name: "album", type: "relation",
        collectionId: app.findCollectionByNameOrId("albums").id,
        cascadeDelete: false, maxSelect: 1
      },
      {
        name: "template", type: "relation",
        collectionId: app.findCollectionByNameOrId("templates").id,
        cascadeDelete: false, maxSelect: 1
      },
      { name: "title",            type: "text", required: true },
      {
        name: "status", type: "select", maxSelect: 1,
        values: ["idea", "draft", "in_progress", "final"]
      },
      { name: "concept_sheet",    type: "text" },
      { name: "lore_connections", type: "text" },
      { name: "lyrics_raw",       type: "text" },
      { name: "lyrics_suno",      type: "text" },
      { name: "prompt_style",     type: "text" },
      { name: "prompt_cover",     type: "text" },
      { name: "suno_url",         type: "url"  },
      { name: "tags",             type: "json" },
      {
        name: "master_mp3", type: "file", maxSelect: 1, maxSize: 52428800,
        mimeTypes: ["audio/mpeg", "audio/mp3"]
      },
      {
        name: "master_wav", type: "file", maxSelect: 1, maxSize: 209715200,
        mimeTypes: ["audio/wav", "audio/x-wav"]
      },
      {
        name: "cover", type: "file", maxSelect: 1, maxSize: 10485760,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"]
      }
    ]
  });
  app.save(tracks);

  // ── projects ─────────────────────────────────────────────────────────────
  const projects = new Collection({
    type: "base",
    name: "projects",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "artist", type: "relation", required: true,
        collectionId: app.findCollectionByNameOrId("artists").id,
        cascadeDelete: true, maxSelect: 1
      },
      {
        name: "type", type: "select", maxSelect: 1,
        values: ["track", "album"]
      },
      {
        name: "track", type: "relation",
        collectionId: app.findCollectionByNameOrId("tracks").id,
        cascadeDelete: false, maxSelect: 1
      },
      {
        name: "album", type: "relation",
        collectionId: app.findCollectionByNameOrId("albums").id,
        cascadeDelete: false, maxSelect: 1
      },
      { name: "title", type: "text" },
      {
        name: "status", type: "select", maxSelect: 1,
        values: ["active", "archived"]
      }
    ]
  });
  app.save(projects);

  // ── sessions ─────────────────────────────────────────────────────────────
  const sessions = new Collection({
    type: "base",
    name: "sessions",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "project", type: "relation",
        collectionId: app.findCollectionByNameOrId("projects").id,
        cascadeDelete: true, maxSelect: 1
      },
      {
        name: "agent", type: "relation",
        collectionId: app.findCollectionByNameOrId("agents").id,
        cascadeDelete: true, maxSelect: 1
      },
      { name: "messages", type: "json" }
    ]
  });
  app.save(sessions);

}, (app) => {
  // Rollback in reverse order
  for (const name of ["sessions", "projects", "tracks", "templates", "albums", "agents", "artists"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name));
    } catch (_) {}
  }
});
