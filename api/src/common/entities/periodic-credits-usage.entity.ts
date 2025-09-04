import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { UserSubscription } from './user-subscription.entity';

@Entity({ name: 'PeriodicCreditsUsage' })
@Index('idx_periodic_credits_user_current_plan', ['userId', 'currentPeriod', 'plan'])
export class PeriodicCreditsUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  subscriptionId: string;

  @Column('uuid')
  userId: string;

  @Column({ length: 50 })
  plan: string;

  @Column({ default: 0 })
  used: number;

  @Column()
  limit: number;

  @Column({ type: 'timestamp with time zone' })
  periodStart: Date;

  @Column({ type: 'timestamp with time zone' })
  periodEnd: Date;

  @Column({ default: true })
  currentPeriod: boolean;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => UserSubscription, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: UserSubscription;
}
