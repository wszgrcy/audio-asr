import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../../db';
import { acOrg, BetterAuthSchemaGroup, OrgRoles } from '@project/define';

import { admin, organization, UserWithRole } from 'better-auth/plugins';
import { ac, adminRole, userRole } from '@project/define/auth';
import { injector$ } from '../../injector';
import { AdminService } from '@@domain/admin/admin.service';
import { DbConfig } from '../../../config';
import { apiKey } from '@better-auth/api-key';
import { electron } from '@better-auth/electron';
import { bearer } from 'better-auth/plugins';
import { $localize } from '@cyia/localize';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: DbConfig.provider,
    schema: BetterAuthSchemaGroup,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    'http://localhost:4202',
    'local.asr:/',
    'http://localhost:4200',
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user, context) => {
          await injector$()
            .get(AdminService)
            .addUserToDefaultOrganization(user);
        },
      },
    },
  },
  plugins: [
    electron(),
    bearer(),
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
      organizationHooks: {
        beforeRemoveMember: async ({ user, member, organization }) => {
          // 除了用户被删除外,应该禁止移除
          throw new Error($localize`禁止`);
        },
      },
      allowUserToCreateOrganization: async (user) => {
        return (user as UserWithRole).role === 'admin';
      },
    }),
  ],
});
