import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';
import { defaultRoles } from 'better-auth/plugins/organization/access';
import { OrgPermissionDefine } from '../permission/const';

export const statement = {
  ...defaultStatements,
  webui: ['read'],
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  webui: ['read'],
  ...adminAc.statements,
});
export const userRole = ac.newRole({
  webui: ['read'],
});

export const acOrg = createAccessControl(OrgPermissionDefine);
export const orgOwerRole = acOrg.newRole(OrgPermissionDefine as any);

export const OrgRoles = {
  ...defaultRoles,
  owner: orgOwerRole,
};
