import React, { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Star,
  AlertTriangle,
  Car,
  Loader2,
  RefreshCw,
  Filter,
  Heart,
  Shield,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { Hospital, PatientLocation, HospitalService } from "../types";
import { locationService } from "../services/locationService";
import { hospitalManager } from "../services/hospitalManager";
import { calculateDistance, formatCoordinates } from "../utils/geoUtils";

interface EmergencyHospitalFinderProps {
  onBack: () => void;
  patientProfile?: {
    name: string;
    location: string;
    state: string;
    coordinates?: { latitude: number; longitude: number };
  };
}

const EmergencyHospitalFinder: React.FC<EmergencyHospitalFinderProps> = ({
  onBack,
  patientProfile,
}) => {
  const [currentLocation, setCurrentLocation] =
    useState<PatientLocation | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(25); // km
  const [showFilters, setShowFilters] = useState(false);
  const [requiredServices, setRequiredServices] = useState<HospitalService[]>([
    "EMERGENCY",
  ]);
  const [hospitalType, setHospitalType] = useState<
    "GOVERNMENT" | "PRIVATE" | "ALL"
  >("ALL");

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to get current GPS location
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        await searchNearbyHospitals(location);
      } else {
        // Fallback to profile location
        if (patientProfile?.coordinates) {
          const fallbackLocation: PatientLocation = {
            ...patientProfile.coordinates,
            timestamp: Date.now(),
          };
          setCurrentLocation(fallbackLocation);
          await searchNearbyHospitals(fallbackLocation);
        } else {
          throw new Error(
            "Location access denied and no profile location available"
          );
        }
      }
    } catch (err) {
      console.error("Location error:", err);
      setError(
        "Unable to get your location. Please enable location access or try again."
      );

      // Fallback to profile location if available
      if (patientProfile?.coordinates) {
        const fallbackLocation: PatientLocation = {
          ...patientProfile.coordinates,
          timestamp: Date.now(),
        };
        setCurrentLocation(fallbackLocation);
        await searchNearbyHospitals(fallbackLocation);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const searchNearbyHospitals = async (location: PatientLocation) => {
    try {
      setIsLoading(true);

      const request = {
        patientLocation: location,
        radius: searchRadius,
        requiredServices:
          requiredServices.length > 0 ? requiredServices : undefined,
        preferredHospitalType:
          hospitalType === "ALL" ? undefined : hospitalType,
        maxTravelTime: 180, // 3 hours max
      };

      const result = await hospitalManager.findNearbyHospitals(request);
      setNearbyHospitals(result.hospitals);
    } catch (err) {
      console.error("Hospital search error:", err);
      setError("Failed to find nearby hospitals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!currentLocation) return;
    await searchNearbyHospitals(currentLocation);
  };

  const callHospital = (hospital: Hospital) => {
    const phone = hospital.emergencyPhone || hospital.phone;
    window.open(`tel:${phone}`, "_self");
  };

  const openDirections = (hospital: Hospital) => {
    if (!currentLocation) return;

    const url = `https://www.google.com/maps/dir/${currentLocation.latitude},${currentLocation.longitude}/${hospital.coordinates.latitude},${hospital.coordinates.longitude}`;
    window.open(url, "_blank");
  };

  const getHospitalTypeIcon = (type: string) => {
    switch (type) {
      case "GOVERNMENT":
        return <Shield className="w-4 h-4" />;
      case "PRIVATE":
        return <Heart className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getHospitalTypeColor = (type: string) => {
    switch (type) {
      case "GOVERNMENT":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "PRIVATE":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isLoading && nearbyHospitals.length === 0) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-800">
              Finding Nearby Hospitals
            </h2>
            <p className="text-red-600 text-sm">
              Please wait while we locate the nearest medical facilities...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedHospital) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedHospital(null)}
              className="p-2 hover:bg-red-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-lg">{selectedHospital.name}</h1>
              <p className="text-red-100 text-sm">{selectedHospital.address}</p>
            </div>
          </div>
        </div>

        {/* Hospital Details */}
        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => callHospital(selectedHospital)}
              className="bg-red-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </button>
            <button
              onClick={() => openDirections(selectedHospital)}
              className="bg-blue-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-5 h-5" />
              Directions
            </button>
          </div>

          {/* Hospital Info */}
          <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border ${getHospitalTypeColor(
                  selectedHospital.type
                )}`}
              >
                {getHospitalTypeIcon(selectedHospital.type)}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {selectedHospital.type} Hospital
                </p>
                <p className="text-sm text-gray-600">
                  {selectedHospital.district}, {selectedHospital.state}
                </p>
              </div>
            </div>

            {selectedHospital.distance && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">
                  {selectedHospital.distance} km away
                </span>
                {selectedHospital.travelTime && (
                  <span className="text-sm text-gray-500">
                    • {selectedHospital.travelTime} min drive
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">
                {selectedHospital.isOpen24x7 ? "24/7 Open" : "Limited Hours"}
              </span>
            </div>

            {selectedHospital.rating && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">
                  {selectedHospital.rating}/5.0
                </span>
                <span className="text-sm text-gray-500">Rating</span>
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Available Services</h3>
            <div className="flex flex-wrap gap-2">
              {selectedHospital.services.map((service) => (
                <span
                  key={service}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                >
                  {service.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Specialties</h3>
            <div className="space-y-2">
              {selectedHospital.specialties.map((specialty, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700">{specialty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-3">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Emergency</p>
                  <p className="text-red-600 font-bold">
                    {selectedHospital.emergencyPhone || selectedHospital.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">General</p>
                  <p className="text-gray-700">{selectedHospital.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities */}
          {selectedHospital.facilities.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Facilities</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedHospital.facilities.map((facility, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-red-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Emergency Hospital Finder
            </h1>
            <p className="text-red-100 text-sm">
              Find the nearest hospitals for emergency care
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-red-700 rounded-full transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-red-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Radius: {searchRadius} km
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Type
            </label>
            <select
              value={hospitalType}
              onChange={(e) => setHospitalType(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Types</option>
              <option value="GOVERNMENT">Government</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Update Search
          </button>
        </div>
      )}

      {/* Location Status */}
      <div className="p-4">
        <div className="bg-white rounded-2xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                currentLocation ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {currentLocation ? "Location Found" : "Location Not Available"}
              </p>
              <p className="text-sm text-gray-600">
                {currentLocation
                  ? formatCoordinates(currentLocation)
                  : "Enable location access to find nearby hospitals"}
              </p>
            </div>
            {currentLocation && (
              <button
                onClick={initializeLocation}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-4 p-4 bg-red-100 border border-red-300 rounded-2xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-4 space-y-4">
        {nearbyHospitals.length === 0 && !isLoading ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">No Hospitals Found</h3>
            <p className="text-gray-600 text-sm mb-4">
              Try increasing the search radius or adjusting filters
            </p>
            <button
              onClick={handleSearch}
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700"
            >
              Search Again
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                Nearby Hospitals ({nearbyHospitals.length})
              </h2>
              <span className="text-sm text-gray-500">
                Within {searchRadius} km
              </span>
            </div>

            {nearbyHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">
                        {hospital.name}
                      </h3>
                      <div
                        className={`px-2 py-1 rounded-full border text-xs font-medium ${getHospitalTypeColor(
                          hospital.type
                        )}`}
                      >
                        {hospital.type}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {hospital.address}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-700">
                      {hospital.distance && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">
                            {hospital.distance} km
                          </span>
                        </div>
                      )}
                      {hospital.travelTime && (
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          <span>{hospital.travelTime} min</span>
                        </div>
                      )}
                      {hospital.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{hospital.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => callHospital(hospital)}
                      className="bg-red-600 text-white p-2 rounded-xl hover:bg-red-700 transition-colors"
                      title="Call Hospital"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDirections(hospital)}
                      className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors"
                      title="Get Directions"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Clock
                    className={`w-4 h-4 ${
                      hospital.isOpen24x7 ? "text-green-600" : "text-orange-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      hospital.isOpen24x7 ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {hospital.isOpen24x7 ? "24/7 Open" : "Limited Hours"}
                  </span>
                  {hospital.services.includes("EMERGENCY") && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      Emergency
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {hospital.services.slice(0, 3).map((service) => (
                    <span
                      key={service}
                      className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                    >
                      {service.replace("_", " ")}
                    </span>
                  ))}
                  {hospital.services.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{hospital.services.length - 3} more
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedHospital(hospital)}
                  className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default EmergencyHospitalFinder;
