import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsageAndSubscription1747331195012 implements MigrationInterface {
  name = 'UsageAndSubscription1747331195012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "UserSubscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "planCode" character varying(50) NOT NULL, "status" character varying(50) NOT NULL, "periodStart" TIMESTAMP WITH TIME ZONE NOT NULL, "periodEnd" TIMESTAMP WITH TIME ZONE NOT NULL, "paymentProvider" character varying(50), "paymentAmount" numeric(10,2), "currency" character varying(3), "orderId" character varying(255), "paymentId" character varying(255), "paymentStatus" character varying(50), "metadata" jsonb, "previousSubscriptionId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_56cefb632fb2c3e9e691137ae8f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "PeriodicCreditsUsage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subscriptionId" uuid, "userId" uuid NOT NULL, "plan" character varying(50) NOT NULL, "used" integer NOT NULL DEFAULT '0', "limit" integer NOT NULL, "periodStart" TIMESTAMP WITH TIME ZONE NOT NULL, "periodEnd" TIMESTAMP WITH TIME ZONE NOT NULL, "currentPeriod" boolean NOT NULL DEFAULT true, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f8c7ee21988aa69d4e10b217d99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_periodic_credits_user_current_plan" ON "PeriodicCreditsUsage" ("userId", "currentPeriod", "plan") `,
    );
    await queryRunner.query(
      `CREATE TABLE "DailyCreditsUsage" ("userId" uuid NOT NULL, "date" date NOT NULL, "used" integer NOT NULL DEFAULT '0', "limit" integer NOT NULL, CONSTRAINT "PK_c43268ca7fa69fbe65780d0f58b" PRIMARY KEY ("userId", "date"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Users" ADD "activePlan" character varying(50) NOT NULL DEFAULT 'free'`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserSubscriptions" ADD CONSTRAINT "FK_d591f708b32c7e119e868be2a23" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserSubscriptions" ADD CONSTRAINT "FK_c71a250b9f97992c4809985328e" FOREIGN KEY ("previousSubscriptionId") REFERENCES "UserSubscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PeriodicCreditsUsage" ADD CONSTRAINT "FK_451d1e7ffa6239b8721961fe168" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PeriodicCreditsUsage" ADD CONSTRAINT "FK_8ed4d563c13001f67a5f4e47dfd" FOREIGN KEY ("subscriptionId") REFERENCES "UserSubscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "DailyCreditsUsage" ADD CONSTRAINT "FK_ffd31aac7906e0f91f5fa2b151c" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "DailyCreditsUsage" DROP CONSTRAINT "FK_ffd31aac7906e0f91f5fa2b151c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PeriodicCreditsUsage" DROP CONSTRAINT "FK_8ed4d563c13001f67a5f4e47dfd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PeriodicCreditsUsage" DROP CONSTRAINT "FK_451d1e7ffa6239b8721961fe168"`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserSubscriptions" DROP CONSTRAINT "FK_c71a250b9f97992c4809985328e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserSubscriptions" DROP CONSTRAINT "FK_d591f708b32c7e119e868be2a23"`,
    );
    await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "activePlan"`);
    await queryRunner.query(`DROP TABLE "DailyCreditsUsage"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_periodic_credits_user_current_plan"`,
    );
    await queryRunner.query(`DROP TABLE "PeriodicCreditsUsage"`);
    await queryRunner.query(`DROP TABLE "UserSubscriptions"`);
  }
}
