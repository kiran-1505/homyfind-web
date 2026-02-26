import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { storage, getFirebaseAuth } from './firebase';

/**
 * Ensure user is authenticated (anonymous auth as fallback)
 * Required because Firebase Storage rules require auth
 */
async function ensureAuth(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

// ─── Image Compression ─────────────────────────────────────

const COMPRESS_MAX_WIDTH = 1024;   // px — sharp for web/mobile, great compression
const COMPRESS_MAX_HEIGHT = 1024;
const WEBP_QUALITY = 0.75;         // WebP at 75% ≈ JPEG at 85% visually
const JPEG_QUALITY = 0.7;          // JPEG fallback quality

/**
 * Check if the browser supports WebP encoding via Canvas.
 */
function supportsWebP(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Compress an image file using the browser Canvas API.
 * - Resizes to max 1024x1024 while keeping aspect ratio
 * - Uses WebP (75% quality) if supported, else JPEG (70%)
 * - High-quality image smoothing for sharp downscaling
 * - A typical 3-5MB phone photo shrinks to ~50-150KB
 *
 * Returns a new File ready for upload. If compression fails (e.g. SSR),
 * returns the original file as a fallback.
 */
export async function compressImage(file: File): Promise<File> {
  // Only compress images (skip PDFs, etc.)
  if (!file.type.startsWith('image/')) return file;

  // Canvas API only available in the browser
  if (typeof window === 'undefined' || typeof document === 'undefined') return file;

  return new Promise<File>((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions keeping aspect ratio
      if (width > COMPRESS_MAX_WIDTH) {
        height = Math.round(height * (COMPRESS_MAX_WIDTH / width));
        width = COMPRESS_MAX_WIDTH;
      }
      if (height > COMPRESS_MAX_HEIGHT) {
        width = Math.round(width * (COMPRESS_MAX_HEIGHT / height));
        height = COMPRESS_MAX_HEIGHT;
      }

      // Draw to canvas with high-quality smoothing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // fallback
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first (smaller), fall back to JPEG
      const useWebP = supportsWebP();
      const format = useWebP ? 'image/webp' : 'image/jpeg';
      const quality = useWebP ? WEBP_QUALITY : JPEG_QUALITY;
      const ext = useWebP ? 'webp' : 'jpg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // fallback
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${baseName}.${ext}`, {
            type: format,
            lastModified: Date.now(),
          });

          const savingsPercent = Math.round((1 - compressedFile.size / file.size) * 100);
          console.log(
            `Compressed "${file.name}": ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB (${savingsPercent}% smaller, ${ext.toUpperCase()})`
          );

          resolve(compressedFile);
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback on error
    };

    img.src = url;
  });
}

// ─── Upload Functions ───────────────────────────────────────

/**
 * Upload a single PG image to Firebase Storage.
 * Automatically compresses the image before uploading.
 * @param file - Image file to upload (max 5MB before compression)
 * @param listingId - The PG listing ID (used as folder name)
 * @returns Download URL of the uploaded image
 */
export async function uploadPGImage(file: File, listingId: string): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not configured');
  }

  // Validate original file
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be less than 5MB');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed');
  }

  // Compress image before uploading (converts to WebP or JPEG)
  const compressed = await compressImage(file);

  // Ensure authenticated (anonymous auth if needed)
  await ensureAuth();

  // Create unique filename with correct extension
  const timestamp = Date.now();
  const safeName = compressed.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storageRef = ref(storage, `pg-images/${listingId}/${timestamp}-${safeName}`);

  // Upload compressed file
  await uploadBytes(storageRef, compressed);
  return getDownloadURL(storageRef);
}

/**
 * Upload multiple PG images in parallel.
 * All images are automatically compressed before uploading.
 * @param files - Array of image files
 * @param listingId - The PG listing ID
 * @param onProgress - Optional callback for upload progress (index of completed upload)
 * @returns Array of download URLs
 */
export async function uploadMultiplePGImages(
  files: File[],
  listingId: string,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  let completed = 0;
  const total = files.length;

  const urls = await Promise.all(
    files.map(async (file) => {
      const url = await uploadPGImage(file, listingId);
      completed++;
      onProgress?.(completed, total);
      return url;
    })
  );

  return urls;
}
