import { GameKey as GK } from "../defines";
import { StateEnum } from "../defines/StateEnum";
import { BotController } from "./BotController";
export enum DummyEnum {
  LockAtMid_Stand = "1",
  LockAtMid_Defend = "2",
  LockAtMid_RowingWhenFalling = "3",
  LockAtMid_JumpAndRowingWhenFalling = "4",
  AvoidEnemyAllTheTime = "5",
  LockAtMid_dUa = "6",
  LockAtMid_dUj = "7",
  LockAtMid_dDa = "8",
  LockAtMid_dDj = "9",
  LockAtMid_dLa = "10",
  LockAtMid_dLj = "11",
  LockAtMid_dRa = "12",
  LockAtMid_dRj = "13",
  LockAtMid_dja = "14",
  LockAtMid_dUa_auto = "15",
  LockAtMid_dUj_auto = "16",
  LockAtMid_dDa_auto = "17",
  LockAtMid_dDj_auto = "18",
  LockAtMid_dLa_auto = "18",
  LockAtMid_dLj_auto = "19",
  LockAtMid_dRa_auto = "20",
  LockAtMid_dRj_auto = "21",
  LockAtMid_dja_auto = "22"
}
export const dummy_updaters: Record<DummyEnum, IDummyUpdater | undefined> = {
  [DummyEnum.LockAtMid_Stand]: {
    update(_this) {
      if (_this.entity.frame.state === StateEnum.Standing &&
        _this.entity.resting <= 0) {
        _this.entity.position.x = _this.world.bg.width / 2;
        _this.entity.position.z = (_this.world.bg.near + _this.world.far) / 2;
      }
    }
  },
  [DummyEnum.LockAtMid_Defend]: {
    update(_this) {
      if (_this.entity.frame.state === StateEnum.Standing &&
        _this.entity.resting <= 0) {
        _this.entity.position.x = _this.world.bg.width / 2;
        _this.entity.position.z = (this.world.bg.near + _this.world.far) / 2;
      }
      _this.start(GK.d);
    }
  },
  [DummyEnum.LockAtMid_RowingWhenFalling]: {
    update(_this) {
      if (_this.entity.frame.state === StateEnum.Standing &&
        _this.entity.resting <= 0) {
        _this.entity.position.x = _this.world.bg.width / 2;
        _this.entity.position.z = (this.world.bg.near + _this.world.far) / 2;
      }
      if (this.entity.frame.state === StateEnum.Falling) {
        _this.start(GK.j);
      }
    }
  },
  [DummyEnum.LockAtMid_JumpAndRowingWhenFalling]: {
    update(_this) {
      if (this.entity.frame.state === StateEnum.Standing) {
        _this.entity.position.x = _this.world.bg.width / 2;
        _this.entity.position.z = (this.world.bg.near + _this.world.far) / 2;
        _this.start(GK.j);
      } else if (this.entity.frame.state === StateEnum.Falling) {
        _this.start(GK.j);
      } else {
        _this.end(GK.j);
      }
    }
  },
  [DummyEnum.AvoidEnemyAllTheTime]: {
    update(_this) {
      if (this.time % 10 === 0) _this.update_nearest();
      _this.avoid_enemy();
    }
  },
  [DummyEnum.LockAtMid_dUa]: {
    update(_this) {
      const h = _this.lock_when_stand_and_rest();
      _this[h ? "start" : "end"](GK.d, GK.U, GK.a);
    }
  },
  [DummyEnum.LockAtMid_dUj]: {
    update(_this) {
      const h = _this.lock_when_stand_and_rest();
      _this[h ? "start" : "end"](GK.d, GK.U, GK.j);
    }
  },
  [DummyEnum.LockAtMid_dDa]: {
    update(_this) {
      const h = _this.lock_when_stand_and_rest();
      _this[h ? "start" : "end"](GK.d, GK.D, GK.a);
    }
  },
  [DummyEnum.LockAtMid_dDj]: {
    update(_this) {
      const h = _this.lock_when_stand_and_rest();
      _this[h ? "start" : "end"](GK.d, GK.D, GK.j);
    }
  },
  [DummyEnum.LockAtMid_dLa]: {
    update(_this) {
      const h = _this.lock_when_stand_and_rest();
      if (h) _this.start(GK.d, GK.L, GK.a);
      else if (this.entity.frame.hit?.a) _this.start(GK.a);
      else _this[h ? "start" : "end"](GK.d, GK.L, GK.a);
    }
  },
  [DummyEnum.LockAtMid_dLj]: {
    update(_this) {
      const h = _this.lock_when_stand_and_rest();
      _this[h ? "start" : "end"](GK.d, GK.L, GK.j);
    }
  },
  [DummyEnum.LockAtMid_dRa]: {
    update(_this) {
      const h = _this.lock_when_stand_and_rest();
      if (h) _this.start(GK.d, GK.R, GK.a);
      else if (this.entity.frame.hit?.a) _this.start(GK.a);
      else _this[h ? "start" : "end"](GK.d, GK.R, GK.a);
    }
  },
  [DummyEnum.LockAtMid_dRj]: {
    update(_this) {
      const h = _this.lock_when_stand_and_rest();
      _this[h ? "start" : "end"](GK.d, GK.R, GK.j);
    }
  },
  [DummyEnum.LockAtMid_dja]: {
    update(_this) {
      const h = _this.lock_when_stand_and_rest();
      _this[h ? "start" : "end"](GK.d, GK.j, GK.a);
    }
  },
  [DummyEnum.LockAtMid_dUa_auto]: undefined,
  [DummyEnum.LockAtMid_dUj_auto]: undefined,
  [DummyEnum.LockAtMid_dDa_auto]: undefined,
  [DummyEnum.LockAtMid_dDj_auto]: undefined,
  [DummyEnum.LockAtMid_dLj_auto]: undefined,
  [DummyEnum.LockAtMid_dRa_auto]: undefined,
  [DummyEnum.LockAtMid_dRj_auto]: undefined,
  [DummyEnum.LockAtMid_dja_auto]: undefined
}
export interface IDummyUpdater {
  update(_this: BotController): void
}