import { Vector2 } from "three";
import { Behavior } from "../../LF2/behavior";

export class Creature {
  pos = new Vector2(0, 0);
  name = 'Creature';
  color = 'red';
  actor = new Behavior.Actor();
  update(delta_time: number) {
    this.pos.x = Math.max(this.pos.x, 0);
    this.pos.y = Math.max(this.pos.y, 0);
    this.actor.update(delta_time);
  }
  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1;
    ctx.fillText(this.name, this.pos.x, this.pos.y);
    if (this.actor.behavior?.name) {
      ctx.font = 'bold 12px serif';
      ctx.globalAlpha = 0.5;
      ctx.fillText(this.actor.behavior?.name, this.pos.x, this.pos.y + 20);
    }
  }
}
