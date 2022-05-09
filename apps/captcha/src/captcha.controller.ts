import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Captcha } from './captcha.interfaces';
import { CaptchaService } from './captcha.service';

@Controller()
export class CaptchaController {
  constructor(private captchaService: CaptchaService) {}

  @GrpcMethod('CaptchaService', 'getCaptcha')
  getCaptcha(): Captcha {
    return this.captchaService.getCaptcha();
  }
}
