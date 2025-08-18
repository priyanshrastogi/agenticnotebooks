import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'VerificationTokens' })
export class VerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ length: 6, nullable: false })
  code: string;

  @Column({ length: 50, nullable: false })
  type: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ default: false })
  used: boolean;

  @Column({ default: 0 })
  attempts: number;

  @ManyToOne(() => User, (user) => user.verificationTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
