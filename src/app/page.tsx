"use client";

import Image from "next/image";
import Link from "next/link";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number | null;
  image_url?: string | null;
  category: { id: string; name: string } | null;
  dealership: { id: string; name: string };
};

type VehiclesData = {
  searchVehicles: Vehicle[];
};

type CategoriesData = {
  categories: { id: string; name: string }[];
};

const SEARCH_VEHICLES = gql`
  query SearchVehicles($input: SearchVehicleInput) {
    searchVehicles(input: $input) {
      id
      make
      model
      year
      price
      mileage
      image_url
      category { id name }
      dealership { id name }
    }
  }
`;

const GET_CATEGORIES = gql`
  query {
    categories {
      id
      name
    }
  }
`;

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data, loading, error } = useQuery<VehiclesData>(SEARCH_VEHICLES, {
    variables: {
      input: {
        searchTerm: searchTerm || undefined,
        categoryId: categoryId || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      },
    },
  });

  const { data: categoriesData } = useQuery<CategoriesData>(GET_CATEGORIES);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900">
            AutoDrive Marketplace
          </h1>

          <Link
            href="/admin"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-100 transition"
          >
            Admin Dashboard
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-300 p-5">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {/* SEARCH */}
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800">
        Search
      </label>
      <input
        className="w-full rounded-md border border-gray-400 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
        type="text"
        placeholder="Search by Make or Model"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* CATEGORY */}
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800">
        Body Style
      </label>
      <select
        className="w-full rounded-md border border-gray-400 px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">All Body Styles</option>
        {categoriesData?.categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>

    {/* MAX PRICE */}
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800">
        Max Price
      </label>
      <input
        className="w-full rounded-md border border-gray-400 px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
        type="number"
        placeholder="e.g. 50000"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />
    </div>

  </div>
</div>

        {/* States */}
        {loading && (
          <p className="mt-6 text-gray-600">Loading vehicles...</p>
        )}
        {error && (
          <p className="mt-6 text-red-600">Error: {error.message}</p>
        )}

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.searchVehicles.map((v) => (
            <Link
              key={v.id}
              href={`/vehicle/${v.id}`}
              className="group rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-100">
                {v.image_url ? (
                  <Image
                    src={v.image_url}
                    alt={`${v.make} ${v.model}`}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-sm text-gray-500">
                    No image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {v.year} {v.make} {v.model}
                </h2>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-blue-600 font-bold">
                    ${Number(v.price).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {v.mileage ?? "N/A"} km
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span className="truncate">
                    {v.category?.name ?? "Uncategorized"}
                  </span>
                  <span className="truncate">
                    {v.dealership.name}
                  </span>
                </div>

                <div className="mt-4 text-sm font-medium text-gray-900">
                  View details →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {!loading && !error && (data?.searchVehicles?.length ?? 0) === 0 && (
          <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-gray-700 font-medium">No vehicles found</p>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}