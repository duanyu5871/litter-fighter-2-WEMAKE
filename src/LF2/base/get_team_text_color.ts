export function get_team_text_color(team: any) {
  switch (team) {
    case 1: return '#CCCCFF';
    case 2: return '#FFCCCC';
    case 3: return '#CCFFCC';
    case 4: return '#FFFFCC';
    default: return 'white';
  }
}
