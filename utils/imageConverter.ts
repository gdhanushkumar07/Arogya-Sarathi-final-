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
      const canvas = document.createElement('canvas');
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

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);
    };

    img.onerror = (error) => {
      console.error('❌ Failed to create thumbnail:', error);
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
  const dataUrl = base64String.startsWith('data:')
    ? base64String
    : `data:image/jpeg;base64,${base64String}`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`✅ Downloaded: ${filename}`);
};

/**
 * Display Base64 image in <img> tag
 */
export const getImageUrl = (base64String: string): string => {
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  return `data:image/jpeg;base64,${base64String}`;
};

/**
 * IMPORTANT: localStorage Size Calculation
 * ========================================
 * Base64 encoding increases size by ~33%
 */

/**
 * Check available localStorage space
 */
export const getAvailableStorageSpace = (): {
  usedMB: number;
  remainingMB: number;
  percentUsed: number;
} => {
  let test = '_localStorage_test_';
  try {
    localStorage.setItem(test, 'test');
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
    console.error('⚠️  localStorage quota check failed:', e);
    return { usedMB: 0, remainingMB: 0, percentUsed: 0 };
  }
};
      canvas.width = width;
    img.onload = () => {ight;
      const canvas = document.createElement('canvas');
      let width = img.width;Context('2d');
      let height = img.height;
        reject(new Error('Failed to get canvas context'));
      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;vas.toDataURL('image/jpeg', 0.8);
        }olve(thumbnail);
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight; to create thumbnail:', error);
        }ect(error);
      }

      canvas.width = width;;
      canvas.height = height;
};
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }const downloadBase64Image = (
  base64String: string,
      ctx.drawImage(img, 0, 0, width, height);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);RL
    };t dataUrl = base64String.startsWith('data:')
    ? base64String
    img.onerror = (error) => {${base64String}`;
      console.error('❌ Failed to create thumbnail:', error);
      reject(error);ent.createElement('a');
    };.href = dataUrl;
  link.download = filename;
    img.src = base64DataUrl;link);
  });k.click();
};document.body.removeChild(link);

/**onsole.log(`✅ Downloaded: ${filename}`);
 * Download Base64 image (for debugging/export)
 */
export const downloadBase64Image = (
  base64String: string, in <img> tag
  filename: string
): void => { getImageUrl = (base64String: string): string => {
  // Ensure it's a data URLth('data:')) {
  const dataUrl = base64String.startsWith('data:')
    ? base64String
    : `data:image/jpeg;base64,${base64String}`;}`;
};
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;Size Calculation
  document.body.appendChild(link);=========
  link.click();ing increases size by ~33%
  document.body.removeChild(link);
 * Original size: 1MB
  console.log(`✅ Downloaded: ${filename}`);
}; As JSON: ~1.5MB (with quotes, keys, etc)
 * 
/**localStorage limit: ~5-10MB
 * Display Base64 image in <img> tagimages (1MB each)
 */⚠️  Risky: More than 5 large images
export const getImageUrl = (base64String: string): string => {
  if (base64String.startsWith('data:')) {
    return base64String;
  }=========
  return `data:image/jpeg;base64,${base64String}`;
}; 2. Limit uploads: Check size with validateFileSize()
 * 3. Delete old: Remove cases after doctor replies
/**4. Use backend: For production, send to server after initial save
 * IMPORTANT: localStorage Size Calculation
 * ========================================
 * Base64 encoding increases size by ~33%
 * Check available localStorage space
 * Original size: 1MB
 * As Base64: ~1.33MBableStorageSpace = (): {
 * As JSON: ~1.5MB (with quotes, keys, etc)
 * emainingMB: number;
 * localStorage limit: ~5-10MB
 * ✅ Safe: Up to 3-4 medium-quality images (1MB each)
 * ⚠️  Risky: More than 5 large images
 * ❌ Will fail: Trying to store 100MB of images
 *  localStorage.setItem(test, 'test');
 * SOLUTION:rage.removeItem(test);
 * =========
 * 1. Compress images: Use createImageThumbnail()10MB
 * 2. Limit uploads: Check size with validateFileSize()
 * 3. Delete old: Remove cases after doctor repliesh / (1024 * 1024);
 * 4. Use backend: For production, send to server after initial save
 */
    return {
/**   usedMB: Number(used.toFixed(2)),
 * Check available localStorage spaceoFixed(2)),
 */   percentUsed: Number(((used / totalMB) * 100).toFixed(1)),
export const getAvailableStorageSpace = (): {
  usedMB: number;
  remainingMB: number; localStorage quota check failed:', e);
  percentUsed: number;, remainingMB: 0, percentUsed: 0 };
} => {
  let test = '_localStorage_test_';
  try {
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test); from input and save:
 * =====================================================
    // Rough estimate: typical localStorage is 5-10MB
    const totalMB = 10; // Conservative estimateChangeEvent<HTMLInputElement>) => {
    const used = JSON.stringify(localStorage).length / (1024 * 1024);
    const remaining = totalMB - used;
 *
    return {ep 1: Validate file size
      usedMB: Number(used.toFixed(2)),
      remainingMB: Number(remaining.toFixed(2)),
      percentUsed: Number(((used / totalMB) * 100).toFixed(1)),
    };
  } catch (e) {
    console.error('⚠️  localStorage quota check failed:', e);
    return { usedMB: 0, remainingMB: 0, percentUsed: 0 };
  }  
};   // ✅ Step 3: Create thumbnail to save space
 *   const thumbnail = await createImageThumbnail(base64);
/**
 * COMPLETE EXAMPLE - Convert file from input and save:
 * =====================================================
 *     patientId,
 * const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = event.target.files?.[0];
 *   if (!file) return;
 *     patientDistrict,
 *   // ✅ Step 1: Validate file size
 *   if (!validateFileSize(file, 5)) {tead of full image
 *     alert('File too large. Max 5MB');
 *     return;
 *   }
 *   console.log('✅ Case created:', medicalCase.caseId);
 *   // ✅ Step 2: Convert File to Base64
 *   const base64 = await fileToBase64(file);
 *   
 *   // ✅ Step 3: Create thumbnail to save space
 *   const thumbnail = await createImageThumbnail(base64);
 * ================
 *   // ✅ Step 4: Create medical case with Base64 image
 *   const medicalCase = createMedicalCase(aExceededError"
 *     patientId,tored data (all keys) exceeded 5-10MB
 *     patientName,te old cases, compress images, use thumbnails
 *     patientAge,
 *     patientPhone,broken in <img>
 *     patientDistrict,orrupted or not a data URL
 *     patientState,etImageUrl() to ensure proper format
 *     thumbnail, // Use thumbnail instead of full image
 *     file.namet see patient's images
 *   );ages stored in patient-specific keys instead of medicalCases
 *   Solution: Use medicalCasesService, not custom localStorage keys
 *   console.log('✅ Case created:', medicalCase.caseId);
 * };Images not showing after refresh
 */→ Images were stored as File objects (not serializable)
 * → Solution: Always use Base64 strings, not raw File objects
/**
 * TROUBLESHOOTING: * ================ *  * ❌ "localStorage quota exceeded" or "QuotaExceededError" * → Your total stored data (all keys) exceeded 5-10MB * → Solution: Delete old cases, compress images, use thumbnails *  * ❌ Image shows as broken in <img> * → Base64 string is corrupted or not a data URL * → Solution: Use getImageUrl() to ensure proper format *  * ❌ Doctor can't see patient's images * → Images stored in patient-specific keys instead of medicalCases * → Solution: Use medicalCasesService, not custom localStorage keys *  * ❌ Images not showing after refresh * → Images were stored as File objects (not serializable) * → Solution: Always use Base64 strings, not raw File objects */
useEffect(() => {
  const raw = localStorage.getItem('medicalCases');
  const cases = raw ? JSON.parse(raw) : [];
  setMedicalCases(cases);
}, []);

return medicalCases.map((c) => (
  <div key={c.caseId}>
    <h4>{c.patientName} • {new Date(c.timestamp).toLocaleString()}</h4>
    <img src={getImageUrl(c.imageBase64)} alt={c.imageFilename || 'case'} style={{maxWidth:360}} />
    <div>{c.doctorReply?.text}</div>
  </div>
));
const handleFile = async (file: File) => {
  if (!validateFileSize(file, 5)) return alert('File too large (max 5MB)');
  const dataUrl = await fileToBase64(file); // utils: fileToBase64
  const thumbnail = await createImageThumbnail(dataUrl, 800, 600);
  const caseObj = {
    caseId: `CASE-${Date.now()}`,
    patientId,
    patientName,
    imageBase64: thumbnail,
    imageFilename: file.name,
    doctorReply: null,
    timestamp: Date.now(),
  };
  const raw = localStorage.getItem('medicalCases');
  const list = raw ? JSON.parse(raw) : [];
  list.push(caseObj);
  localStorage.setItem('medicalCases', JSON.stringify(list));
  // notify other tabs (optional)
  window.dispatchEvent(new StorageEvent('storage', { key: 'medicalCases' }));
};

useEffect(() => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'medicalCases') {
      const updated = localStorage.getItem('medicalCases') || '[]';
      setCases(JSON.parse(updated));
    }
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}, []);
const saveReply = (caseId: string, text: string) => {
  const raw = localStorage.getItem('medicalCases');
  const list = raw ? JSON.parse(raw) : [];
  const idx = list.findIndex((x: any) => x.caseId === caseId);
  if (idx < 0) return;
  list[idx].doctorReply = { text, doctorName: doctorProfile?.name || 'Dr', timestamp: Date.now() };
  localStorage.setItem('medicalCases', JSON.stringify(list));
  // update local state and notify other tabs
  setMedicalCases(list);
  window.dispatchEvent(new StorageEvent('storage', { key: 'medicalCases' }));
};
