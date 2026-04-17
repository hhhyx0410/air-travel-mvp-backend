import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findMe(): Promise<Record<string, unknown>> {
    const user = await this.userRepository.findOne({
      where: { employeeNo: 'E10001' },
      relations: ['department'],
    });

    if (!user) {
      throw new NotFoundException('Default user not found. Please seed users table first.');
    }

    return {
      id: Number(user.id),
      employeeNo: user.employeeNo,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      departmentId: user.departmentId,
      departmentName: user.department?.name ?? '',
      role: user.role,
      status: user.status,
    };
  }

  async findAll(query: QueryUsersDto) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department');

    if (query.keyword) {
      queryBuilder.andWhere('(user.name LIKE :keyword OR user.employeeNo LIKE :keyword)', {
        keyword: `%${query.keyword}%`,
      });
    }

    if (query.role) {
      queryBuilder.andWhere('user.role = :role', { role: query.role });
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list: list.map((user) => ({
        id: Number(user.id),
        employeeNo: user.employeeNo,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        departmentId: user.departmentId,
        departmentName: user.department?.name ?? '',
        role: user.role,
        status: user.status,
      })),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }
}
