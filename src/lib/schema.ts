import gql from "graphql-tag";

export const typeDefs = gql`
  type Dealership {
    id: ID!
    name: String!
    address: String
    image_url: String
    created_at: String
  }

  type Category {
    id: ID!
    name: String!
  }

  type Vehicle {
    id: ID!
    make: String!
    model: String!
    year: Int!
    price: Float!
    mileage: Int
    fuel_type: String
    image_url: String
    description: String
    created_at: String

    dealership: Dealership!
    category: Category
  }

  input SearchVehicleInput {
    searchTerm: String
    categoryId: ID
    maxPrice: Float
    dealershipId: ID
  }

  input AddVehicleInput {
    make: String!
    model: String!
    year: Int!
    price: Float!
    dealershipId: ID!
    categoryId: ID
    imageUrl: String
    fuelType: String
    mileage: Int
    description: String
  }

  input UpdateVehicleInput {
    make: String!
    model: String!
    year: Int!
    price: Float!
    dealershipId: ID!
    categoryId: ID
    imageUrl: String
    fuelType: String
    mileage: Int
    description: String
  }

  type Query {
    vehicles: [Vehicle!]!
    vehicle(id: ID!): Vehicle

    searchVehicles(input: SearchVehicleInput): [Vehicle!]!

    dealerships: [Dealership!]!
    dealership(id: ID!): Dealership

    # (for Dealership Profile page)
    dealershipVehicles(dealershipId: ID!): [Vehicle!]!

    categories: [Category!]!
  }

  type Mutation {
    addVehicle(input: AddVehicleInput!): Vehicle!
    updateVehicle(id: ID!, input: UpdateVehicleInput!): Vehicle
    updateVehiclePrice(id: ID!, newPrice: Float!): Vehicle
    deleteVehicle(id: ID!): Boolean!
  }
`;