"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Dealership = { id: string; name: string };
type Category = { id: string; name: string };

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

type LookupsData = {
  dealerships: Dealership[];
  categories: Category[];
};

type VehicleData = {
  vehicle: Vehicle | null;
};

const GET_LOOKUPS = gql`
  query {
    dealerships {
      id
      name
    }
    categories {
      id
      name
    }
  }
`;

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
      dealership {
        id
        name
      }
      category {
        id
        name
      }
    }
  }
`;

const ADD_VEHICLE = gql`
  mutation AddVehicle($input: AddVehicleInput!) {
    addVehicle(input: $input) {
      id
    }
  }
`;

const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle($id: ID!, $input: UpdateVehicleInput!) {
    updateVehicle(id: $id, input: $input) {
      id
    }
  }
`;

type FormState = {
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  fuelType: string;
  imageUrl: string;
  description: string;
  dealershipId: string;
  categoryId: string;
};

const emptyForm: FormState = {
  make: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  fuelType: "",
  imageUrl: "",
  description: "",
  dealershipId: "",
  categoryId: "",
};

type Props = {
  mode: "create" | "edit";
  vehicleId?: string;
  title?: string;
};

export default function VehicleForm({ mode, vehicleId, title }: Props) {
  const router = useRouter();

  const {
    data: lookupData,
    loading: lookupLoading,
    error: lookupError,
  } = useQuery<LookupsData>(GET_LOOKUPS);

  const {
    data: vehicleData,
    loading: vehicleLoading,
    error: vehicleError,
  } = useQuery<VehicleData>(GET_VEHICLE, {
    variables: { id: vehicleId as string },
    skip: mode !== "edit" || !vehicleId,
  });

  const [addVehicle, { loading: adding, error: addError }] =
    useMutation(ADD_VEHICLE);
  const [updateVehicle, { loading: updating, error: updateError }] =
    useMutation(UPDATE_VEHICLE);

  const [form, setForm] = useState<FormState>(emptyForm);

  // Prefill for edit
  useEffect(() => {
    if (mode !== "edit") return;
    const v = vehicleData?.vehicle;
    if (!v) return;

    setForm({
      make: v.make ?? "",
      model: v.model ?? "",
      year: String(v.year ?? ""),
      price: String(v.price ?? ""),
      mileage: v.mileage == null ? "" : String(v.mileage),
      fuelType: v.fuel_type ?? "",
      imageUrl: v.image_url ?? "",
      description: v.description ?? "",
      dealershipId: v.dealership?.id ?? "",
      categoryId: v.category?.id ?? "",
    });
  }, [mode, vehicleData?.vehicle]);

  const showLoading = lookupLoading || (mode === "edit" && vehicleLoading);
  const isBusy = adding || updating;

  const canSubmit = useMemo(() => {
    if (!form.make.trim()) return false;
    if (!form.model.trim()) return false;
    if (!form.year.trim() || Number.isNaN(Number(form.year))) return false;
    if (!form.price.trim() || Number.isNaN(Number(form.price))) return false;
    if (!form.dealershipId) return false;
    return true;
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const input = {
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      price: Number(form.price),
      dealershipId: form.dealershipId,
      categoryId: form.categoryId || null,
      imageUrl: form.imageUrl.trim() || null,
      fuelType: form.fuelType.trim() || null,
      mileage: form.mileage.trim() ? Number(form.mileage) : null,
      description: form.description.trim() || null,
    };

    try {
      if (mode === "create") {
        await addVehicle({ variables: { input } });
      } else {
        await updateVehicle({
          variables: { id: vehicleId, input },
        });
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  if (showLoading) return <p className="p-6 text-gray-600">Loading form...</p>;
  if (lookupError)
    return <p className="p-6 text-red-600">Error: {lookupError.message}</p>;
  if (mode === "edit" && vehicleError)
    return <p className="p-6 text-red-600">Error: {vehicleError.message}</p>;
  if (mode === "edit" && !vehicleData?.vehicle)
    return <p className="p-6 text-gray-600">Vehicle not found.</p>;

  const dealerships = lookupData?.dealerships ?? [];
  const categories = lookupData?.categories ?? [];

  const mutationError = addError || updateError;

  const pageTitle =
    title ?? (mode === "create" ? "Add Vehicle" : "Edit Vehicle");

  const Input = ({
    label,
    required,
    children,
    hint,
  }: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
  }) => (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-800">
          {label} {required ? <span className="text-red-600">*</span> : null}
        </label>
        {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      </div>
      {children}
    </div>
  );

  const controlClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {pageTitle}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Fields marked <span className="font-semibold">*</span> are required.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-100 transition"
            >
              ← Back to Admin
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline"
            >
              Marketplace
            </Link>
          </div>
        </div>

        {/* Card */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <form onSubmit={onSubmit} className="p-7 md:p-8 grid gap-6">
            {/* GRID FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Make" required>
                <input
                  className={controlClass}
                  value={form.make}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, make: e.target.value }))
                  }
                  placeholder="e.g., Toyota"
                />
              </Input>

              <Input label="Model" required>
                <input
                  className={controlClass}
                  value={form.model}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, model: e.target.value }))
                  }
                  placeholder="e.g., Corolla"
                />
              </Input>

              <Input label="Year" required>
                <input
                  className={controlClass}
                  type="number"
                  value={form.year}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, year: e.target.value }))
                  }
                  placeholder="e.g., 2024"
                />
              </Input>

              <Input label="Price" required hint="USD">
                <input
                  className={controlClass}
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: e.target.value }))
                  }
                  placeholder="e.g., 89990"
                />
              </Input>

              <Input label="Mileage" hint="km">
                <input
                  className={controlClass}
                  type="number"
                  value={form.mileage}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, mileage: e.target.value }))
                  }
                  placeholder="e.g., 18000"
                />
              </Input>

              <Input label="Fuel Type">
                <input
                  className={controlClass}
                  value={form.fuelType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fuelType: e.target.value }))
                  }
                  placeholder="e.g., Gasoline / Electric"
                />
              </Input>
            </div>

            {/* Image URL full width */}
            <Input label="Image URL" hint="optional">
              <input
                className={controlClass}
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, imageUrl: e.target.value }))
                }
                placeholder="https://images.unsplash.com/..."
              />
            </Input>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Dealership" required>
                <select
                  className={controlClass}
                  value={form.dealershipId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dealershipId: e.target.value }))
                  }
                >
                  <option value="">Select dealership...</option>
                  {dealerships.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Input>

              <Input label="Category (Body Style)" hint="optional">
                <select
                  className={controlClass}
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, categoryId: e.target.value }))
                  }
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Input>
            </div>

            {/* Description */}
            <Input label="Description" hint="optional">
              <textarea
                className={controlClass}
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Add details about condition, features, packages, etc..."
              />
            </Input>

            {/* Error message */}
            {mutationError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {mutationError.message}
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm text-gray-600">
                {canSubmit ? (
                  <span className="text-gray-600">Ready to save.</span>
                ) : (
                  <span className="text-gray-500">
                    Fill required fields to enable saving.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/admin"
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={!canSubmit || isBusy}
                  className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {mode === "create"
                    ? isBusy
                      ? "Adding..."
                      : "Add Vehicle"
                    : isBusy
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footnote */}
        <p className="mt-4 text-xs text-gray-500">
          Tip: If an image doesn’t show, try adding <span className="font-mono">?w=1200</span> to the URL.
        </p>
      </div>
    </main>
  );
}