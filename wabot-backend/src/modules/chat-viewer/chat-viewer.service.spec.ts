import { Test, TestingModule } from '@nestjs/testing';
import { ChatViewerService } from './chat-viewer.service';

describe('ChatViewerService', () => {
  let service: ChatViewerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatViewerService],
    }).compile();

    service = module.get<ChatViewerService>(ChatViewerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
