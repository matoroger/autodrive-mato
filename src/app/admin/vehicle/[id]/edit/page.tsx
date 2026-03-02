import VehicleForm from "@/components/VehicleForm";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Edit Vehicle
      </h1>
      <VehicleForm mode="edit" vehicleId={id} />
    </main>
  );
}