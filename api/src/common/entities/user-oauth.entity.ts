import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

export enum OAuthProvider {
  GOOGLE = 'google',
  // Add more providers in the future (github, facebook, etc.)
}

@Entity({ name: 'UserOAuth' })
export class UserOAuth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, nullable: false })
  provider: string;

  @Index()
  @Column({ length: 255, nullable: false })
  providerId: string;

  @Column({ length: 255, nullable: true })
  providerEmail: string;

  @Column({ type: 'text', nullable: true })
  accessToken: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'jsonb', nullable: true })
  profileData: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // User relationship
  @ManyToOne(() => User, (user) => user.oauthConnections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: string;
}
