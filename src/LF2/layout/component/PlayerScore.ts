import { LayoutComponent } from "./LayoutComponent";

export default class PlayerScore extends LayoutComponent {
  get player_id(): string { return this.args[0] || ''; }
}