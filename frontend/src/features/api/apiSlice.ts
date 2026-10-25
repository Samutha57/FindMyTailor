import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('fmt_token');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Tailor', 'Service', 'Order'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<any, any>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query<any, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    // Tailor discovery and profiles
    getTailors: builder.query<any, { search?: string; service?: string } | void>({
      query: (params) => ({
        url: '/tailors',
        params: params || {},
      }),
      providesTags: ['Tailor'],
    }),
    getTailorById: builder.query<any, string>({
      query: (id) => `/tailors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tailor', id }],
    }),
    getMyTailorProfile: builder.query<any, void>({
      query: () => '/tailors/me/profile',
      providesTags: ['Tailor'],
    }),
    updateMyTailorProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: '/tailors/me/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Tailor', 'User'],
    }),

    // Services endpoints
    getTailorServices: builder.query<any, string>({
      query: (tailorProfileId) => `/services/tailor/${tailorProfileId}`,
      providesTags: ['Service'],
    }),
    getServiceById: builder.query<any, string>({
      query: (id) => `/services/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Service', id }],
    }),
    createService: builder.mutation<any, any>({
      query: (data) => ({
        url: '/services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service', 'Tailor'],
    }),
    updateService: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Service', 'Tailor'],
    }),
    deleteService: builder.mutation<any, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service', 'Tailor'],
    }),

    // Orders endpoints
    createOrder: builder.mutation<any, any>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),
    getMyOrders: builder.query<any, void>({
      query: () => '/orders/my-orders',
      providesTags: ['Order'],
    }),
    getTailorOrders: builder.query<any, { filter?: string } | void>({
      query: (params) => ({
        url: '/orders/tailor-orders',
        params: params || {},
      }),
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<any, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    updateOrderStatus: builder.mutation<
      any,
      { orderId: string; status: string; note?: string }
    >({
      query: ({ orderId, status, note }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PATCH',
        body: { status, note },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useGetTailorsQuery,
  useGetTailorByIdQuery,
  useGetMyTailorProfileQuery,
  useUpdateMyTailorProfileMutation,
  useGetTailorServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetTailorOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = apiSlice;
