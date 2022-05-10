import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CaptchaService } from './captcha.service';
import { CaptchaServiceController, CAPTCHA_SERVICE_NAME } from '@app/protobufs';

@Controller()
export class CaptchaController implements CaptchaServiceController {
  constructor(private captchaService: CaptchaService) {}

  @GrpcMethod(CAPTCHA_SERVICE_NAME, 'getCaptcha')
  getCaptcha() {
    return this.captchaService.getCaptcha();
  }
}
