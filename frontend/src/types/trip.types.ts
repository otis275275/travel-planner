import type { Destination } from './destination.types';

export type TripStatus = 'DRAFT' | 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type TripRole = 'OWNER' | 'EDITOR' | 'VIEWER';
export type ActivityType = 'VISIT' | 'FOOD' | 'TRANSPORT' | 'FREE_TIME';
export type PlaceType = 'ATTRACTION' | 'RESTAURANT' | 'HOTEL' | 'ACTIVITY' | 'CAFE';

export interface Trip {
  id: string;
  title: string;
  status: TripStatus;
  destination: Destination | null;
  startDate?: string | null;
  endDate?: string | null;
  totalBudget?: number | null;
  role?: TripRole;
  createdAt: string;
}

export interface CreateTripRequest {
  title: string;
  placeId: string;
  destinationName: string;
  startDate?: string | null;
  endDate?: string | null;
  totalBudget?: number | null;
  status?: TripStatus;
}

export interface UpdateTripRequest {
  title?: string;
  placeId?: string;
  destinationName?: string;
  startDate?: string | null;
  endDate?: string | null;
  totalBudget?: number | null;
  status?: TripStatus;
}

export interface TripSpot {
  id: string;
  name: string;
  category: string;
  type: PlaceType;
  image: string;
  photoUrls?: string[];
  address?: string;
  area: string;
  distance: string;
  rating: string;
  ratingValue?: number;
  reviews: string;
  reviewsCount?: number;
  price: string;
  hours: string;
  description: string;
  reviewSummary?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  isAdded: boolean;
  isSaved: boolean;
}

export interface ActivityResponse {
  id: string;
  tripDayId: string;
  placeId?: string | null;
  place?: TripSpot | null;
  type: ActivityType;
  title: string;
  startTime?: string | null;
  endTime?: string | null;
  estCost?: number | null;
  position: number;
  notes?: string | null;
}

export interface TripDayDetails {
  id: string;
  tripId: string;
  dayNumber: number;
  date?: string | null;
  notes?: string | null;
  activities: ActivityResponse[];
}

export interface TripSavedPlaceResponse {
  tripId: string;
  placeId: string;
  savedAt: string;
  place: TripSpot;
}

export interface TripFullDetails {
  id: string;
  title: string;
  destination: Destination | null;
  startDate?: string | null;
  endDate?: string | null;
  totalBudget?: number | null;
  status: TripStatus;
  role?: TripRole;
  days: TripDayDetails[];
  savedPlaces: TripSavedPlaceResponse[];
  totalActivitiesCount: number;
  totalSavedPlacesCount: number;
}

export interface AddSpotToDayRequest {
  placeId?: string | null;
  title?: string;
  type?: ActivityType;
  startTime?: string | null;
  endTime?: string | null;
  estCost?: number | null;
  notes?: string | null;
}

export interface UpdateActivityRequest {
  title?: string;
  type?: ActivityType;
  startTime?: string | null;
  endTime?: string | null;
  estCost?: number | null;
  notes?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export type PaymentSource = 'GROUP_FUND' | 'PERSONAL_POCKET';

export interface Expense {
  id: string;
  tripId: string;
  activityId?: string | null;
  activityTitle?: string | null;
  activityDayNumber?: number | null;
  activityStartTime?: string | null;
  title: string;
  amount: number;
  source: PaymentSource;
  paidByUserId?: string | null;
  paidByName?: string | null;
  paidByAvatar?: string | null;
  createdAt: string;
}

export interface CreateExpenseRequest {
  activityId?: string | null;
  title: string;
  amount: number;
  source?: PaymentSource;
  paidByUserId?: string | null;
}

