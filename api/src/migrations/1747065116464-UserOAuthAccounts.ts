import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserOAuthAccounts1747065116464 implements MigrationInterface {
  name = 'UserOAuthAccounts1747065116464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "UserOAuth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" character varying(50) NOT NULL, "providerId" character varying(255) NOT NULL, "providerEmail" character varying(255), "accessToken" text, "refreshToken" text, "profileData" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_5e39d79448fe4326310d9879c3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e3fdf624332d484fc109bef877" ON "UserOAuth" ("providerId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "UserOAuth" ADD CONSTRAINT "FK_70b74e3799215115ca32e40706e" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "UserOAuth" DROP CONSTRAINT "FK_70b74e3799215115ca32e40706e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e3fdf624332d484fc109bef877"`,
    );
    await queryRunner.query(`DROP TABLE "UserOAuth"`);
  }
}
