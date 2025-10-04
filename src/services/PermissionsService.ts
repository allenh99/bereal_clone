import { AuthService, UserRecord } from './AuthService';
import { ProfileService } from './ProfileService';

export type AppPermission = 'capture' | 'view_all' | 'manage_users';

export class PermissionsService {
  static async can(permission: AppPermission, user?: UserRecord | null): Promise<boolean> {
    const u = user ?? (await AuthService.getCurrentUser());
    return ProfileService.canUser(permission, u);
  }
}



