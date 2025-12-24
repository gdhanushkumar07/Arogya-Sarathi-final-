/**
 * Clean Image Conversion Utility (fixed)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
};

export const extractBase64 = (dataUrl: string): string => {
  const parts = dataUrl.split(',');
  return parts[1] || dataUrl;
};

export const getBase64SizeInMB = (base64String: string): number => {
  const sizeInBytes = base64String.length * 0.75;
  return sizeInBytes / (1024 * 1024);
};

export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
};

export const createImageThumbnail = (
  base64DataUrl: string,
  maxWidth: number = 640,
  maxHeight: number = 480,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No canvas context'));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (e) => reject(e);
    img.src = base64DataUrl;
  });
};

export const downloadBase64Image = (base64String: string, filename: string) => {
  const dataUrl = base64String.startsWith('data:') ? base64String : `data:image/jpeg;base64,${base64String}`;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const getImageUrl = (base64String: string) => (base64String.startsWith('data:') ? base64String : `data:image/jpeg;base64,${base64String}`);

export const getAvailableStorageSpace = () => {
  try {
    const key = '__ls_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    const totalMB = 10;
    const used = JSON.stringify(localStorage).length / (1024 * 1024);
    const remaining = Math.max(0, totalMB - used);
    return { usedMB: Number(used.toFixed(2)), remainingMB: Number(remaining.toFixed(2)), percentUsed: Number(((used / totalMB) * 100).toFixed(1)) };
  } catch {
    return { usedMB: 0, remainingMB: 0, percentUsed: 0 };
  }
};

export default {
  fileToBase64,
  blobToBase64,
  extractBase64,
  getBase64SizeInMB,
  validateFileSize,
  createImageThumbnail,
  downloadBase64Image,
  getImageUrl,
  getAvailableStorageSpace,
};
