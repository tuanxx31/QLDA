import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveProjectManager1739000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem cột manager_id có tồn tại không
    const table = await queryRunner.getTable('projects');
    const managerColumn = table?.findColumnByName('manager_id');
    
    if (managerColumn) {
      // Tìm foreign key constraint liên quan đến manager_id
      const foreignKeys = table?.foreignKeys.filter(
        (fk) => fk.columnNames.indexOf('manager_id') !== -1,
      );
      
      // Xóa foreign key constraint nếu có
      if (foreignKeys && foreignKeys.length > 0) {
        for (const fk of foreignKeys) {
          await queryRunner.dropForeignKey('projects', fk);
        }
      }

      // Xóa cột manager_id (MySQL sẽ tự động xóa index nếu có)
      await queryRunner.dropColumn('projects', 'manager_id');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Thêm lại cột manager_id
    await queryRunner.query(`
      ALTER TABLE projects 
      ADD COLUMN manager_id varchar(36) DEFAULT NULL
    `);

    // Thêm lại index
    await queryRunner.query(`
      ALTER TABLE projects 
      ADD INDEX FK_87bd52575ded2be008b89dd7b21 (manager_id)
    `);

    // Thêm lại foreign key constraint
    await queryRunner.query(`
      ALTER TABLE projects 
      ADD CONSTRAINT FK_87bd52575ded2be008b89dd7b21 
      FOREIGN KEY (manager_id) REFERENCES users (id)
    `);
  }
}

