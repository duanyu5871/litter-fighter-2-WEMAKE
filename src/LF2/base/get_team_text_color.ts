export function get_team_text_color(team: any) {
  switch (team) {
    case '1': return '#4f9bff';
    case '2': return '#ff4f4f';
    case '3': return '#3cad0f';
    case '4': return '#ffd34c';
    default: return 'white';
  }
}
