import { UserRole } from '../../../common/enums/user-role.enum';

export class AuthSessionEntity {
  token!: string;
  userId!: number;
  name!: string;
  role!: UserRole;
  expiresIn!: number;
}
