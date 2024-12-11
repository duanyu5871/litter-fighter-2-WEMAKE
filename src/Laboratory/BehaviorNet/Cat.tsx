import { Behavior } from "../../LF2/behavior";
import { Creature } from "./Creature";

export enum CatBehaviorEnum {
  escaping_from_human = 'escaping from you',
  interested_in_human = 'interested in you',
  looking_at_human = 'looking at you',
}
export class Cat extends Creature {
  static BehaviorEnum = CatBehaviorEnum;
  human: Creature | undefined;

  constructor() {
    super();
    this.name = 'Cat';
    this.color = 'white';
    this.actor.add_behavior(
      Behavior.Noding(CatBehaviorEnum.escaping_from_human, this).on_update((cat) => this.escaping()),
      Behavior.Noding(CatBehaviorEnum.interested_in_human, this).on_update(() => this.closing()),
      Behavior.Noding(CatBehaviorEnum.looking_at_human, this),
    )
    Behavior.Connecting(this.actor)
      .start(CatBehaviorEnum.interested_in_human, 1, 2)
      .end(CatBehaviorEnum.looking_at_human)
      .judge(() => !this.is_too_close() && !this.is_too_far())
      .done();
    Behavior.Connecting(this.actor)
      .start(CatBehaviorEnum.escaping_from_human)
      .end(CatBehaviorEnum.looking_at_human)
      .judge(() => !this.is_too_close() && !this.is_too_far())
      .done();
    Behavior.Connecting(this.actor)
      .start(CatBehaviorEnum.looking_at_human)
      .end(CatBehaviorEnum.interested_in_human)
      .judge(() => this.is_too_far())
      .done();
    Behavior.Connecting(this.actor)
      .start(CatBehaviorEnum.looking_at_human)
      .end(CatBehaviorEnum.escaping_from_human)
      .judge(() => this.is_too_close())
      .done();
    this.actor.use_behavior(CatBehaviorEnum.looking_at_human)

  }

  override update(delta_time: number): void {
    super.update(delta_time);
    this.human = this.ground?.creatures.find(v => v.name === 'You');
  }

  distance_vector = () => this.pos.clone().sub(this.human?.pos || this.pos)
  direction = () => this.distance_vector().normalize();
  is_too_close = () => this.distance_vector().length() < 100;
  is_too_far = () => this.distance_vector().length() > 200;
  escaping = () => this.pos.add(this.direction())
  closing = () => this.pos.sub(this.direction())
}