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
  dealership: { id: string; name: string; address?: string | null };
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
      category { id name }
      dealership { id name address }
    }
  }
`;

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, loading, error } = useQuery<VehicleData>(GET_VEHICLE, {
    variables: { id },
  });

  if (loading) return <p className="p-6 text-gray-700">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>;
  if (!data?.vehicle) return <p className="p-6">Vehicle not found.</p>;

  const v = data.vehicle;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-100 transition"
          >
            ← Back to Marketplace
          </Link>

          <Link
            href="/admin"
            className="text-sm text-gray-700 hover:underline"
          >
            Admin
          </Link>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          {v.year} {v.make} {v.model}
        </h1>

        <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
          <span className="rounded-full bg-white border border-gray-200 px-3 py-1">
            {v.category?.name ?? "Uncategorized"}
          </span>
          <Link
            href={`/dealership/${v.dealership.id}`}
            className="hover:underline"
          >
            {v.dealership.name}
          </Link>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="relative h-[320px] sm:h-[420px] w-full bg-gray-100">
            {v.image_url ? (
              <Image
                src={v.image_url}
                alt={`${v.make} ${v.model}`}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-gray-500">
                No image
              </div>
            )}
          </div>

          <div className="p-6 grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Price</div>
                <div className="text-2xl font-bold text-blue-700">
                  ${Number(v.price).toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Mileage</div>
                <div className="text-2xl font-bold text-gray-900">
                  {v.mileage ?? "N/A"}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Fuel Type</div>
                <div className="text-lg font-semibold text-gray-900">
                  {v.fuel_type ?? "N/A"}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Dealership</div>
                <div className="text-lg font-semibold text-gray-900">
                  <Link
                    href={`/dealership/${v.dealership.id}`}
                    className="hover:underline"
                  >
                    {v.dealership.name}
                  </Link>
                </div>
                {v.dealership.address ? (
                  <div className="text-sm text-gray-600 mt-1">
                    {v.dealership.address}
                  </div>
                ) : null}
              </div>
            </div>

            {v.description ? (
              <div className="pt-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Description
                </h2>
                <p className="mt-2 text-gray-700 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}