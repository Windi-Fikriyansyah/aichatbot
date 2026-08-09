import { Test, TestingModule } from '@nestjs/testing';
import { OpenrouterController } from './openrouter.controller';

describe('OpenrouterController', () => {
  let controller: OpenrouterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenrouterController],
    }).compile();

    controller = module.get<OpenrouterController>(OpenrouterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
