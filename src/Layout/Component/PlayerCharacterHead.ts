import { LayoutComponent } from "./LayoutComponent";


/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class PlayerCharacterHead
 * @typedef {PlayerCharacterHead}
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterHead extends LayoutComponent {
  init(...args: string[]): this {
    console.log(PlayerCharacterHead.name, ...args)
    return this;
  }
  on_mount(): void {
    console.log(PlayerCharacterHead.name, 'on_mount')
  }
  on_unmount(): void {
    console.log(PlayerCharacterHead.name, 'on_unmount')
  }
}