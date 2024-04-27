export const get_team_shadow_color = (team: any) => {
  switch (team) {
    case 1: return 'blue';
    case 2: return 'red';
    case 3: return 'green';
    case 4: return 'yellow';
    default: return 'black';
  }
};
