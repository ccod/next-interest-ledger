import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const ledgerRouter = createTRPCRouter({
    addLedgerItem: protectedProcedure
    .input(z.object({
        interestAccountId: z.string(),
        date: z.date(),
        amount: z.number(),
        entryType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
         const ledgerEntry = await ctx.prisma.ledger.create({
             data: input
         })
         return ledgerEntry
    }),

    getLedgerItems: protectedProcedure
    .input(z.object({ interestAccountId: z.string() }))
    .query(async ({ ctx, input }) => {
        const ledgerEntries = await ctx.prisma.ledger.findMany({
            where: { interestAccountId: input.interestAccountId }
        })

        return ledgerEntries
    }),

    deleteLedgerItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const entry = await ctx.prisma.ledger.delete({ 
            where: { id: input.id } 
        })

        return entry
    })
})
 
