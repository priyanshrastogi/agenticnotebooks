import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConversationAndMessages1747162365747
  implements MigrationInterface
{
  name = 'ConversationAndMessages1747162365747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ConversationMessages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversationId" uuid NOT NULL, "role" character varying NOT NULL, "content" text NOT NULL, "inputTokens" integer NOT NULL DEFAULT '0', "outputTokens" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "metadata" jsonb, CONSTRAINT "PK_c0e9b3e764013adae33e97452b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastMessageAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "metadata" jsonb, CONSTRAINT "PK_44f6c6ade92598cd70087acf2a1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ConversationMessages" ADD CONSTRAINT "FK_df2fb44d16c5e8b2d89738598b9" FOREIGN KEY ("conversationId") REFERENCES "Conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Conversations" ADD CONSTRAINT "FK_d2ef5dea60a365c3d39a2bf606a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Conversations" DROP CONSTRAINT "FK_d2ef5dea60a365c3d39a2bf606a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ConversationMessages" DROP CONSTRAINT "FK_df2fb44d16c5e8b2d89738598b9"`,
    );
    await queryRunner.query(`DROP TABLE "Conversations"`);
    await queryRunner.query(`DROP TABLE "ConversationMessages"`);
  }
}
