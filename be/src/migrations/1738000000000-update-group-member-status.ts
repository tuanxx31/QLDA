import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateGroupMemberStatus1738000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Bước 1: Migrate existing 'pending' to 'pending_invite' FIRST (before changing enum)
    // This must be done first to avoid data truncation error
    await queryRunner.query(`
      UPDATE group_members 
      SET status = 'pending_invite' 
      WHERE status = 'pending'
    `);

    // Bước 2: Update enum values in MySQL (after data migration)
    await queryRunner.query(`
      ALTER TABLE group_members 
      MODIFY COLUMN status ENUM('pending_invite', 'pending_approval', 'accepted', 'rejected') 
      NOT NULL DEFAULT 'accepted'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert 'pending_invite' and 'pending_approval' back to 'pending'
    await queryRunner.query(`
      UPDATE group_members 
      SET status = 'pending' 
      WHERE status IN ('pending_invite', 'pending_approval')
    `);

    // Revert enum to original
    await queryRunner.query(`
      ALTER TABLE group_members 
      MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected') 
      NOT NULL DEFAULT 'accepted'
    `);
  }
}

