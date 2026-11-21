import { baseApi } from './baseApi';
import type { ApiResponse } from '../types/api.types';
import type {
  Trip,
  CreateTripRequest,
  UpdateTripRequest,
  TripFullDetails,
  TripDayDetails,
  ActivityResponse,
  AddSpotToDayRequest,
  UpdateActivityRequest,
  TripSavedPlaceResponse,
  TripSpot,
  PageResponse,
  Expense,
  CreateExpenseRequest,
} from '../types/trip.types';


export const tripsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserTrips: builder.query<ApiResponse<Trip[]>, void>({
      query: () => '/trips',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Trip' as const, id })),
              { type: 'Trip', id: 'LIST' },
            ]
          : [{ type: 'Trip', id: 'LIST' }],
    }),

    getTripById: builder.query<ApiResponse<Trip>, string>({
      query: (tripId) => `/trips/${tripId}`,
      providesTags: (_result, _error, tripId) => [{ type: 'Trip', id: tripId }],
    }),

    getFullTripDetails: builder.query<ApiResponse<TripFullDetails>, string>({
      query: (tripId) => `/trips/${tripId}/full-details`,
      providesTags: (_result, _error, tripId) => [{ type: 'Trip', id: tripId }],
    }),

    createTrip: builder.mutation<ApiResponse<Trip>, CreateTripRequest>({
      query: (body) => ({
        url: '/trips',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
    }),

    updateTrip: builder.mutation<ApiResponse<Trip>, { tripId: string; data: UpdateTripRequest }>({
      query: ({ tripId, data }) => ({
        url: `/trips/${tripId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Trip', id: tripId },
        { type: 'Trip', id: 'LIST' },
      ],
    }),

    deleteTrip: builder.mutation<ApiResponse<void>, string>({
      query: (tripId) => ({
        url: `/trips/${tripId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, tripId) => [
        { type: 'Trip', id: tripId },
        { type: 'Trip', id: 'LIST' },
      ],
    }),

    // ── Day Management ───────────────────────────────────────────────────────

    addDay: builder.mutation<ApiResponse<TripDayDetails>, string>({
      query: (tripId) => ({
        url: `/trips/${tripId}/days`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, tripId) => [{ type: 'Trip', id: tripId }],
    }),

    deleteDay: builder.mutation<ApiResponse<void>, { tripId: string; dayId: string }>({
      query: ({ tripId, dayId }) => ({
        url: `/trips/${tripId}/days/${dayId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { tripId }) => [{ type: 'Trip', id: tripId }],
    }),

    // ── Activity Timeline Management ─────────────────────────────────────────

    addActivity: builder.mutation<
      ApiResponse<ActivityResponse>,
      { tripId: string; dayId: string; data: AddSpotToDayRequest }
    >({
      query: ({ tripId, dayId, data }) => ({
        url: `/trips/${tripId}/days/${dayId}/activities`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { tripId }) => [{ type: 'Trip', id: tripId }],
    }),

    deleteActivity: builder.mutation<ApiResponse<void>, { tripId: string; activityId: string }>({
      query: ({ tripId, activityId }) => ({
        url: `/trips/${tripId}/activities/${activityId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { tripId }) => [{ type: 'Trip', id: tripId }],
    }),

    updateActivity: builder.mutation<
      ApiResponse<ActivityResponse>,
      { tripId: string; activityId: string; data: UpdateActivityRequest }
    >({
      query: ({ tripId, activityId, data }) => ({
        url: `/trips/${tripId}/activities/${activityId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { tripId }) => [{ type: 'Trip', id: tripId }],
    }),

    // ── Saved / Bookmarked Places ────────────────────────────────────────────

    bookmarkSpot: builder.mutation<
      ApiResponse<TripSavedPlaceResponse>,
      { tripId: string; placeId: string }
    >({
      query: ({ tripId, placeId }) => ({
        url: `/trips/${tripId}/saved-places/${placeId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { tripId }) => [{ type: 'Trip', id: tripId }],
    }),

    removeBookmarkedSpot: builder.mutation<ApiResponse<void>, { tripId: string; placeId: string }>({
      query: ({ tripId, placeId }) => ({
        url: `/trips/${tripId}/saved-places/${placeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { tripId }) => [{ type: 'Trip', id: tripId }],
    }),

    getBookmarkedSpots: builder.query<ApiResponse<TripSavedPlaceResponse[]>, string>({
      query: (tripId) => `/trips/${tripId}/saved-places`,
      providesTags: (_result, _error, tripId) => [{ type: 'Trip', id: `${tripId}-saved` }],
    }),

    // ── Spot Discovery & Search ──────────────────────────────────────────────

    getSpotsByDestination: builder.query<
      ApiResponse<PageResponse<TripSpot>>,
      { destinationId: string; category?: string; tripId?: string; page?: number; size?: number }
    >({
      query: ({ destinationId, category = 'ALL', tripId, page = 0, size = 20 }) => ({
        url: `/destinations/${destinationId}/spots`,
        params: { category, tripId, page, size },
      }),
      providesTags: (_result, _error, { destinationId }) => [
        { type: 'Destination', id: `spots-${destinationId}` },
      ],
    }),

    searchSpots: builder.query<
      ApiResponse<PageResponse<TripSpot>>,
      { destinationId: string; q: string; tripId?: string; page?: number; size?: number }
    >({
      query: ({ destinationId, q, tripId, page = 0, size = 20 }) => ({
        url: `/destinations/${destinationId}/spots/search`,
        params: { q, tripId, page, size },
      }),
    }),

    // ── Expenses & Settlement ────────────────────────────────────────────────

    getExpensesByTrip: builder.query<ApiResponse<Expense[]>, string>({
      query: (tripId) => `/trips/${tripId}/expenses`,
      providesTags: (_result, _error, tripId) => [{ type: 'Expense', id: tripId }],
    }),

    createExpense: builder.mutation<ApiResponse<Expense>, { tripId: string; data: CreateExpenseRequest }>({
      query: ({ tripId, data }) => ({
        url: `/trips/${tripId}/expenses`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Expense', id: tripId },
        { type: 'Trip', id: tripId },
      ],
    }),

    deleteExpense: builder.mutation<ApiResponse<void>, { tripId: string; expenseId: string }>({
      query: ({ tripId, expenseId }) => ({
        url: `/trips/${tripId}/expenses/${expenseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Expense', id: tripId },
        { type: 'Trip', id: tripId },
      ],
    }),
  }),
});

export const {
  useGetUserTripsQuery,
  useGetTripByIdQuery,
  useGetFullTripDetailsQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useAddDayMutation,
  useDeleteDayMutation,
  useAddActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useBookmarkSpotMutation,
  useRemoveBookmarkedSpotMutation,
  useGetBookmarkedSpotsQuery,
  useGetSpotsByDestinationQuery,
  useLazyGetSpotsByDestinationQuery,
  useSearchSpotsQuery,
  useLazySearchSpotsQuery,
  useGetExpensesByTripQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = tripsApi;

