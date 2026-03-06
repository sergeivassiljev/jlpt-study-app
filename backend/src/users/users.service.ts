import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.avatar !== undefined) {
      user.avatar = updateDto.avatar;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}
