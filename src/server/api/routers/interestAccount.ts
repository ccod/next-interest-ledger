import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const interestAccountRouter = createTRPCRouter({
    addAccount: protectedProcedure
    .input(z.object({
        name: z.string(),
        principle: z.number(),
        interest: z.number(),
        startDate: z.date(),
        interestInterval: z.string(),
        incrementRate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
         const interestAccount = await ctx.prisma.interestAccount.create({
             data: {...input, userId: ctx.session.user.id }
         })
         return interestAccount
    }),

    editAccount: protectedProcedure
    .input(z.object({
        id: z.string(),
        userId: z.string(),
        name: z.string(),
        principle: z.number(),
        interest: z.number(),
        startDate: z.date(),
        interestInterval: z.string(),
        incrementRate: z.string(),

    }))
    .mutation(async ({ ctx, input }) => {
        const interestAccount = await ctx.prisma.interestAccount.update({ 
            where: { id: input.id }, data: input 
        })
        return interestAccount
    }),

    getAccount: protectedProcedure
    .input(z.object({id: z.string()}))
    .query(async ({ctx, input}) => {
        const interestAccount = await ctx.prisma.interestAccount.findFirst({ 
            where: { id: input.id }, include: { ledger: true } 
        })
        return interestAccount
    }),

    getAccounts: protectedProcedure.query(async ({ctx}) => {
        const interestAccounts = await ctx.prisma.interestAccount.findMany({ where: { userId: ctx.session.user.id } })
        return interestAccounts
    }),

    deleteAccount: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const interestAccount = await ctx.prisma.interestAccount.delete({
            where: { id: input.id }
        })

        return interestAccount
    })
})
