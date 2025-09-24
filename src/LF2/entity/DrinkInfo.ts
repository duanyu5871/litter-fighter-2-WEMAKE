import { IDrinkInfo } from "../defines";
import { Times } from "../ui/utils/Times";

export class DrinkInfo {

  readonly hp_h_ticks: Times;
  hp_h_value: number = 0;
  hp_h_total: number = 0;
  hp_h: number = 0;

  readonly hp_r_ticks: Times;
  hp_r_total: number = 0;
  hp_r_value: number = 0;
  hp_r: number = 0;

  readonly mp_h_ticks: Times;
  mp_h_value: number = 0;
  mp_h_total: number = 0;
  mp_h: number = 0;

  constructor(info: IDrinkInfo) {
    this.hp_h_ticks = new Times(0, info.hp_h_ticks);
    this.hp_h_value = info.hp_h_value ?? 0
    this.hp_h_total = (info.hp_h_total ?? 9999999);

    this.hp_r_ticks = new Times(0, info.hp_r_ticks);
    this.hp_r_value = info.hp_r_value ?? 0
    this.hp_r_total = (info.hp_r_total ?? 9999999);

    this.mp_h_ticks = new Times(0, info.mp_h_ticks);
    this.mp_h_value = info.mp_h_value ?? 0
    this.mp_h_total = (info.mp_h_total ?? 9999999);
  }

  get hp_h_empty() {
    return this.hp_h >= this.hp_h_total || !this.hp_h_value
  }
  get hp_r_empty() {
    return this.hp_r >= this.hp_r_total || !this.hp_r_value
  }
  get mp_h_empty() {
    return this.mp_h >= this.mp_h_total || !this.mp_h_value
  }
}
