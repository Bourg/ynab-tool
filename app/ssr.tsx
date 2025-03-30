import './server/config.server';
import { getRouterManifest } from '@tanstack/react-start/router-manifest';
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';

import { createRouter } from './router';

const startHandler = createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler);

export default startHandler;
