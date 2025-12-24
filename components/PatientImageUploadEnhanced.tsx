import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Loader2, AlertCircle, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import {
  createMedicalCase,
  getCasesByPatient,
  MedicalCase,
} from '../services/medicalCasesService';
import {
  fileToBase64,
  validateFileSize,
  createImageThumbnail,
  getAvailableStorageSpace,
  getImageUrl,
} from '../utils/imageConverterFixed';

interface PatientImageUploadEnhancedProps {
  patientId: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  patientDistrict: string;
  patientState: string;
  onCaseCreated?: (medicalCase: MedicalCase) => void;
}

/**
 * ENHANCED PATIENT IMAGE UPLOAD COMPONENT
 * 
 * ✅ NEW FEATURES:
 * - Auto-refresh every 5 seconds (sees doctor replies)
 * - Storage event listener (cross-tab updates)
 * - New reply notifications
 * - Reply count badges
 * - Expandable reply view
 * - Real-time 2-way communication
 * 
 * ROOT CAUSE FIX:
 * The patient couldn't see doctor replies because:
 * - ❌ OLD: No auto-refresh mechanism
 * - ✅ NEW: Polling + storage events = instant updates
 */
export const PatientImageUploadEnhanced: React.FC<PatientImageUploadEnhancedProps> = ({
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
  const [myCases, setMyCases] = useState<MedicalCase[]>(() =>
    getCasesByPatient(patientId)
  );
  const [notification, setNotification] = useState<string | null>(null);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [previousReplyCounts, setPreviousReplyCounts] = useState<Record<string, number>>({});

  // ==========================================
  // 🔄 REAL-TIME UPDATES - THE FIX!
  // ==========================================
  
  useEffect(() => {
    console.log('🚀 Patient component mounted - Starting real-time updates');
    
    // METHOD 1: Polling (Same-tab updates)
    // Refreshes data every 5 seconds to check for doctor replies
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing patient cases...');
      const updatedCases = getCasesByPatient(patientId);
      setMyCases(updatedCases);
      
      // Check for new replies
      checkForNewReplies(updatedCases);
    }, 5000); // 5 seconds

    // METHOD 2: Storage Events (Cross-tab updates)
    // Fires when localStorage changes in ANOTHER tab/window
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'medicalCases' && e.newValue) {
        console.log('📡 Storage event detected - localStorage was updated in another tab!');
        const updatedCases = getCasesByPatient(patientId);
        setMyCases(updatedCases);
        checkForNewReplies(updatedCases);
        
        // Show notification
        setNotification('🔔 New update received!');
        setTimeout(() => setNotification(null), 5000);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
      console.log('🛑 Patient component unmounted - Stopped real-time updates');
    };
  }, [patientId]);

  // ==========================================
  // 🔔 CHECK FOR NEW REPLIES
  // ==========================================
  const checkForNewReplies = (cases: MedicalCase[]) => {
    cases.forEach((medicalCase) => {
      const currentReplyCount = medicalCase.replies.length;
      const previousCount = previousReplyCounts[medicalCase.caseId] || 0;

      if (currentReplyCount > previousCount) {
        // New reply detected!
        const newRepliesCount = currentReplyCount - previousCount;
        console.log(`🔔 NEW REPLY! Case ${medicalCase.caseId}: ${newRepliesCount} new reply(ies)`);
        
        setNotification(
          `🔔 Doctor replied to your case! (${newRepliesCount} new ${newRepliesCount === 1 ? 'reply' : 'replies'})`
        );
        
        // Auto-dismiss notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }

      // Update previous count
      setPreviousReplyCounts((prev) => ({
        ...prev,
        [medicalCase.caseId]: currentReplyCount,
      }));
    });
  };

  // ==========================================
  // 📤 UPLOAD IMAGE (Same as before)
  // ==========================================
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      // Validate file size
      if (!validateFileSize(file, 5)) {
        throw new Error('File too large (max 5MB)');
      }

      // Convert File to Base64
      console.log('🔄 Converting image to Base64...');
      const base64 = await fileToBase64(file);

      // Create thumbnail to save localStorage space
      console.log('🎨 Creating thumbnail...');
      const thumbnail = await createImageThumbnail(base64, 640, 480);

      // Create medical case with Base64 image
      console.log('💾 Saving to localStorage...');
      const medicalCase = createMedicalCase(
        patientId,
        patientName,
        patientAge,
        patientPhone,
        patientDistrict,
        patientState,
        thumbnail,
        file.name
      );

      // Update local state
      const updatedCases = getCasesByPatient(patientId);
      setMyCases(updatedCases);

      // Initialize reply count for this case
      setPreviousReplyCounts((prev) => ({
        ...prev,
        [medicalCase.caseId]: 0,
      }));

      // Callback to parent
      onCaseCreated?.(medicalCase);

      setSuccess(
        `✅ Image uploaded! Case ID: ${medicalCase.caseId.substring(0, 20)}...`
      );
      console.log('✅ Medical case created:', medicalCase);

      // Check storage usage
      const space = getAvailableStorageSpace();
      console.log(
        `📊 Storage: ${space.usedMB}MB used, ${space.remainingMB}MB remaining`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`❌ Upload failed: ${errorMessage}`);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ==========================================
  // 🎨 RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* NOTIFICATION BANNER */}
      {notification && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-[32px] p-6 shadow-lg flex items-start gap-4 animate-pulse border-2 border-emerald-300">
          <Bell className="flex-shrink-0 mt-0.5" size={24} />
          <div>
            <p className="font-black text-lg">{notification}</p>
            <p className="text-sm font-medium opacity-90 mt-1">
              Scroll down to view doctor's reply
            </p>
          </div>
        </div>
      )}

      {/* UPLOAD CARD */}
      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              📸 Upload Medical Image
            </h3>
            <p className="text-sm font-medium text-slate-600">
              Patient can upload images. Doctor will see them and reply in real-time.
            </p>
            <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Real-time updates active
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

          {/* Upload Button */}
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-4 px-6 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Converting to Base64...</span>
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
            <p>🔄 Auto-refreshes every 5 seconds for doctor replies</p>
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
                          Case ID
                        </p>
                        <p className="text-xs font-mono text-slate-600 mt-1">
                          {medicalCase.caseId.substring(0, 30)}...
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          medicalCase.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : medicalCase.status === 'REVIEWED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {medicalCase.status}
                      </span>
                    </div>

                    {/* Images Preview */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-2">
                        📸 {medicalCase.images.length} image
                        {medicalCase.images.length !== 1 ? 's' : ''}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {medicalCase.images.slice(0, 4).map((image) => (
                          <div
                            key={image.imageId}
                            className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200"
                          >
                            <img
                              src={getImageUrl(image.base64Data)}
                              alt={image.filename}
                              className="w-full h-24 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="text-xs font-medium text-slate-500 space-y-1">
                      <p>
                        📅 Created:{' '}
                        {new Date(medicalCase.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* REPLIES SECTION - THE KEY FEATURE! */}
                    {medicalCase.replies.length > 0 && (
                      <div className="space-y-3">
                        <button
                          onClick={() =>
                            setExpandedCase(
                              expandedCase === medicalCase.caseId
                                ? null
                                : medicalCase.caseId
                            )
                          }
                          className="w-full bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-4 border-2 border-emerald-200 hover:border-emerald-300 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                              {medicalCase.replies.length}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-black text-emerald-900">
                                Doctor Replied!
                              </p>
                              <p className="text-xs font-medium text-emerald-600">
                                {medicalCase.replies.length} {medicalCase.replies.length === 1 ? 'reply' : 'replies'}
                              </p>
                            </div>
                          </div>
                          {expandedCase === medicalCase.caseId ? (
                            <ChevronUp className="text-emerald-600 group-hover:text-emerald-700" />
                          ) : (
                            <ChevronDown className="text-emerald-600 group-hover:text-emerald-700" />
                          )}
                        </button>

                        {/* Expanded Replies */}
                        {expandedCase === medicalCase.caseId && (
                          <div className="space-y-3 pl-4 border-l-4 border-emerald-200">
                            {medicalCase.replies
                              .slice()
                              .reverse()
                              .map((reply) => (
                                <div
                                  key={reply.replyId}
                                  className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm"
                                >
                                  {/* Doctor Info */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <p className="font-bold text-slate-900 text-sm">
                                        👨‍⚕️ {reply.doctorName}
                                      </p>
                                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                        {reply.specialization}
                                      </p>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                      {reply.type}
                                    </span>
                                  </div>

                                  {/* Reply Content */}
                                  <p className="text-sm font-medium text-slate-700 mb-3 leading-relaxed">
                                    {reply.content}
                                  </p>

                                  {/* Medication (if present) */}
                                  {reply.medication && (
                                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 mb-3">
                                      <p className="text-xs font-bold text-slate-500 mb-1">
                                        💊 Prescribed Medication:
                                      </p>
                                      <p className="text-sm font-bold text-slate-800">
                                        {reply.medication}
                                      </p>
                                    </div>
                                  )}

                                  {/* Timestamp */}
                                  <p className="text-xs font-bold text-slate-400">
                                    ⏰{' '}
                                    {new Date(reply.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pending Status */}
                    {medicalCase.replies.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                        <Loader2
                          className="text-yellow-600 animate-spin flex-shrink-0"
                          size={18}
                        />
                        <div>
                          <p className="text-sm font-bold text-yellow-800">
                            Waiting for doctor's reply...
                          </p>
                          <p className="text-xs font-medium text-yellow-600 mt-1">
                            Auto-checking every 5 seconds
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientImageUploadEnhanced;

/**
 * ✅ KEY FEATURES THAT FIX 2-WAY COMMUNICATION:
 * =============================================
 * 
 * 1. AUTO-REFRESH (Polling):
 *    - Checks for updates every 5 seconds
 *    - Works in same tab
 *    - Detects new doctor replies
 * 
 * 2. STORAGE EVENTS:
 *    - Listens for localStorage changes
 *    - Works across different tabs
 *    - Instant notifications
 * 
 * 3. NEW REPLY DETECTION:
 *    - Tracks previous reply counts
 *    - Shows notification banner
 *    - Auto-dismisses after 5 seconds
 * 
 * 4. EXPANDABLE REPLIES:
 *    - Click to view full reply details
 *    - Shows doctor name, specialization
 *    - Displays medication if prescribed
 * 
 * 5. REAL-TIME STATUS:
 *    - Shows "Real-time updates active"
 *    - Animated pulse indicator
 *    - Clear status badges
 * 
 * USAGE:
 * ======
 * Replace PatientImageUpload with PatientImageUploadEnhanced
 * 
 * <PatientImageUploadEnhanced
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
 */
