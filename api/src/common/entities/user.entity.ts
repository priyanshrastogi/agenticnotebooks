import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Session } from './session.entity';
import { UserOAuth } from './user-oauth.entity';
import { UserRole } from './user-role.entity';
import { VerificationToken } from './verification-token.entity';

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true, nullable: false })
  email: string;

  @Column({ length: 255, nullable: true })
  passwordHash: string;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ length: 50, nullable: true })
  source: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLogin: Date;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ length: 50, default: 'free' })
  activePlan: string;

  @Column({ length: 50, default: 'openai' })
  preferredLLMProvider: string;

  @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true })
  roles: UserRole[];

  @OneToMany(() => VerificationToken, (token) => token.user, { cascade: true })
  verificationTokens: VerificationToken[];

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions: Session[];

  @OneToMany(() => UserOAuth, (oauth) => oauth.user, { cascade: true })
  oauthConnections: UserOAuth[];
}
