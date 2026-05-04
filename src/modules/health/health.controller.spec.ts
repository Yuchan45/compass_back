import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns service health', () => {
    const health = new HealthService().check();

    expect(health.status).toBe('ok');
    expect(health.timestamp).toBeDefined();
  });
});
