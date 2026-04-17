import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'departments' })
export class DepartmentEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: true })
  parentId?: number | null;

  @ManyToOne(() => DepartmentEntity, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: DepartmentEntity | null;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
