type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g';

const ROOT_MARGIN_BY_SPEED: Record<EffectiveType, string> = {
  'slow-2g': '1200px',
  '2g':      '800px',
  '3g':      '600px',
  '4g':      '300px',
};

const DEFAULT_ROOT_MARGIN = '400px';

export function useNetworkSpeed(): string {
  const conn = (
    navigator as unknown as { connection?: { effectiveType?: EffectiveType } }
  ).connection;
  const effectiveType = conn?.effectiveType;
  if (!effectiveType || !(effectiveType in ROOT_MARGIN_BY_SPEED)) {
    return DEFAULT_ROOT_MARGIN;
  }
  return ROOT_MARGIN_BY_SPEED[effectiveType];
}
