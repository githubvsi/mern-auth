import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '' });

/*
    A parent to all API slices
*/
export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User'], // has to do with caching
    endpoints: (builder) => ({}),
});