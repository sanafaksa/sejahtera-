import type { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Read a JSON setting. Missing keys or values that no longer match the schema
 * fall back to the defaults (merged shallowly, so new fields get defaults).
 */
export async function getSetting<S extends z.ZodTypeAny>(
  key: string,
  schema: S,
  defaults: z.infer<S>
): Promise<z.infer<S>> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    if (!row || typeof row.value !== "object" || row.value === null || Array.isArray(row.value)) {
      return defaults;
    }
    const merged = { ...(defaults as Record<string, unknown>), ...(row.value as Record<string, unknown>) };
    const parsed = schema.safeParse(merged);
    return parsed.success ? parsed.data : defaults;
  } catch (error) {
    console.warn(`Failed to read setting "${key}":`, error);
    return defaults;
  }
}

export async function saveSetting(key: string, value: Prisma.InputJsonValue): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
