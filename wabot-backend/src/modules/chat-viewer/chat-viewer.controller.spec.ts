import { Test, TestingModule } from '@nestjs/testing';
import { ChatViewerController } from './chat-viewer.controller';

describe('ChatViewerController', () => {
  let controller: ChatViewerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatViewerController],
    }).compile();

    controller = module.get<ChatViewerController>(ChatViewerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
