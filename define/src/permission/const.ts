import { defaultStatements as defaultStatementsOrg } from 'better-auth/plugins/organization/access';
export const OrgPermissionDefine = {
  ...defaultStatementsOrg,
  version: ['create', 'update', 'read', 'delete'] as const,
};
