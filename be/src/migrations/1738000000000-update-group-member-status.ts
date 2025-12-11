import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateGroupMemberStatus1738000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    
    
    await queryRunner.query(`
      UPDATE group_members 
      SET status = 'pending_invite' 
      WHERE status = 'pending'
    `);

    
    await queryRunner.query(`
      ALTER TABLE group_members 
      MODIFY COLUMN status ENUM('pending_invite', 'pending_approval', 'accepted', 'rejected') 
      NOT NULL DEFAULT 'accepted'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.query(`
      UPDATE group_members 
      SET status = 'pending' 
      WHERE status IN ('pending_invite', 'pending_approval')
    `);

    
    await queryRunner.query(`
      ALTER TABLE group_members 
      MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected') 
      NOT NULL DEFAULT 'accepted'
    `);
  }
}

