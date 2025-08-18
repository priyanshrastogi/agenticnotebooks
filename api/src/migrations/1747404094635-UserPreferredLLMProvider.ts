import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPreferredLLMProvider1747404094635
  implements MigrationInterface
{
  name = 'UserPreferredLLMProvider1747404094635';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Users" ADD "preferredLLMProvider" character varying(50) NOT NULL DEFAULT 'openai'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Users" DROP COLUMN "preferredLLMProvider"`,
    );
  }
}
