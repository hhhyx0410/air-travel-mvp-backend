import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';
import { DepartmentEntity } from '../../departments/entities/department.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  openid?: string | null;

  @Column({ name: 'employee_no', type: 'varchar', length: 50 })
  employeeNo!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string | null;

  @Column({ name: 'department_id', type: 'bigint', unsigned: true, nullable: true })
  departmentId!: number | null;

  @ManyToOne(() => DepartmentEntity, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: DepartmentEntity | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role!: UserRole;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
