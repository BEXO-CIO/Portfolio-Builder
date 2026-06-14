export async function uploadAvatar(
  userId: string,
  localUri: string
): Promise<{ url: string | null; error: string | null }> {
  await new Promise((r) => setTimeout(r, 1200));
  return { url: localUri, error: null };
}
