import { exampleRouter } from "~/server/api/routers/example";
import { interestAccountRouter } from "./routers/interestAccount";
import { createTRPCRouter } from "~/server/api/trpc";
import { ledgerRouter } from "./routers/ledger";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  interestAccount: interestAccountRouter,
  ledger: ledgerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
