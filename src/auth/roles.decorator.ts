import { SetMetadata } from '@nestjs/common';
import type { ERole } from 'src/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ERole[]) => SetMetadata(ROLES_KEY, roles);