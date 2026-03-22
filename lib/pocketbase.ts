import PocketBase from "pocketbase";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";

let pbInstance: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (!pbInstance) {
    pbInstance = new PocketBase(POCKETBASE_URL);
    pbInstance.autoCancellation(false);
  }
  return pbInstance;
}

export async function getPocketBaseAdmin(): Promise<PocketBase> {
  const pb = getPocketBase();
  // Authenticate as admin if credentials are provided
  const adminEmail = process.env.PB_ADMIN_EMAIL;
  const adminPassword = process.env.PB_ADMIN_PASSWORD;
  if (adminEmail && adminPassword && !pb.authStore.isValid) {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
  }
  return pb;
}

export function getFileUrl(
  collection: string,
  recordId: string,
  filename: string,
  thumb?: string
): string {
  if (!filename) return "";
  const pb = getPocketBase();
  return pb.files.getUrl({ id: recordId, collectionId: collection, collectionName: collection }, filename, thumb ? { thumb } : undefined);
}

export default getPocketBase;
