import { LimitEvaluator } from '../limit-evaluator';
import { Scope } from '@event-monitoring/shared';

describe('LimitEvaluator', () => {
  let evaluator: LimitEvaluator;
  let checker: { name: string; scope: string; check: jest.Mock };
  const now = new Date().toISOString();

  beforeEach(() => {
    checker = {
      name: 'test',
      scope: 'test',
      check: jest.fn().mockResolvedValue('LIMIT_HIT'),
    };

    evaluator = new LimitEvaluator([checker]);
  });

  describe('Evaluating events', () => {
    it('should return null if the event scope does not match any checker', async () => {
      const event = {
        userId: 1,
        scope: 'unknown.event' as Scope,
        date: now,
      };
      const result = await evaluator.evaluate(event);
      expect(result).toBeNull();
      expect(checker.check).not.toHaveBeenCalled();
    });
    it('should return the result of the checker if the event scope matches', async () => {
      const event = {
        userId: 1,
        scope: 'test' as Scope,
        date: now,
      };
      const result = await evaluator.evaluate(event);
      expect(result).toBe('LIMIT_HIT');
      expect(checker.check).toHaveBeenCalledWith(event);
    });
  });
});
