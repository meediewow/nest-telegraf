import { Observable } from 'rxjs';

export interface CaptchaService {
  getCaptcha(getCaptchaArgs: any): Observable<Captcha>;
}

interface Captcha {
  image: string;
  answer: string;
}
