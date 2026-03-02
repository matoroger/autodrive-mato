import { pool } from "./db";

type AnyRow = Record<string, any>;

function mapVehicleRow(r: AnyRow) {
  return {
    id: String(r.id),
    make: r.make,
    model: r.model,
    year: Number(r.year),
    price: Number(r.price),
    mileage: r.mileage == null ? null : Number(r.mileage),
    fuel_type: r.fuel_type ?? null,
    image_url: r.image_url ?? null,
    description: r.description ?? null,
    created_at: r.created_at ?? null,

    dealership: {
      id: String(r.d_id),
      name: r.d_name,
      address: r.d_address ?? null,
      image_url: r.d_image_url ?? null,
      created_at: r.d_created_at ?? null,
    },

    category: r.c_id
      ? {
          id: String(r.c_id),
          name: r.c_name,
        }
      : null,
  };
}

const VEHICLE_JOIN_SQL = `
  SELECT
    v.*,
    d.id AS d_id, d.name AS d_name, d.address AS d_address, d.image_url AS d_image_url, d.created_at AS d_created_at,
    c.id AS c_id, c.name AS c_name
  FROM vehicles v
  JOIN dealerships d ON v.dealership_id = d.id
  LEFT JOIN categories c ON v.category_id = c.id
`;

export const resolvers = {
  Query: {
    vehicles: async () => {
      const [rows] = await pool.query(`${VEHICLE_JOIN_SQL} ORDER BY v.id DESC`);
      return (rows as AnyRow[]).map(mapVehicleRow);
    },

    vehicle: async (_: any, { id }: { id: string }) => {
      const [rows] = await pool.query(`${VEHICLE_JOIN_SQL} WHERE v.id = ?`, [id]);
      const list = rows as AnyRow[];
      return list.length ? mapVehicleRow(list[0]) : null;
    },

    //  dealership(id)
    dealership: async (_: any, { id }: { id: string }) => {
      const [rows] = await pool.query("SELECT * FROM dealerships WHERE id = ?", [
        id,
      ]);
      const list = rows as AnyRow[];
      return list.length ? list[0] : null;
    },

    //  dealershipVehicles(dealershipId)
    dealershipVehicles: async (
      _: any,
      { dealershipId }: { dealershipId: string }
    ) => {
      const [rows] = await pool.query(
        `${VEHICLE_JOIN_SQL} WHERE v.dealership_id = ? ORDER BY v.id DESC`,
        [dealershipId]
      );
      return (rows as AnyRow[]).map(mapVehicleRow);
    },

    searchVehicles: async (_: any, { input }: any) => {
      const where: string[] = [];
      const params: any[] = [];

      if (input?.searchTerm) {
        where.push("(v.make LIKE ? OR v.model LIKE ?)");
        params.push(`%${input.searchTerm}%`, `%${input.searchTerm}%`);
      }
      if (input?.categoryId) {
        where.push("v.category_id = ?");
        params.push(input.categoryId);
      }
      if (input?.dealershipId) {
        where.push("v.dealership_id = ?");
        params.push(input.dealershipId);
      }
      if (input?.maxPrice != null) {
        where.push("v.price <= ?");
        params.push(input.maxPrice);
      }

      const sql =
        `${VEHICLE_JOIN_SQL}` +
        (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
        " ORDER BY v.id DESC";

      const [rows] = await pool.query(sql, params);
      return (rows as AnyRow[]).map(mapVehicleRow);
    },

    dealerships: async () => {
      const [rows] = await pool.query(
        "SELECT * FROM dealerships ORDER BY id DESC"
      );
      return rows;
    },

    categories: async () => {
      const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
      return rows;
    },
  },

  Mutation: {
    addVehicle: async (_: any, { input }: any) => {
      const [result] = await pool.query(
        `INSERT INTO vehicles
          (dealership_id, category_id, make, model, year, price, mileage, fuel_type, image_url, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.dealershipId,
          input.categoryId ?? null,
          input.make,
          input.model,
          input.year,
          input.price,
          input.mileage ?? null,
          input.fuelType ?? null,
          input.imageUrl ?? null,
          input.description ?? null,
        ]
      );

      const insertId = (result as any).insertId;
      const [rows] = await pool.query(`${VEHICLE_JOIN_SQL} WHERE v.id = ?`, [
        insertId,
      ]);
      const list = rows as AnyRow[];
      return list.length ? mapVehicleRow(list[0]) : null;
    },

    updateVehicle: async (_: any, { id, input }: any) => {
      await pool.query(
        `UPDATE vehicles SET
          dealership_id = ?,
          category_id = ?,
          make = ?,
          model = ?,
          year = ?,
          price = ?,
          mileage = ?,
          fuel_type = ?,
          image_url = ?,
          description = ?
         WHERE id = ?`,
        [
          input.dealershipId,
          input.categoryId ?? null,
          input.make,
          input.model,
          input.year,
          input.price,
          input.mileage ?? null,
          input.fuelType ?? null,
          input.imageUrl ?? null,
          input.description ?? null,
          id,
        ]
      );

      const [rows] = await pool.query(`${VEHICLE_JOIN_SQL} WHERE v.id = ?`, [id]);
      const list = rows as AnyRow[];
      return list.length ? mapVehicleRow(list[0]) : null;
    },

    updateVehiclePrice: async (_: any, { id, newPrice }: any) => {
      await pool.query("UPDATE vehicles SET price = ? WHERE id = ?", [
        newPrice,
        id,
      ]);

      const [rows] = await pool.query(`${VEHICLE_JOIN_SQL} WHERE v.id = ?`, [id]);
      const list = rows as AnyRow[];
      return list.length ? mapVehicleRow(list[0]) : null;
    },

    deleteVehicle: async (_: any, { id }: { id: string }) => {
      const [result] = await pool.query("DELETE FROM vehicles WHERE id = ?", [id]);
      return (result as any).affectedRows > 0;
    },
  },
};