import { IStageInfo, IStageObjectInfo, IStagePhaseInfo } from '../lf2_type';
import { match_colon_value } from '../match_colon_value';
import { match_hash_end } from '../match_hash_end';
import { take_blocks } from '../take_blocks';
import { to_num } from '../to_num';

export function data_to_stage_jsons(full_str: string): IStageInfo[] | void {
  full_str = full_str.replace(/<phase_end>[\n|\s|\r]*<stage>/g, '<phase_end><stage_end><stage>');
  const stage_infos: IStageInfo[] = [];
  for (let stage_str of take_blocks(full_str, '<stage>', '<stage_end>', v => full_str = v)) {
    const stage_info: IStageInfo = {
      bg: '0',
      id: '',
      name: '',
      phases: []
    }
    for (let phase_str of take_blocks(stage_str, '<phase>', '<phase_end>', v => stage_str = v)) {
      const phase_info: IStagePhaseInfo = {
        bound: 0,
        desc: '',
        objects: []
      }
      for (let line of phase_str.trim().split('\n')) {
        line = line.trim();
        if (!line) continue;
        if (line.startsWith('bound')) {
          for (const [key, value] of match_colon_value(line)) {
            if (key === 'bound') phase_info.bound = to_num(value, phase_info.bound);
            if (key === 'music') phase_info.music = value + '.ogg';
          }
          phase_info.desc = match_hash_end(line)?.trim() ?? '';

        } else if (line.startsWith('id')) {
          const object: IStageObjectInfo = {
            id: [],
            x: 0,
          }
          if (line.indexOf('<soldier>') >= 0) object.is_soldier = true;
          if (line.indexOf('<boss>') >= 0) object.is_boss = true;
          for (const [key, value] of match_colon_value(line)) {
            if (key === 'id') object.id = [value];
            else if (key === 'act') object.act = value;
            else (object as any)[key] = to_num(value, (object as any)[key])
          }
          phase_info.objects.push(object)
        }
      }
      stage_info.phases.push(phase_info)
    }
    const head = stage_str.replace(/\s+\n+/g, '\n').trim();
    for (const [key, value] of match_colon_value(head)) {
      (stage_info as any)[key] = value;
    }
    stage_info.name = match_hash_end(head) ?? stage_info.id;
    const nid = Number(stage_info.id);
    if (nid <= 4) {
      stage_info.bg = '2';
      if (nid < 4) stage_info.next = '' + (nid + 1)
    }
    else if (nid <= 14) {
      stage_info.bg = '3';
      if (nid < 14) stage_info.next = '' + (nid + 1)
    }
    else if (nid <= 24) {
      stage_info.bg = '5';
      if (nid < 24) stage_info.next = '' + (nid + 1)
    }
    else if (nid <= 34) {
      stage_info.bg = '6';
      if (nid < 34) stage_info.next = '' + (nid + 1)
    }
    else if (nid <= 44) {
      stage_info.bg = '7';
      if (nid < 44) stage_info.next = '' + (nid + 1)
    } else {
      stage_info.bg = '8';
    }
    stage_infos.push(stage_info);
  }

  return stage_infos.sort((a, b) => Number(a.id) - Number(b.id));
}
