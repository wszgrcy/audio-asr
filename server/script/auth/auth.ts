import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { organization } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins/admin';
import { apiKey } from '@better-auth/api-key';
import {
  ac,
  acOrg,
  adminRole,
  BetterAuthSchemaGroup,
  OrgRoles,
  userRole,
} from '@project/define';
import { DbConfig } from '../../config';
import { electron } from '@better-auth/electron';
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: DbConfig.provider,
    schema: BetterAuthSchemaGroup,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    electron(),

    apiKey({
      enableMetadata: true,
      rateLimit: {
        enabled: true,
        timeWindow: 1000 * 60,
        maxRequests: 9999,
      },
      keyExpiration: { maxExpiresIn: 3650 },
    }),
    admin({
      ac,
      roles: {
        admin: adminRole,
        user: userRole,
      },
    }),
    organization({
      ac: acOrg,
      roles: OrgRoles,
      dynamicAccessControl: {
        enabled: true,
      },
    }),
  ],
});
