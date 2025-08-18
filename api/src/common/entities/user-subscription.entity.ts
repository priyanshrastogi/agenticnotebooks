import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'UserSubscriptions' })
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ length: 50 })
  planCode: string;

  @Column({ length: 50 })
  status: string;

  @Column({ type: 'timestamp with time zone' })
  periodStart: Date;

  @Column({ type: 'timestamp with time zone' })
  periodEnd: Date;

  @Column({ length: 50, nullable: true })
  paymentProvider: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paymentAmount: number;

  @Column({ length: 3, nullable: true })
  currency: string;

  @Column({ length: 255, nullable: true })
  orderId: string;

  @Column({ length: 255, nullable: true })
  paymentId: string;

  @Column({ length: 50, nullable: true })
  paymentStatus: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  previousSubscriptionId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => UserSubscription, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'previousSubscriptionId' })
  previousSubscription: UserSubscription;
}
