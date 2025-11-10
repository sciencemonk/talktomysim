/// <reference types="vite/client" />

import { Buffer } from 'buffer';
import type * as ProcessType from 'process';

declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: typeof ProcessType;
  }
}
