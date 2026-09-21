/**
 * Helper to compress and resize images before storage or transmission.
 * Reduces 5MB-15MB phone photos down to ~100KB-180KB, preventing QuotaExceeded errors
 * and ensuring instantaneous rendering in all browsers and iframes.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    let sourceDataUrl = '';

    const processImage = (src: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale proportionally to max dimensions
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with balanced quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression error, using raw image:', err);
          resolve(src);
        }
      };

      img.onerror = (err) => {
        console.error('Image load failed during compression:', err);
        // If it's already a valid string, return it, else reject
        if (src.startsWith('data:') || src.startsWith('http')) {
          resolve(src);
        } else {
          reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
        }
      };

      img.src = src;
    };

    if (typeof fileOrDataUrl === 'string') {
      sourceDataUrl = fileOrDataUrl;
      processImage(sourceDataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          processImage(result);
        } else {
          reject(new Error('ไม่สามารถอ่านข้อมูลไฟล์ได้'));
        }
      };
      reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
