import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/services/firebase';

export async function uploadAvatar(
  userId: string,
  localUri: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const response = await fetch(localUri);
    const blob = await response.blob();
    
    // We store it as avatar.jpg or maintain the original extension. 
    // Assuming standard upload to users/{userId}/avatar.jpg
    const fileRef = ref(storage, `users/${userId}/avatar.jpg`);
    
    await uploadBytes(fileRef, blob, { contentType: blob.type || 'image/jpeg' });
    const downloadUrl = await getDownloadURL(fileRef);
    
    return { url: downloadUrl, error: null };
  } catch (err: any) {
    console.error('[UploadService] uploadAvatar failed:', err);
    return { url: null, error: err.message || 'Upload failed' };
  }
}

export async function uploadFile(
  userId: string,
  localUri: string,
  folder: string = 'updates',
  filename?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const response = await fetch(localUri);
    const blob = await response.blob();
    
    const name = filename || `${Date.now()}`;
    const fileRef = ref(storage, `users/${userId}/${folder}/${name}`);
    
    await uploadBytes(fileRef, blob, { contentType: blob.type || 'application/octet-stream' });
    const downloadUrl = await getDownloadURL(fileRef);
    
    return { url: downloadUrl, error: null };
  } catch (err: any) {
    console.error('[UploadService] uploadFile failed:', err);
    return { url: null, error: err.message || 'Upload failed' };
  }
}
