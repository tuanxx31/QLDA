import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveProjectManager1739000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    
    const table = await queryRunner.getTable('projects');
    const managerColumn = table?.findColumnByName('manager_id');
    
    if (managerColumn) {
      
      const foreignKeys = table?.foreignKeys.filter(
        (fk) => fk.columnNames.indexOf('manager_id') !== -1,
      );
      
      
      if (foreignKeys && foreignKeys.length > 0) {
        for (const fk of foreignKeys) {
          await queryRunner.dropForeignKey('projects', fk);
        }
      }

      
      await queryRunner.dropColumn('projects', 'manager_id');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.query(`
      ALTER TABLE projects 
      ADD COLUMN manager_id varchar(36) DEFAULT NULL
    `);

    
    await queryRunner.query(`
      ALTER TABLE projects 
      ADD INDEX FK_87bd52575ded2be008b89dd7b21 (manager_id)
    `);

    
    await queryRunner.query(`
      ALTER TABLE projects 
      ADD CONSTRAINT FK_87bd52575ded2be008b89dd7b21 
      FOREIGN KEY (manager_id) REFERENCES users (id)
    `);
  }
}

