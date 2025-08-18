import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthorisationTokens1747891356624 implements MigrationInterface {
  name = 'AuthorisationTokens1747891356624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "AuthorizationTokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "token" character varying(255) NOT NULL, "clientId" character varying(100) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1d85de188feb9ba9c84f7a47b05" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f8c4f4a1212024f6174c17354a" ON "AuthorizationTokens" ("token", "used") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f8c4f4a1212024f6174c17354a"`,
    );
    await queryRunner.query(`DROP TABLE "AuthorizationTokens"`);
  }
}
