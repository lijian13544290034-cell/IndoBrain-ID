// Registers the 'server-only' stub hook for Task B offline verification.
import { register } from 'node:module';
register(new URL('./taskb-hook.mjs', import.meta.url));
