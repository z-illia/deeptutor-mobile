// Read bundled package metadata directly; no Node runtime globals or filesystem access.
import { version } from 'mathjax-full/package.json';
export const VERSION = version;
