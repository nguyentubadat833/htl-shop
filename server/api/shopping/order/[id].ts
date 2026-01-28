import z from "zod"
import { OrderService } from "~~/server/core/service/order"

const Schema = z.object({
  id: z.string()
})

export default defineWrappedRequiredAuthHandler(async (event) => {
  const {id} = zodValidateRequestOrThrow(Schema, getRouterParams(event))

  return await OrderService.getWithProducts(id)
})
