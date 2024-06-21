import L from '@fimagine/logger';
import './LF2/dom/db'
import 'current-device';
L.Config.currentTime = () => new Date().toISOString().replaceAll(/T/g, ' ').replace('Z', '');


