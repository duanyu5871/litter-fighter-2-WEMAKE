import L from '@fimagine/logger';
import 'current-device';
L.Config.currentTime = () => new Date().toISOString().replaceAll(/T/g, ' ').replace('Z', '');


