export class KeyStatus {
  time: number = 0;
  hit(t: number) { this.time = t; }
  end() { this.time = 0; }
}
