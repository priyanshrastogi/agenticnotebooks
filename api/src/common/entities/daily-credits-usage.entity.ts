import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'DailyCreditsUsage' })
export class DailyCreditsUsage {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn({ type: 'date' })
  date: Date;

  @Column({ default: 0 })
  used: number;

  @Column()
  limit: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
