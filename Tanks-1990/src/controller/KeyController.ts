// @ts-ignore
import { KeyCallbackMap } from "../interfaces.ts";


export class KeyController {
  timers: {[key: string | number]: number | null}
  keys: KeyCallbackMap
  repeat: number = 16
  lastPressedKey: string | undefined

  constructor(keyCallbackMap: KeyCallbackMap, repeat = 16) {
    this.timers = {};
    this.keys = keyCallbackMap;
    this.repeat = repeat;
    document.onkeydown = ({ key }) => {
      if (!(key in this.keys)) {
        return true;
      }

      if (this.lastPressedKey !== key) {
        for (const key in this.timers) {
          if (this.timers[key] !== null) {
            clearInterval(this.timers[key]!);
          }
        }
      }

      this.lastPressedKey = key;

      if (!(key in this.timers)) {
        this.timers[key] = null;
        this.keys[key]();
        if (this.repeat) {
          this.timers[key] = setInterval(this.keys[key], this.repeat);
        }
      }
      return false;
    }
    document.onkeyup = ({ key }) => {
      if (key in this.timers) {
        if (this.timers[key] !== null) {
          clearInterval(this.timers[key]!);
        }
        delete this.timers[key]
      }
    }
    window.onblur = () => {
      for (const key in this.timers) {
        if (this.timers[key] !== null) {
          clearInterval(this.timers[key]!);
        }
      }
      this.timers = {};
    }
  }

  destroy() {
    for (const key in this.timers) {
      if (this.timers[key] !== null) {
        clearInterval(this.timers[key]!);
      }
    }
    this.timers = {};
  }
}

