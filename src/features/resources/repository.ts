import { mobileHref } from '../mobile/routes';
import rows from './source-tiles.json';
// Navigation metadata only. Resource counters are read from the API.
export const resourceRoutes = rows.map(row => mobileHref(row.href));
