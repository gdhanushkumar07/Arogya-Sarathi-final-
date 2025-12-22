import { DemoPharmacy } from "../types";

// Demo pharmacy data for medicine ordering feature
export const demoPharmacies: DemoPharmacy[] = [
  {
    id: "PHARM_001",
    name: "MediCare Pharmacy",
    address: "Main Market, Near Bus Stand",
    phone: "9876543210",
    deliveryTime: "30-45 minutes",
    rating: 4.2,
  },
  {
    id: "PHARM_002",
    name: "Health Plus Medical Store",
    address: "Central Plaza, MG Road",
    phone: "8765432109",
    deliveryTime: "45-60 minutes",
    rating: 4.5,
  },
  {
    id: "PHARM_003",
    name: "LifeCare Pharmacy",
    address: "Hospital Complex, Civil Lines",
    phone: "7654321098",
    deliveryTime: "20-35 minutes",
    rating: 4.8,
  },
];

// Get pharmacies by district (demo matching based on state)
export function getPharmaciesByLocation(
  district: string,
  state: string
): DemoPharmacy[] {
  // For demo purposes, return all pharmacies regardless of location
  // In real implementation, this would filter based on delivery area
  return demoPharmacies;
}

// Get a single pharmacy by ID
export function getPharmacyById(pharmacyId: string): DemoPharmacy | undefined {
  return demoPharmacies.find((pharmacy) => pharmacy.id === pharmacyId);
}
