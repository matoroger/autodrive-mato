"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number | null;
  fuel_type?: string | null;
  image_url?: string | null;
  description?: string | null;
  dealership: { id: string; name: string };
  category: { id: string; name: string } | null;
};

type VehicleData = {
  vehicle: Vehicle | null;
};

const GET_VEHICLE = gql`
  query Vehicle($id: ID!) {
    vehicle(id: $id) {
      id
      make
      model
      year
      price
      mileage
      fuel_type
      image_url
      description
      category {
        id
        name
      }
      dealership {
        id
        name
      }
    }
  }
`;

function formatMoney(n: number) {
  try {
    return n.toLocaleString();
  } catch {
    return String(n);
  }
}

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, loading, error } = useQuery<VehicleData>(GET_VEHICLE, {
    variables: { id },
  });

  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>;
  if (!data?.vehicle) return <p className="p-6 text-gray-600">Vehicle not found.</p>;

  const v = data.vehicle;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-100 transition"
          >
            ← Back to Marketplace
          </Link>

          <Link
            href="/admin"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Admin
          </Link>
        </div>

        {/* Title */}
        <div className="mt-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            {v.year} {v.make} {v.model}
          </h1>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
              {v.category?.name ?? "Uncategorized"}
            </span>

            <Link
              href={`/dealership/${v.dealership.id}`}
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              {v.dealership.name}
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {v.image_url ? (
            <Image
              src={v.image_url}
              alt={`${v.make} ${v.model}`}
              width={1400}
              height={800}
              className="w-full h-[260px] sm:h-[360px] md:h-[420px] object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="w-full h-[260px] sm:h-[360px] md:h-[420px] bg-gray-100 flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-medium text-gray-500">Price</div>
              <div className="mt-1 text-2xl font-extrabold text-blue-700">
                ${formatMoney(v.price)}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-medium text-gray-500">Mileage</div>
              <div className="mt-1 text-2xl font-extrabold text-gray-900">
                {v.mileage ?? "N/A"}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-medium text-gray-500">Fuel Type</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {v.fuel_type ?? "N/A"}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-medium text-gray-500">Dealership</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                <Link
                  href={`/dealership/${v.dealership.id}`}
                  className="hover:underline"
                >
                  {v.dealership.name}
                </Link>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {/* If you later add dealership address in query, you can display it here */}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900">Description</h2>
          <p className="mt-2 text-gray-700 leading-relaxed">
            {v.description?.trim() ? v.description : "No description provided."}
          </p>
        </div>
      </div>
    </main>
  );
}