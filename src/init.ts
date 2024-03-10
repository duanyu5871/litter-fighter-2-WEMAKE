import L from '@fimagine/logger';
L.Config.currentTime = () => new Date().toISOString().replaceAll(/T/g, ' ').replace('Z', '');

