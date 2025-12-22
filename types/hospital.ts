// Hospital and Location related types

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
