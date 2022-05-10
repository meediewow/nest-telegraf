import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CaptchaService } from './captcha.service';
import axios from 'axios';
import { Captcha, CaptchaServiceController } from '@app/protobufs';

@Controller()
export class CaptchaController implements CaptchaServiceController {
  constructor(private captchaService: CaptchaService) {}

  @GrpcMethod('CaptchaService', 'getCaptcha')
  getCaptcha(): Captcha {
    return this.captchaService.getCaptcha();
  }

  @GrpcMethod('CaptchaService', 'getData')
  async getData() {
    return (await axios.get('https://catfact.ninja/fact')).data;
  }
}
