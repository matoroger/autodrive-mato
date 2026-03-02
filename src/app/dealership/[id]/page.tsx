"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number | null;
  image_url?: string | null;
  category: { id: string; name: string } | null;
};

type Dealership = {
  id: string;
  name: string;
  address?: string | null;
  image_url?: string | null;
  vehicles: Vehicle[];
};

type DealershipData = {
  dealership: Dealership | null;
};

const GET_DEALERSHIP = gql`
  query Dealership($id: ID!) {
    dealership(id: $id) {
      id
      name
      address
      image_url
      vehicles {
        id
        make
        model
        year
        price
        mileage
        image_url
        category { id name }
      }
    }
  }
`;

export default function DealershipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, loading, error } = useQuery<DealershipData>(GET_DEALERSHIP, {
    variables: { id },
  });

  if (loading) return <p className="p-6 text-gray-700">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>;
  if (!data?.dealership) return <p className="p-6">Dealership not found.</p>;

  const d = data.dealership;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-100 transition"
          >
            ← Back to Marketplace
          </Link>

          <Link href="/admin" className="text-sm text-gray-700 hover:underline">
            Admin
          </Link>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 flex gap-5 items-center">
            <div className="relative h-20 w-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              {d.image_url ? (
                <Image
                  src={d.image_url}
                  alt={d.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-gray-500 text-sm">
                  No image
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{d.name}</h1>
              {d.address ? (
                <p className="text-gray-600 mt-1">{d.address}</p>
              ) : null}
              <p className="text-sm text-gray-600 mt-1">
                {d.vehicles.length} vehicle(s)
              </p>
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-xl font-semibold text-gray-900">
          Inventory
        </h2>

        {d.vehicles.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-gray-700 font-medium">No vehicles found</p>
            <p className="text-gray-500 text-sm mt-1">
              This dealership has no listed inventory yet.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {d.vehicles.map((v) => (
              <Link
                key={v.id}
                href={`/vehicle/${v.id}`}
                className="group rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden"
              >
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
                    <div className="h-full w-full grid place-items-center text-gray-500 text-sm">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {v.year} {v.make} {v.model}
                  </h3>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-blue-600 font-bold">
                      ${Number(v.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {v.mileage ?? "N/A"} km
                    </p>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    {v.category?.name ?? "Uncategorized"}
                  </div>

                  <div className="mt-4 text-sm font-medium text-gray-900">
                    View details →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}