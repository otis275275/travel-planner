export interface Destination {
  id: string;
  placeId: string;
  name: string;
  state?: string | null;
  country?: string | null;
  summary: string | null;
  pros: string[];
  cons: string[];
  bestTimeToVisit: string | null;
  specialtyDishes: string[];
  estimatedBudget: string | null;
  themeTags: string[];
  photoUrls: string[];
  latitude: number | null;
  longitude: number | null;
  createdAt?: string;
}

export type RegionOption = 'NORTH' | 'CENTRAL' | 'SOUTH' | 'ANY';
export type VibeOption = 'NATURE' | 'BEACH' | 'HISTORY' | 'FOOD' | 'PHOTO';
export type CompanionOption = 'SOLO' | 'COUPLE' | 'FRIENDS' | 'FAMILY';

export interface SuggestRequest {
  region: RegionOption;
  vibe: VibeOption;
  companion: CompanionOption;
  travelMonth: number; // 1-12
}

export interface SuggestResponse {
  destinations: Destination[];
}

export interface AutocompleteItem {
  placeId: string;
  displayName: string;
  region?: string;
}

export interface CreateDraftTripRequest {
  placeId: string;
  destinationName: string;
}

export interface DraftTripResponse {
  tripId: string;
  title: string;
  destination: string;
  destinationId?: string | null;
  placeId?: string | null;
  destinationCoverUrl?: string | null;
}
