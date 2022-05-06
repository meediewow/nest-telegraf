import { Test, TestingModule } from '@nestjs/testing';
import { FirstServiceController } from './first-service.controller';
import { FirstServiceService } from './first-service.service';

describe('FirstServiceController', () => {
  let firstServiceController: FirstServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FirstServiceController],
      providers: [FirstServiceService],
    }).compile();

    firstServiceController = app.get<FirstServiceController>(
      FirstServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(firstServiceController.hello()).toBe('Hello World!');
    });
  });
});
