import React, { useRef, useState, useEffect } from "react";
import { Camera, Upload, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  createMedicalCase,
  getCasesByPatient,
  MedicalCase,
} from "../services/medicalCasesService";
import {
  fileToBase64,
  validateFileSize,
  createImageThumbnail,
  getAvailableStorageSpace,
} from "../utils/imageConverterFixed";

interface PatientImageUploadProps {
  patientId: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  patientDistrict: string;
  patientState: string;
  onCaseCreated?: (medicalCase: MedicalCase) => void;
}

/**
 * PATIENT IMAGE UPLOAD COMPONENT
 *
 * This component handles the patient uploading medical images
 * It properly converts File → Base64 → localStorage
 *
 * Root cause fix:
 * - ❌ OLD: Store File objects directly (not JSON-serializable)
 * - ✅ NEW: Convert to Base64 string, save to medicalCases key
 */
export const PatientImageUpload: React.FC<PatientImageUploadProps> = ({
  patientId,
  patientName,
  patientAge,
  patientPhone,
  patientDistrict,
  patientState,
  onCaseCreated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [myCases, setMyCases] = useState<MedicalCase[]>(() =>
    getCasesByPatient(patientId)
  );

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 🔄 Auto-refresh cases every 3 seconds to see doctor replies
  useEffect(() => {
    const refreshCases = () => {
      const updatedCases = getCasesByPatient(patientId);
      setMyCases(updatedCases);
      console.log(
        "🔄 Patient cases refreshed, found",
        updatedCases.length,
        "cases"
      );
    };

    refreshCases(); // Initial load
    const interval = setInterval(refreshCases, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [patientId]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check network status before allowing upload
    if (!isOnline) {
      setError(
        "❌ No internet connection. Please check your network and try again."
      );
      return;
    }

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      // ✅ Step 1: Validate file size
      if (!validateFileSize(file, 5)) {
        throw new Error("File too large (max 5MB)");
      }

      // ✅ Step 2: Convert File to Base64
      console.log("🔄 Converting image to Base64...");
      const base64 = await fileToBase64(file);

      // ✅ Step 3: Create thumbnail to save localStorage space
      console.log("🎨 Creating thumbnail...");
      const thumbnail = await createImageThumbnail(base64, 640, 480);

      // ✅ Step 4: Create medical case with Base64 image
      console.log("💾 Saving to localStorage...");
      const medicalCase = createMedicalCase(
        patientId,
        patientName,
        patientAge,
        patientPhone,
        patientDistrict,
        patientState,
        thumbnail, // Use thumbnail (Base64 string, not File!)
        file.name
      );

      // Update local state
      const updatedCases = getCasesByPatient(patientId);
      setMyCases(updatedCases);

      // Callback to parent
      onCaseCreated?.(medicalCase);

      setSuccess(
        `✅ Image uploaded! Case ID: ${medicalCase.caseId.substring(0, 20)}...`
      );
      console.log("✅ Medical case created:", medicalCase);

      // Check storage usage
      const space = getAvailableStorageSpace();
      console.log(
        `📊 Storage: ${space.usedMB}MB used, ${space.remainingMB}MB remaining`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`❌ Upload failed: ${errorMessage}`);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* UPLOAD CARD */}
      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              📸 Upload Medical Image
            </h3>
            <p className="text-sm font-medium text-slate-600">
              Patient can upload images. Doctor will see them and reply.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-sm font-medium text-emerald-700">{success}</p>
            </div>
          )}

          {/* Network Status Indicator */}
          <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isOnline ? "bg-emerald-500" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`text-sm font-bold ${
                  isOnline ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {isOnline
                  ? "✅ Online - Image upload available"
                  : "❌ Offline - Image upload disabled"}
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-white px-3 py-1 rounded-full border border-slate-200 transition-colors"
            >
              Refresh Status
            </button>
          </div>

          {/* Upload Button */}
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !isOnline}
              className={`flex-1 font-black py-4 px-6 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:cursor-not-allowed ${
                isOnline
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Converting to Base64...</span>
                </>
              ) : !isOnline ? (
                <>
                  <AlertCircle size={20} />
                  <span>Offline - Upload Disabled</span>
                </>
              ) : (
                <>
                  <Camera size={20} />
                  <span>Choose Image</span>
                </>
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />

          <div className="text-xs font-medium text-slate-500 space-y-1">
            <p>✅ Supported: JPEG, PNG, WebP</p>
            <p>📏 Max size: 5MB (will be compressed)</p>
            <p>💾 Saved to localStorage with case ID</p>
          </div>
        </div>
      </div>

      {/* MY CASES LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-lg font-black text-slate-900">My Cases</h3>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
            {myCases.length} cases
          </span>
        </div>

        {myCases.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 text-center">
            <Camera size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">
              No cases yet. Upload an image to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myCases
              .slice()
              .reverse()
              .map((medicalCase) => (
                <div
                  key={medicalCase.caseId}
                  className="bg-white rounded-[32px] p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div className="space-y-4">
                    {/* Case Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Case ID: {medicalCase.caseId}
                        </p>
                        <p className="text-sm font-bold text-slate-700 mt-1">
                          {medicalCase.images.length} image
                          {medicalCase.images.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          medicalCase.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : medicalCase.status === "REVIEWED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {medicalCase.status}
                      </span>
                    </div>

                    {/* Images Preview */}
                    <div className="grid grid-cols-2 gap-3">
                      {medicalCase.images.slice(0, 4).map((image) => (
                        <div
                          key={image.imageId}
                          className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200"
                        >
                          <img
                            src={image.base64Data}
                            alt={image.filename}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Timestamps & Doctor Replies */}
                    <div className="text-xs font-medium text-slate-500 space-y-2">
                      <p>
                        📅 Created:{" "}
                        {new Date(medicalCase.createdAt).toLocaleString()}
                      </p>
                      {medicalCase.replies.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                          <p className="text-emerald-600 font-bold">
                            ✅ Doctor replied ({medicalCase.replies.length})
                          </p>
                          {medicalCase.replies.map((reply) => (
                            <div
                              key={reply.replyId}
                              className="bg-emerald-50 rounded-xl p-3 border border-emerald-100"
                            >
                              <p className="text-xs font-bold text-emerald-700">
                                Dr. {reply.doctorName} ({reply.specialization})
                              </p>
                              <p className="text-xs font-medium text-emerald-600 mt-1">
                                {reply.type === "PRESCRIPTION"
                                  ? "💊 Prescription"
                                  : "📋 Note"}
                              </p>
                              <p className="text-xs text-emerald-800 mt-1">
                                {reply.content}
                              </p>
                              {reply.medication && (
                                <p className="text-xs font-bold text-emerald-700 mt-1">
                                  💉 {reply.medication}
                                </p>
                              )}
                              <p className="text-[10px] text-emerald-500 mt-1">
                                {new Date(reply.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientImageUpload;

/**
 * USAGE IN PATIENT COMPONENT:
 * ===========================
 *
 * <PatientImageUpload
 *   patientId={patientProfile.patientId}
 *   patientName={patientProfile.name}
 *   patientAge={patientProfile.age}
 *   patientPhone={patientProfile.phoneNumber}
 *   patientDistrict={patientProfile.district}
 *   patientState={patientProfile.state}
 *   onCaseCreated={(medicalCase) => {
 *     console.log('Case created:', medicalCase);
 *   }}
 * />
 *
 * WHY THIS WORKS:
 * ===============
 * 1. File input captures the File object
 * 2. fileToBase64() converts it to a data URL string
 * 3. createImageThumbnail() compresses it for localStorage
 * 4. createMedicalCase() saves to localStorage under 'medicalCases' key
 * 5. ✅ Doctor can access same 'medicalCases' key and see the image
 *
 * WHAT WAS WRONG BEFORE:
 * ======================
 * - Images stored in patient-specific keys (hv_vault_PAT-xxx)
 * - File objects stored directly (not JSON-serializable)
 * - Doctor looked in different keys (hv_vault_DOC-xxx)
 * - Each role had isolated storage
 */
