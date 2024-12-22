import { new_team } from "../../base";
import { Defines } from "../../defines";
import { Factory } from "../../entity/Factory";
import IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_character } from "../../entity/type_check";
import { random_get, random_in, random_take } from "../../utils/math/random";
import { LayoutComponent } from "./LayoutComponent";


export class DemoModeLogic extends LayoutComponent implements IEntityCallbacks {
  override on_start(): void {
    super.on_start?.();

    const bg_data = random_get(this.lf2.datas.backgrounds);
    if (bg_data) this.lf2.change_bg(bg_data);

    const character_datas = this.lf2.datas.get_characters_of_group(Defines.EntityGroup.Regular)
    const player_count = Math.floor(random_in(2, 8))
    const player_teams: string[] = [];

    for (let i = 0; i < player_count; i++) {
      player_teams.push(new_team())
    }
    switch (player_count) {
      case 4: {
        if (random_take([0, 1])) {
          player_teams.fill(Defines.TeamEnum.Team_1, 0, 2)
          player_teams.fill(Defines.TeamEnum.Team_2, 2, 4)
        }
        break;
      }
      case 6: {
        switch (random_take([0, 1, 2])) {
          case 1: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 3)
            player_teams.fill(Defines.TeamEnum.Team_2, 3, 6)
            break;
          }
          case 2: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 2)
            player_teams.fill(Defines.TeamEnum.Team_2, 2, 4)
            player_teams.fill(Defines.TeamEnum.Team_3, 4, 6)
            break;
          }
        }
        break;
      }
      case 8: {
        switch (random_take([0, 1, 2])) {
          case 1: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 4)
            player_teams.fill(Defines.TeamEnum.Team_2, 4, 8)
            break;
          }
          case 2: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 2)
            player_teams.fill(Defines.TeamEnum.Team_2, 2, 4)
            player_teams.fill(Defines.TeamEnum.Team_3, 4, 6)
            player_teams.fill(Defines.TeamEnum.Team_4, 6, 8)
            break;
          }
        }
        break;
      }
    }
    const player_infos = Array.from(this.lf2.player_infos.values())
    for (let i = 0; i < player_count; i++) {
      const player = player_infos[i]!
      if (!player) continue;

      const character_data = random_take(character_datas)
      if (!character_data) continue;

      const creator = Factory.inst.get_entity_creator(character_data.type)
      if (!creator) return;

      const character = creator(this.world, character_data);
      character.name = 'com';
      character.team = player_teams.shift() ?? new_team()
      character.facing = Math.random() < 0.5 ? 1 : -1
      character.callbacks.add(this);

      const { far, near, left, right } = this.lf2.world.bg;

      character.controller = Factory.inst.get_ctrl_creator(character_data.id)?.(player.id, character)
      character.position.z = random_in(far, near);
      character.position.x = random_in(left, right);
      character.blinking = 120;
      character.attach();

    }

  }
  override on_stop(): void {
    super.on_stop?.();
    for (const [, v] of this.lf2.player_characters) {
      v.callbacks.del(this);
    }
  }

  on_dead() {
    const team_alives = new Map<string, number>();
    for (const e of this.world.entities) {
      if (!is_character(e) || e.hp < 0) continue;
      const { team } = e;
      const count = team_alives.get(team);
      if (count && count > 1) return;
      team_alives.set(team, (count || 0) + 1);
    }
    if (team_alives.size > 1) return;
    const i = team_alives.get('') || 0;
    if (i > 1) return;
    this.lf2.sounds.play_preset('end');
    const score_board = this.layout.find_layout('score_board');
    if (score_board) score_board.visible = true;
  }

  override on_show(): void {
  }
}
