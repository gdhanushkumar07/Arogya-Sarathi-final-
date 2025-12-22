import {
  Hospital,
  Coordinates,
  PatientLocation,
  EmergencyHospitalRequest,
  HospitalSearchResult,
  HospitalService as HospitalServiceType,
  RouteInfo,
  RouteStep,
} from "../types";
import { calculateDistance, calculateTravelTime } from "../utils/geoUtils";
import { HOSPITAL_DATABASE } from "../data/hospitals";
import { locationService } from "./locationService";

export class HospitalManager {
  private static instance: HospitalManager;
  private cachedResults: Map<string, HospitalSearchResult> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): HospitalManager {
    if (!HospitalManager.instance) {
      HospitalManager.instance = new HospitalManager();
    }
    return HospitalManager.instance;
  }

  // Find nearby hospitals for emergency situations
  public async findNearbyHospitals(
    request: EmergencyHospitalRequest
  ): Promise<HospitalSearchResult> {
    const cacheKey = this.generateCacheKey(request);
    const cached = this.getCachedResult(cacheKey);

    if (cached) {
      console.log("Using cached hospital search results");
      return cached;
    }

    try {
      const {
        patientLocation,
        radius,
        requiredServices,
        preferredHospitalType,
        maxTravelTime,
      } = request;

      // Filter hospitals based on criteria
      let candidateHospitals = HOSPITAL_DATABASE.filter((hospital) => {
        // Check if hospital is within radius
        const distance = calculateDistance(
          patientLocation,
          hospital.coordinates
        );
        if (distance > radius) return false;

        // Check required services
        if (requiredServices && requiredServices.length > 0) {
          const hasRequiredServices = requiredServices.some((service) =>
            hospital.services.includes(service)
          );
          if (!hasRequiredServices) return false;
        }

        // Check preferred hospital type
        if (preferredHospitalType && hospital.type !== preferredHospitalType) {
          return false;
        }

        // Check max travel time if specified
        if (maxTravelTime) {
          const travelTime = calculateTravelTime(distance);
          if (travelTime > maxTravelTime) return false;
        }

        return true;
      });

      // Calculate distance and travel time for each hospital
      candidateHospitals = candidateHospitals.map((hospital) => {
        const distance = calculateDistance(
          patientLocation,
          hospital.coordinates
        );
        const travelTime = calculateTravelTime(distance);

        return {
          ...hospital,
          distance,
          travelTime,
        };
      });

      // Sort by distance (nearest first)
      candidateHospitals.sort((a, b) => {
        // Prioritize hospitals with emergency services
        const aHasEmergency = a.services.includes("EMERGENCY");
        const bHasEmergency = b.services.includes("EMERGENCY");

        if (aHasEmergency && !bHasEmergency) return -1;
        if (!aHasEmergency && bHasEmergency) return 1;

        // Then sort by distance
        return a.distance! - b.distance!;
      });

      const result: HospitalSearchResult = {
        hospitals: candidateHospitals,
        totalCount: candidateHospitals.length,
        searchRadius: radius,
        userLocation: patientLocation,
      };

      // Cache the result
      this.cacheResult(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Error finding nearby hospitals:", error);
      throw new Error("Failed to find nearby hospitals");
    }
  }

  // Get hospitals by state
  public getHospitalsByState(state: string): Hospital[] {
    return HOSPITAL_DATABASE.filter((hospital) => hospital.state === state);
  }

  // Get emergency hospitals in a state
  public getEmergencyHospitalsByState(state: string): Hospital[] {
    return HOSPITAL_DATABASE.filter(
      (hospital) =>
        hospital.state === state &&
        hospital.services.includes("EMERGENCY") &&
        hospital.isOpen24x7
    );
  }

  // Get hospital by ID
  public getHospitalById(id: string): Hospital | undefined {
    return HOSPITAL_DATABASE.find((hospital) => hospital.id === id);
  }

  // Quick emergency search - finds nearest hospitals with emergency services
  public async findNearestEmergencyHospitals(
    patientLocation: PatientLocation,
    maxDistance: number = 50 // km
  ): Promise<HospitalSearchResult> {
    return this.findNearbyHospitals({
      patientLocation,
      radius: maxDistance,
      requiredServices: ["EMERGENCY"],
      maxTravelTime: 120, // 2 hours max
    });
  }

  // Get route information to a hospital
  public async getRouteInfo(
    startLocation: Coordinates,
    endHospital: Hospital
  ): Promise<RouteInfo | null> {
    try {
      // Mock implementation - in production, use actual routing service
      // This would integrate with Google Maps Directions API or similar

      const distance = calculateDistance(
        startLocation,
        endHospital.coordinates
      );
      const duration = calculateTravelTime(distance);

      // Generate mock route steps
      const steps: RouteStep[] = [
        {
          instruction: "Head towards the main road",
          distance: "0.5 km",
          duration: "2 min",
        },
        {
          instruction: `Continue for ${Math.round(distance * 0.7)} km`,
          distance: `${Math.round(distance * 0.7 * 100) / 100} km`,
          duration: `${Math.round(duration * 0.7)} min`,
        },
        {
          instruction: `Turn towards ${endHospital.name}`,
          distance: `${Math.round(distance * 0.2 * 100) / 100} km`,
          duration: `${Math.round(duration * 0.2)} min`,
        },
        {
          instruction: `Arrive at ${endHospital.name}`,
          distance: `${Math.round(distance * 0.1 * 100) / 100} km`,
          duration: `${Math.round(duration * 0.1)} min`,
        },
      ];

      return {
        distance: `${distance.toFixed(1)} km`,
        duration: `${duration} min`,
        steps,
      };
    } catch (error) {
      console.error("Error calculating route:", error);
      return null;
    }
  }

  // Search hospitals by name or address
  public searchHospitals(query: string): Hospital[] {
    const searchTerm = query.toLowerCase();

    return HOSPITAL_DATABASE.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(searchTerm) ||
        hospital.address.toLowerCase().includes(searchTerm) ||
        hospital.district.toLowerCase().includes(searchTerm) ||
        hospital.state.toLowerCase().includes(searchTerm) ||
        hospital.specialties.some((specialty) =>
          specialty.toLowerCase().includes(searchTerm)
        )
    );
  }

  // Get hospitals by service type
  public getHospitalsByService(
    service: HospitalServiceType,
    state?: string
  ): Hospital[] {
    return HOSPITAL_DATABASE.filter((hospital) => {
      if (state && hospital.state !== state) return false;
      return hospital.services.includes(service);
    });
  }

  // Get hospital statistics for a region
  public getHospitalStatistics(state?: string): {
    total: number;
    byType: Record<string, number>;
    byService: Record<string, number>;
    emergency24x7: number;
  } {
    const hospitals = state
      ? HOSPITAL_DATABASE.filter((h) => h.state === state)
      : HOSPITAL_DATABASE;

    const stats = {
      total: hospitals.length,
      byType: {} as Record<string, number>,
      byService: {} as Record<string, number>,
      emergency24x7: hospitals.filter(
        (h) => h.services.includes("EMERGENCY") && h.isOpen24x7
      ).length,
    };

    // Count by type
    hospitals.forEach((hospital) => {
      stats.byType[hospital.type] = (stats.byType[hospital.type] || 0) + 1;
    });

    // Count by service
    hospitals.forEach((hospital) => {
      hospital.services.forEach((service) => {
        stats.byService[service] = (stats.byService[service] || 0) + 1;
      });
    });

    return stats;
  }

  private generateCacheKey(request: EmergencyHospitalRequest): string {
    return `${request.patientLocation.latitude.toFixed(
      4
    )}_${request.patientLocation.longitude.toFixed(4)}_${request.radius}_${
      request.requiredServices?.join("_") || "none"
    }_${request.preferredHospitalType || "none"}`;
  }

  private getCachedResult(cacheKey: string): HospitalSearchResult | null {
    const cached = this.cachedResults.get(cacheKey);
    if (!cached) return null;

    // Check if cache is still valid
    const now = Date.now();
    if (now - (cached as any).timestamp > this.CACHE_DURATION) {
      this.cachedResults.delete(cacheKey);
      return null;
    }

    return cached;
  }

  private cacheResult(cacheKey: string, result: HospitalSearchResult): void {
    // Add timestamp for cache expiration
    (result as any).timestamp = Date.now();
    this.cachedResults.set(cacheKey, result);

    // Limit cache size
    if (this.cachedResults.size > 10) {
      const firstKey = this.cachedResults.keys().next().value;
      this.cachedResults.delete(firstKey);
    }
  }

  // Clear cache
  public clearCache(): void {
    this.cachedResults.clear();
  }
}

// Export singleton instance
export const hospitalManager = HospitalManager.getInstance();
