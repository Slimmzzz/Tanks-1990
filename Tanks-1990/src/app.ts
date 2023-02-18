import './style.scss';
// @ts-ignore
import main from "./controller/controller.ts";
// @ts-ignore
import { appendCssSprite } from './view/sprite.ts';

appendCssSprite();
main();
