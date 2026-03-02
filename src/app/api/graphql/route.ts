import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import type { NextRequest } from "next/server";

import { typeDefs } from "@/lib/schema";
import { resolvers } from "@/lib/resolvers";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create handler once
const apolloHandler = startServerAndCreateNextHandler<NextRequest>(server);

// ✅ Wrap to satisfy Next.js 16 Route Handler typing
export async function GET(req: NextRequest) {
  return apolloHandler(req);
}

export async function POST(req: NextRequest) {
  return apolloHandler(req);
}