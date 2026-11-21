import { baseApi } from './baseApi';
import type { ApiResponse } from '../types/api.types';
import type {
  Destination,
  SuggestRequest,
  SuggestResponse,
  AutocompleteItem,
  CreateDraftTripRequest,
  DraftTripResponse,
} from '../types/destination.types';

export const destinationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTopDestinations: builder.query<ApiResponse<Destination[]>, void>({
      query: () => '/destinations/top',
      //tag LIST for the whole destination list
      //tag placeId for specific place
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ placeId }) => ({ type: 'Destination' as const, id: placeId })),
              { type: 'Destination', id: 'LIST' },
            ]
          : [{ type: 'Destination', id: 'LIST' }],
    }),

    getDestination: builder.query<ApiResponse<Destination>, { placeId: string; name?: string }>({
      query: ({ placeId, name }) => ({
        url: `/destinations/${placeId}`,
        params: name ? { name } : undefined,
      }),
      providesTags: (result, _error, { placeId }) => [{ type: 'Destination', id: placeId }],
    }),

    suggestDestinations: builder.mutation<ApiResponse<SuggestResponse>, SuggestRequest>({
      query: (body) => ({
        url: '/destinations/suggest',
        method: 'POST',
        body,
      }),
    }),

    searchPlacesAutocomplete: builder.query<ApiResponse<AutocompleteItem[]>, string>({
      query: (q) => ({
        url: '/places/autocomplete',
        params: { q },
      }),
    }),

    createDraftTrip: builder.mutation<ApiResponse<DraftTripResponse>, CreateDraftTripRequest>({
      query: (body) => ({
        url: '/trips/from-destination',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Trip'],
    }),
  }),
});

export const {
  useGetTopDestinationsQuery,
  useGetDestinationQuery,
  useSuggestDestinationsMutation,
  useSearchPlacesAutocompleteQuery,
  useLazySearchPlacesAutocompleteQuery,
  useCreateDraftTripMutation,
} = destinationsApi;
