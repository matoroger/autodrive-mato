"use client";

import Link from "next/link";
import VehicleForm from "@/components/VehicleForm";

export default function NewVehiclePage() {
  return (
    <main style={{ padding: 20 }}>
      <Link href="/admin">← Back to Admin</Link>
      <h1 style={{ marginTop: 12 }}>Add Vehicle</h1>

      <VehicleForm mode="create" />
    </main>
  );
}