export const get_team_shadow_color = (team: any) => {
  switch (team) {
    case '1': return '#001e46';
    case '2': return '#460000';
    case '3': return '#154103';
    case '4': return '#9a5700';
    default: return 'black';
  }
};
