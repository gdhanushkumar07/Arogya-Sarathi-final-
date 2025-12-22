import { Coordinates, PatientLocation, PatientProfile } from "../types";
import { geocodeAddress, isValidCoordinates } from "../utils/geoUtils";

// Location service for handling GPS and address-based location
export class LocationService {
  private static instance: LocationService;
  private currentLocation: PatientLocation | null = null;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Get current device location using geolocation API
  public async getCurrentLocation(
    timeout: number = 10000
  ): Promise<PatientLocation | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: timeout,
        maximumAge: 60000, // 1 minute cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: PatientLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };

          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          let errorMessage = "Failed to get location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }

          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  // Watch position changes (for continuous tracking)
  public watchLocation(
    callback: (location: PatientLocation) => void,
    errorCallback?: (error: Error) => void
  ): number | null {
    if (!navigator.geolocation) {
      errorCallback?.(new Error("Geolocation is not supported"));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const location: PatientLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        this.currentLocation = location;
        callback(location);
      },
      (error) => {
        errorCallback?.(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // 30 seconds
      }
    );
  }

  // Stop watching location
  public stopWatching(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }

  // Convert patient profile location to coordinates
  public async getCoordinatesFromProfile(
    profile: PatientProfile
  ): Promise<Coordinates | null> {
    // If patient already has coordinates, use them
    if (profile.coordinates && isValidCoordinates(profile.coordinates)) {
      return profile.coordinates;
    }

    // Otherwise, try to geocode the address
    try {
      const coordinates = await geocodeAddress(profile.location);
      return coordinates;
    } catch (error) {
      console.error("Failed to geocode address:", error);
      return null;
    }
  }

  // Get cached location
  public getCachedLocation(): PatientLocation | null {
    return this.currentLocation;
  }

  // Request location permission
  public async requestLocationPermission(): Promise<boolean> {
    if (!navigator.permissions) {
      // Fallback for browsers that don't support permissions API
      return true;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      return permission.state === "granted";
    } catch (error) {
      console.warn("Failed to query location permission:", error);
      return true; // Assume permission granted if query fails
    }
  }

  // Calculate distance between current location and a coordinate
  public async getDistanceTo(
    targetCoordinates: Coordinates
  ): Promise<number | null> {
    const currentLocation = this.getCachedLocation();
    if (!currentLocation) return null;

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(
      targetCoordinates.latitude - currentLocation.latitude
    );
    const dLon = this.toRadians(
      targetCoordinates.longitude - currentLocation.longitude
    );

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(currentLocation.latitude)) *
        Math.cos(this.toRadians(targetCoordinates.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format location for display
  public formatLocation(location: PatientLocation): string {
    const accuracy = location.accuracy
      ? `±${Math.round(location.accuracy)}m`
      : "";
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(
      4
    )} ${accuracy}`;
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();
