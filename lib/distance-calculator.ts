/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */

// Starting location: Kyrene de la Mariposa Elementary School
export const STARTING_LOCATION = {
  lat: 33.3631,
  lng: -111.9426,
  address: "1111 W Guadalupe Rd, Tempe, AZ 85283"
};

/**
 * Haversine formula to calculate distance between two points on Earth
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in miles
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Geocode an address using OpenStreetMap Nominatim API (free, no API key required)
 * Returns coordinates or null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Use OpenStreetMap Nominatim API (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'PartyLabAZ-Booking/1.0' // Required by Nominatim usage policy
        }
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Strip the leading street-address segment from a comma-separated address
 * (e.g. "1 Museum Club Dr, Flagstaff, AZ 86001" -> "Flagstaff, AZ 86001").
 * The free geocoder sometimes can't resolve a specific street address but
 * has no trouble with the city/state/zip alone. Returns null if there's
 * nothing left to simplify.
 */
function simplifyAddress(address: string): string | null {
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const simplified = parts.slice(1).join(', ');
  return simplified === address ? null : simplified;
}

/**
 * Calculate distance from starting location to a given address
 * @param address Customer's event address
 * @returns Distance in miles, or null if geocoding fails
 */
export async function calculateDistanceFromBase(address: string): Promise<number | null> {
  let coordinates = await geocodeAddress(address);

  if (!coordinates) {
    const simplified = simplifyAddress(address);
    if (simplified) {
      console.warn(`Full address geocoding failed, retrying with simplified address: "${simplified}"`);
      coordinates = await geocodeAddress(simplified);
    }
  }

  if (!coordinates) {
    return null;
  }

  const distance = haversineDistance(
    STARTING_LOCATION.lat,
    STARTING_LOCATION.lng,
    coordinates.lat,
    coordinates.lng
  );

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate travel surcharge based on distance
 * @param distance Distance in miles
 * @returns Travel surcharge amount:
 *   - 0-14 miles: $0 (free)
 *   - 15-20 miles: $40
 *   - 21-30 miles: $50
 *   - 31-40 miles: $75
 *   - 41+ miles: -1 (contact us - out of standard service)
 */
export function calculateTripCharge(distance: number): number {
  if (distance < 15) {
    return 0;
  } else if (distance <= 20) {
    return 40;
  } else if (distance <= 30) {
    return 50;
  } else if (distance <= 40) {
    return 75;
  } else {
    return -1; // Signal to show "contact us" modal
  }
}

// Constants for display
export const FREE_MILES = 15;
export const MAX_STANDARD_MILES = 40;
