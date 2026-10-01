import { persistence } from './persistence.js';

export const healthHandler = (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
};

export const readinessHandler = (req, res) => {
  const ready = persistence.status === 'READY';
  res.status(ready ? 200 : 503).json({
    status: ready ? 'READY' : 'NOT_READY',
    persistence: {
      provider: persistence.provider,
      mode: persistence.mode,
      status: persistence.status
    },
    timestamp: new Date().toISOString()
  });
};
