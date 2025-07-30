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
    update: (self) => {
      if (self.entity.frame.state === StateEnum.Standing &&
        self.entity.resting <= 0) {
        self.entity.position.x = self.world.bg.width / 2;
        self.entity.position.z = (self.world.bg.near + self.world.far) / 2;
      }
    }
  },
  [DummyEnum.LockAtMid_Defend]: {
    update: (self) => {
      if (self.entity.frame.state === StateEnum.Standing &&
        self.entity.resting <= 0) {
        self.entity.position.x = self.world.bg.width / 2;
        self.entity.position.z = (self.world.bg.near + self.world.far) / 2;
      }
      self.start(GK.d);
    }
  },
  [DummyEnum.LockAtMid_RowingWhenFalling]: {
    update: (self) => {
      if (self.entity.frame.state === StateEnum.Standing &&
        self.entity.resting <= 0) {
        self.entity.position.x = self.world.bg.width / 2;
        self.entity.position.z = (self.world.bg.near + self.world.far) / 2;
      }
      if (self.entity.frame.state === StateEnum.Falling) {
        self.start(GK.j);
      }
    }
  },
  [DummyEnum.LockAtMid_JumpAndRowingWhenFalling]: {
    update: (self) => {
      if (self.entity.frame.state === StateEnum.Standing) {
        self.entity.position.x = self.world.bg.width / 2;
        self.entity.position.z = (self.world.bg.near + self.world.far) / 2;
        self.start(GK.j);
      } else if (self.entity.frame.state === StateEnum.Falling) {
        self.start(GK.j);
      } else {
        self.end(GK.j);
      }
    }
  },
  [DummyEnum.AvoidEnemyAllTheTime]: {
    update: (self) => {
      if (self.time % 10 === 0) self.update_nearest();
      self.avoid_enemy();
    }
  },
  [DummyEnum.LockAtMid_dUa]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      self[h ? "start" : "end"](GK.d, GK.U, GK.a);
    }
  },
  [DummyEnum.LockAtMid_dUj]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      self[h ? "start" : "end"](GK.d, GK.U, GK.j);
    }
  },
  [DummyEnum.LockAtMid_dDa]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      self[h ? "start" : "end"](GK.d, GK.D, GK.a);
    }
  },
  [DummyEnum.LockAtMid_dDj]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      self[h ? "start" : "end"](GK.d, GK.D, GK.j);
    }
  },
  [DummyEnum.LockAtMid_dLa]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      if (h) self.start(GK.d, GK.L, GK.a);
      else if (self.entity.frame.hit?.a) self.start(GK.a);
      else self[h ? "start" : "end"](GK.d, GK.L, GK.a);
    }
  },
  [DummyEnum.LockAtMid_dLj]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      self[h ? "start" : "end"](GK.d, GK.L, GK.j);
    }
  },
  [DummyEnum.LockAtMid_dRa]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      if (h) self.start(GK.d, GK.R, GK.a);
      else if (self.entity.frame.hit?.a) self.start(GK.a);
      else self[h ? "start" : "end"](GK.d, GK.R, GK.a);
    }
  },
  [DummyEnum.LockAtMid_dRj]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      self[h ? "start" : "end"](GK.d, GK.R, GK.j);
    }
  },
  [DummyEnum.LockAtMid_dja]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      self[h ? "start" : "end"](GK.d, GK.j, GK.a);
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
  update(self: BotController): void
}