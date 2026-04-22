import { user } from '../schema/auth';
import { createSelectSchema } from 'drizzle-valibot';
import * as v from 'valibot';
export const userSelectSchema = createSelectSchema(user);

export type User = v.InferOutput<typeof userSelectSchema>;
