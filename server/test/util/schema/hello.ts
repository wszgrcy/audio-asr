import * as d from 'drizzle-orm/pg-core';
export const pgTable = d.pgTableCreator((name) => `${name}`);

// const pgTable = d.pgTable;
// todo 不行,需要改public,启动另一个镜像
// const s = d.pgSchema('test');
export const Hello = pgTable('hello', {
  id: d.serial().primaryKey(),
  name: d.text().notNull(),
});
