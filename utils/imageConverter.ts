/**
 * Image Conversion Utility
 *
 * Converts File/Blob objects to Base64 strings for localStorage
 * This file provides helpers used by PatientImageUpload and DoctorDashboard.
 */

/** Convert File object to Base64 data URL */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Create image thumbnail (shrink large images)
 * Useful to save localStorage space
 */
export const createImageThumbnail = (
  base64DataUrl: string,
  maxWidth: number = 640,
  maxHeight: number = 480
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions maintaining aspect ratio
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

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
      resolve(thumbnail);
    };

    img.onerror = (error) => {
      console.error("Failed to create thumbnail:", error);
      reject(error);
    };

    img.src = base64DataUrl;
  });
};

/**
 * Download Base64 image (for debugging/export)
 */
export const downloadBase64Image = (
  base64String: string,
  filename: string
): void => {
  const dataUrl = base64String.startsWith("data:")
    ? base64String
    : `data:image/jpeg;base64,${base64String}`;

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`Downloaded: ${filename}`);
};

/**
 * Display Base64 image in <img> tag
 */
export const getImageUrl = (base64String: string): string => {
  if (base64String.startsWith("data:")) {
    return base64String;
  }
  return `data:image/jpeg;base64,${base64String}`;
};

/**
 * Check available localStorage space
 */
export const getAvailableStorageSpace = (): {
  usedMB: number;
  remainingMB: number;
  percentUsed: number;
} => {
  let test = "_localStorage_test_";
  try {
    localStorage.setItem(test, "test");
    localStorage.removeItem(test);

    // Rough estimate: typical localStorage is 5-10MB
    const totalMB = 10; // Conservative estimate
    const used = JSON.stringify(localStorage).length / (1024 * 1024);
    const remaining = totalMB - used;

    return {
      usedMB: Number(used.toFixed(2)),
      remainingMB: Number(remaining.toFixed(2)),
      percentUsed: Number(((used / totalMB) * 100).toFixed(1)),
    };
  } catch (e) {
    console.error("localStorage quota check failed:", e);
    return { usedMB: 0, remainingMB: 0, percentUsed: 0 };
  }
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};
