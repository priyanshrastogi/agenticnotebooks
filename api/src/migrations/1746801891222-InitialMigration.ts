import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1746801891222 implements MigrationInterface {
  name = 'InitialMigration1746801891222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ipAddress" character varying(45), "userAgent" text, CONSTRAINT "PK_0ff5532d98863bc618809d2d401" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "UserRoles" ("userId" uuid NOT NULL, "role" character varying(50) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_62d8c731e7e55d67b1ff1ff3617" PRIMARY KEY ("userId", "role"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "passwordHash" character varying(255), "name" character varying(100), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastLogin" TIMESTAMP WITH TIME ZONE, "emailVerified" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_3c3ab3f49a87e6ddb607f3c4945" UNIQUE ("email"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "VerificationTokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "token" character varying(255) NOT NULL, "type" character varying(50) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "used" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_a7d6d198e7ecac81b03942568a5" UNIQUE ("token"), CONSTRAINT "PK_193d3292366ecec19ac7f1b2be3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Sessions" ADD CONSTRAINT "FK_582c3cb0fcddddf078b33e316d3" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserRoles" ADD CONSTRAINT "FK_a6b832f61ba4bd959c838a1953b" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" ADD CONSTRAINT "FK_c3b0a4a73959888b5e2ac5b481a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" DROP CONSTRAINT "FK_c3b0a4a73959888b5e2ac5b481a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserRoles" DROP CONSTRAINT "FK_a6b832f61ba4bd959c838a1953b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Sessions" DROP CONSTRAINT "FK_582c3cb0fcddddf078b33e316d3"`,
    );
    await queryRunner.query(`DROP TABLE "VerificationTokens"`);
    await queryRunner.query(`DROP TABLE "Users"`);
    await queryRunner.query(`DROP TABLE "UserRoles"`);
    await queryRunner.query(`DROP TABLE "Sessions"`);
  }
}
