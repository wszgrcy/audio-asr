import { d } from '../drizzle-orm-export';
export const CommonId = () => d.uuid();
export const CommonColumns = () => {
  return {
    id: d.uuid().defaultRandom().primaryKey(),
    createdAt: d.timestamp('created_at').defaultNow().notNull(),

    updatedAt: d
      .timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  } as const;
};
