import { UserRole } from '../../../common/enums/user-role.enum';

export class UserEntity {
  id!: number;
  employeeNo!: string;
  name!: string;
  mobile?: string;
  email?: string;
  departmentId!: number;
  departmentName!: string;
  role!: UserRole;
  status!: number;
}
