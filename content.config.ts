import { defineCollection, defineContentConfig } from "@nuxt/content";
import { z } from "zod";

export default defineContentConfig({
  collections: {
    ui: defineCollection({
      type: "data",
      source: "nav/**.json",
      schema: z.object({
        code: z.string(),
        name: z.string(),
        icon: z.string().optional(),
      }),
    }),
  },
});
