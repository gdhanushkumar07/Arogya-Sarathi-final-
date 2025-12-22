export enum ConnectivityState {
  OFFLINE = "OFFLINE",
  LOW_SIGNAL = "2G/EDGE",
  ONLINE = "4G/5G",
}

export type UserRole = "PATIENT" | "DOCTOR" | "PHARMACY";

export type SupportedLanguage =
  | "English"
  | "Hindi"
  | "Bengali"
  | "Swahili"
  | "Telugu"
  | "Marathi"
  | "Kannada"
  | "Tamil";

export interface MedicalRecord {
  id: string;
  type:
    | "SYMPTOM"
    | "PRESCRIPTION"
    | "HISTORY"
    | "VISUAL_TRIAGE"
    | "DOCTOR_NOTE"
    | "MEDICINE_REMINDER";
  content: string;
  translatedContent?: string;
  timestamp: number;
  tags?: string[];
  severity?: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "SYNCED" | "PROCESSED";
  icons?: ("SUN" | "MOON" | "FOOD")[];
  routedSpecialty?: string;
  media?: {
    type: "IMAGE" | "VIDEO_FRAMES";
    lowResData: string; // base64 preview
    highResUrl?: string; // Simulated link to full file
    analysis?: string; // Initial findings
  };
  // Doctor information for responses
  doctorInfo?: {
    name: string;
    specialization: string;
    clinicId: string;
  };
  // Threading for conversations
  threadId?: string;
  parentRecordId?: string;
}

export interface PharmacyOrder {
  id: string;
  patientName: string;
  medication: string;
  instruction: string;
  timestamp: number;
  status: "RECEIVED" | "ACCEPTED" | "READY" | "PICKED_UP";
  prescribedBy?: string;
}

export interface SyncPacket {
  packetId: string;
  patientId: string;
  patientName: string;
  payloadSize: string;
  summary: string;
  historyContext: string;
  visualTriage?: string;
  suggestedSpecialty: string;
  timestamp: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PatientLocation extends Coordinates {
  accuracy?: number;
  timestamp: number;
  address?: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: "GOVERNMENT" | "PRIVATE" | "COMMUNITY" | "SPECIALTY";
  coordinates: Coordinates;
  address: string;
  district: string;
  state: string;
  phone: string;
  emergencyPhone?: string;
  services: HospitalService[];
  facilities: string[];
  capacity?: number;
  rating?: number;
  distance?: number; // Calculated distance from user
  travelTime?: number; // Estimated travel time in minutes
  isOpen24x7: boolean;
  specialties: string[];
}

export type HospitalService =
  | "EMERGENCY"
  | "CARDIOLOGY"
  | "NEUROLOGY"
  | "PSYCHIATRY"
  | "NEUROSURGERY"
  | "ONCOLOGY"
  | "ORTHOPEDICS"
  | "PEDIATRICS"
  | "GYNECOLOGY"
  | "GENERAL_MEDICINE"
  | "SURGERY"
  | "DIAGNOSTICS"
  | "ICU"
  | "BLOOD_BANK";

export interface RouteInfo {
  distance: string;
  duration: string;
  steps: RouteStep[];
  polyline?: string; // For map rendering
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver?: string;
}

export interface EmergencyHospitalRequest {
  patientLocation: PatientLocation;
  radius: number; // in kilometers
  requiredServices?: HospitalService[];
  preferredHospitalType?: Hospital["type"];
  maxTravelTime?: number; // in minutes
}

export interface HospitalSearchResult {
  hospitals: Hospital[];
  totalCount: number;
  searchRadius: number;
  userLocation: Coordinates;
}

export interface PatientProfile {
  patientId: string; // Unique identifier for patient
  name: string;
  age: number;
  location: string;
  state: string;
  language: SupportedLanguage;
  coordinates?: Coordinates; // GPS coordinates if available
  // Enhanced location fields for better privacy and emergency services
  phoneNumber: string;
  houseNumber: string;
  streetVillage: string;
  district: string;
}

export interface DoctorProfile {
  name: string;
  specialization: string;
  clinicId: string;
}

export interface PharmacyProfile {
  name: string;
  license: string;
  district: string;
}

export interface PatientVault extends PatientProfile {
  records: MedicalRecord[];
}

export interface MedicineReminder {
  id: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  timeSchedule: string[]; // Array of time strings like ["08:00", "20:00"]
  startDate: number; // timestamp
  endDate?: number; // timestamp
  isActive: boolean;
  instructions?: string;
  prescribedBy: string;
  prescribedDate: number;
  reminderTimes: ReminderTime[];
}

export interface ReminderTime {
  time: string; // HH:MM format
  taken: boolean;
  takenAt?: number; // timestamp when taken
  skipped: boolean;
  skippedAt?: number; // timestamp when skipped
}

export interface DemoPharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  deliveryTime: string; // estimated delivery time
  rating: number;
}
