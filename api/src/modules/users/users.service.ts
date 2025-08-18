import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from '@/common/entities/user.entity';

import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserDetails(userId: string): Promise<UserResponseDto> {
    const user = await this.getUserById(userId);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      active: user.active,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }

  async updateUserProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.getUserById(userId);

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    const updatedUser = await this.userRepository.save(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      emailVerified: updatedUser.emailVerified,
      active: updatedUser.active,
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin,
    };
  }

  async updateUserPassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<boolean> {
    const user = await this.getUserById(userId);

    // Verify current password
    const isPasswordValid = await this.comparePasswords(
      updatePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    user.passwordHash = await this.hashPassword(updatePasswordDto.newPassword);
    await this.userRepository.save(user);

    return true;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getPreferredLLMProvider(userId: string): Promise<string> {
    const user = await this.getUserById(userId);
    return user.preferredLLMProvider;
  }
}
