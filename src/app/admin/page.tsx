"use client";

import Link from "next/link";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage?: number | null;
  dealership: { id: string; name: string };
  category: { id: string; name: string } | null;
};

type VehiclesData = {
  vehicles: Vehicle[];
};

const GET_VEHICLES = gql`
  query {
    vehicles {
      id
      year
      make
      model
      price
      mileage
      dealership { id name }
      category { id name }
    }
  }
`;

const DELETE_VEHICLE = gql`
  mutation DeleteVehicle($id: ID!) {
    deleteVehicle(id: $id)
  }
`;

export default function AdminPage() {
  const { data, loading, error, refetch } = useQuery<VehiclesData>(GET_VEHICLES);
  const [deleteVehicle, { loading: deleting }] = useMutation(DELETE_VEHICLE);

  async function handleDelete(id: string) {
    const ok = confirm("Delete this vehicle?");
    if (!ok) return;

    await deleteVehicle({ variables: { id } });
    await refetch();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage inventory: edit, delete, or add new vehicles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-100 transition"
            >
              ← Marketplace
            </Link>

            <Link
              href="/admin/vehicle/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              + Add Vehicle
            </Link>
          </div>
        </div>

        {loading && <p className="mt-6 text-gray-600">Loading...</p>}
        {error && <p className="mt-6 text-red-600">Error: {error.message}</p>}

        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  {["Vehicle", "Price", "Mileage", "Category", "Dealership", "Actions"].map(
                    (h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {data?.vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {v.year} {v.make} {v.model}
                      </div>
                      <div className="text-xs text-gray-500">ID: {v.id}</div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-blue-700">
                      ${Number(v.price).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {v.mileage ?? "N/A"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {v.category?.name ?? "Uncategorized"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {v.dealership.name}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                           href={`/admin/vehicle/${v.id}/edit`}
                           className="text-blue-700 hover:underline font-medium"
>
                          Edit
                        </Link>

                        <Link
                          href={`/admin/vehicle/${v.id}`}
                          className="text-gray-700 hover:underline"
>
                           View
                        </Link>
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={deleting}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 transition disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && !error && (data?.vehicles.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-gray-600" colSpan={6}>
                      No vehicles yet. Click <span className="font-medium">Add Vehicle</span>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}