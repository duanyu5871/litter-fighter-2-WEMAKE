import { ILayoutItem } from './ILayoutItem';

export interface ILayoutData {
  name: string;
  id: string;
  bg_color?: string;
  items: ILayoutItem[];
  key_press_actions?: [string, string][];
  enter_action?: string;
  leave_action?: string;
}
