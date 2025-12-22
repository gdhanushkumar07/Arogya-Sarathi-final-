import { Coordinates, PatientLocation } from "../types";

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate estimated travel time based on distance
export function calculateTravelTime(distance: number): number {
  // Assuming average speed of 40 km/h for rural roads
  const averageSpeed = 40; // km/h
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = timeInHours * 60;

  return Math.round(timeInMinutes);
}

// Convert address to coordinates (mock implementation)
// In production, this would use a geocoding service like Google Maps Geocoding API
export async function geocodeAddress(
  address: string
): Promise<Coordinates | null> {
  // Mock implementation - in production, use actual geocoding service
  const mockCoordinates: { [key: string]: Coordinates } = {
    Hyderabad: { latitude: 17.385, longitude: 78.4867 },
    Warangal: { latitude: 18.0, longitude: 79.6667 },
    Nizamabad: { latitude: 18.6725, longitude: 78.0941 },
    Karimnagar: { latitude: 18.4383, longitude: 79.1288 },
    Mahbubnagar: { latitude: 16.7397, longitude: 77.9992 },
    Medak: { latitude: 18.0488, longitude: 78.2625 },
    Nalgonda: { latitude: 17.054, longitude: 79.2675 },
    Adilabad: { latitude: 19.6669, longitude: 78.5311 },
    Khammam: { latitude: 17.2473, longitude: 80.1514 },
    Rangareddy: { latitude: 17.3928, longitude: 78.3909 },
    Mumbai: { latitude: 19.076, longitude: 72.8777 },
    Pune: { latitude: 18.5204, longitude: 73.8567 },
    Nagpur: { latitude: 21.1458, longitude: 79.0882 },
    Nashik: { latitude: 19.9975, longitude: 73.7898 },
    Aurangabad: { latitude: 19.8762, longitude: 75.3433 },
    Solapur: { latitude: 17.6599, longitude: 75.9064 },
    Kolhapur: { latitude: 16.705, longitude: 74.2433 },
    Thane: { latitude: 19.2183, longitude: 72.9781 },
    Bangalore: { latitude: 12.9716, longitude: 77.5946 },
    Mysore: { latitude: 12.2958, longitude: 76.6394 },
    Hubli: { latitude: 15.3647, longitude: 75.124 },
    Belgaum: { latitude: 15.8497, longitude: 74.4977 },
    Gulbarga: { latitude: 17.3297, longitude: 76.8343 },
    Mangalore: { latitude: 12.9141, longitude: 74.856 },
    Davanagere: { latitude: 14.4644, longitude: 75.9217 },
    Bellary: { latitude: 15.1394, longitude: 76.9214 },
    Bijapur: { latitude: 16.8302, longitude: 75.71 },
    Shimoga: { latitude: 13.9299, longitude: 75.5681 },
    Tumkur: { latitude: 13.3379, longitude: 77.1022 },
    Raichur: { latitude: 16.2077, longitude: 77.3463 },
  };

  // Try to find coordinates for the address
  for (const [city, coords] of Object.entries(mockCoordinates)) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }

  // Return default coordinates if not found
  return { latitude: 17.385, longitude: 78.4867 }; // Default to Hyderabad
}

// Format coordinates for display
export function formatCoordinates(coordinates: Coordinates): string {
  const lat = Math.abs(coordinates.latitude).toFixed(4);
  const lon = Math.abs(coordinates.longitude).toFixed(4);
  const latDir = coordinates.latitude >= 0 ? "N" : "S";
  const lonDir = coordinates.longitude >= 0 ? "E" : "W";

  return `${lat}°${latDir}, ${lon}°${lonDir}`;
}

// Check if coordinates are valid
export function isValidCoordinates(coordinates: Coordinates): boolean {
  return (
    typeof coordinates.latitude === "number" &&
    typeof coordinates.longitude === "number" &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}
