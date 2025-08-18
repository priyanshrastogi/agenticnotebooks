import { MigrationInterface, QueryRunner } from 'typeorm';

export class VerificationTokenToCode1746903837222
  implements MigrationInterface
{
  name = 'VerificationTokenToCode1746903837222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" DROP CONSTRAINT "UQ_a7d6d198e7ecac81b03942568a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" DROP COLUMN "token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" ADD "code" character varying(6) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" ADD "attempts" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" DROP COLUMN "attempts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" DROP COLUMN "code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" ADD "token" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationTokens" ADD CONSTRAINT "UQ_a7d6d198e7ecac81b03942568a5" UNIQUE ("token")`,
    );
  }
}
