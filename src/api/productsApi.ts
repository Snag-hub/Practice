import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseApi";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    // Fetch all products
    fetchProducts: builder.query({
      query: () => ({
        url: "/Employee/GetAllEmployee",
        method: "GET",
      }),
      providesTags: ["Product"],
    }),
    // Fetch a specific product by ID
    fetchProductById: builder.query({
      query: (id: string) => ({
        url: `/Items/${id}`,
        method: "GET",

      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    // Create a new product
    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/Items",
        method: "POST",
        data: newProduct,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useFetchProductsQuery,
  useFetchProductByIdQuery,
  useCreateProductMutation,
} = productsApi;
