import { TNextFrame } from "../defines";
import { BaseController } from "./BaseController";


export class InvalidController extends BaseController {
  readonly is_invalid_controller = true;
  static is = (v: any): v is InvalidController => v?.is_invalid_controller === true;
  override update(): TNextFrame | undefined {
    return void 0;
  }
}
