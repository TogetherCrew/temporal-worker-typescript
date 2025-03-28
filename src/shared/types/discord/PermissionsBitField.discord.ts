// PermissionsBitField
export interface PermissionsBitField {
  bitfield?: number
  allPermissions?: number
  defaultPermissions?: number
  permissionFlags?: Record<string, boolean>
  stageModerator?: number
}