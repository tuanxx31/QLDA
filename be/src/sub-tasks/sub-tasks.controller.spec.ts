import { Test, TestingModule } from '@nestjs/testing';
import { SubTasksController } from './sub-tasks.controller';
import { SubTasksService } from './sub-tasks.service';

describe('SubTasksController', () => {
  let controller: SubTasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubTasksController],
      providers: [SubTasksService],
    }).compile();

    controller = module.get<SubTasksController>(SubTasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
