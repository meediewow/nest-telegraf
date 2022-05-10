/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import * as Long from 'long';
import * as _m0 from 'protobufjs/minimal';
import { Observable } from 'rxjs';

export const protobufPackage = 'captcha';

export interface CaptchaArgs {}

export interface Captcha {
  image: string;
  answer: string;
}

export const CAPTCHA_PACKAGE_NAME = 'captcha';

export interface CaptchaServiceClient {
  getCaptcha(request: CaptchaArgs): Observable<Captcha>;
}

export interface CaptchaServiceController {
  getCaptcha(
    request: CaptchaArgs,
  ): Promise<Captcha> | Observable<Captcha> | Captcha;
}

export function CaptchaServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['getCaptcha'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('CaptchaService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod('CaptchaService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const CAPTCHA_SERVICE_NAME = 'CaptchaService';

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
