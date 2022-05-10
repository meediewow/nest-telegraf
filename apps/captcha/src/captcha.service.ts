import { Captcha } from '@app/protobufs';
import { Injectable } from '@nestjs/common';
import * as canvas from 'canvas';
import { getRandomInt, parseExpression } from './utils/number.utils';

const OPERATIONS: Array<'+' | '-'> = ['+', '-'];
const WIDTH = 200;
const HEIGHT = 70;
const LINES_COUNT = 20;
const FONTS = ['Georgia', 'Helvetica Neue', 'Helvetica', 'Arial'];

@Injectable()
export class CaptchaService {
  getCaptcha(): Captcha {
    const canv = canvas.createCanvas(WIDTH, HEIGHT);
    const firstNumber = getRandomInt(0, 100);
    const secondNumber = getRandomInt(0, 100);
    const operation = OPERATIONS[getRandomInt(0, OPERATIONS.length - 1)];

    const data = parseExpression(firstNumber, secondNumber, operation);
    const ctx = canv.getContext('2d');
    ctx.font = `35px ${FONTS[getRandomInt(0, FONTS.length - 1)]}`;
    ctx.strokeText(data.text, 45, 40);

    for (let i = 0; i < LINES_COUNT; i++) {
      ctx.strokeStyle = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      ctx.lineWidth = getRandomInt(0, 3);
      ctx.globalAlpha = Math.random();
      ctx.beginPath();
      ctx.moveTo(Math.random() * WIDTH, Math.random() * HEIGHT);
      ctx.lineTo(Math.random() * WIDTH, Math.random() * HEIGHT);
      ctx.stroke();
    }

    return {
      image: canv.toDataURL(),
      answer: String(data.result),
    };
  }
}
