"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const zod_1 = require("zod");
const auth_router_1 = require("./auth-router");
const trpc_1 = require("./trpc");
const query_validators_1 = require("../lib/validators/query-validators");
const get_payload_1 = require("../get-payload");
const payment_router_1 = require("./payment-router");
// export const appRouter = router({
//   anyApiRoute: publicProcedure.query(() => {
//     return "Hello everyone";
//   }),
// });
exports.appRouter = (0, trpc_1.router)({
    auth: auth_router_1.authRouter,
    payment: payment_router_1.paymentRouter,
    getInfiniteProducts: trpc_1.publicProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100),
        cursor: zod_1.z.number().nullish(),
        query: query_validators_1.QueryValiator,
    }))
        .query(async ({ input }) => {
        const { query, cursor } = input;
        const { sort, limit, ...queryOpts } = query;
        const payload = await (0, get_payload_1.getPayloadClient)();
        const parsedQueryOpts = {};
        Object.entries(queryOpts).forEach(([key, value]) => {
            parsedQueryOpts[key] = {
                equals: value,
            };
        });
        const page = cursor || 1;
        const { docs: items, hasNextPage, nextPage, } = await payload.find({
            collection: "products",
            where: {
                approvedForSale: {
                    equals: "approved",
                },
                ...parsedQueryOpts,
            },
            sort,
            depth: 1,
            limit,
            page,
        });
        return { items, nextPage: hasNextPage ? nextPage : null };
    }),
});
