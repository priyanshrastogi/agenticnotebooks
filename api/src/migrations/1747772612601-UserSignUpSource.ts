import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserSignUpSource1747772612601 implements MigrationInterface {
  name = 'UserSignUpSource1747772612601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Users" ADD "source" character varying(50)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "source"`);
  }
}
