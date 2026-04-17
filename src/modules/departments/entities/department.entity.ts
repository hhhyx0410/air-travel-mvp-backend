export class DepartmentEntity {
  id!: number;
  name!: string;
  code!: string;
  parentId?: number | null;
  status!: number;
}
