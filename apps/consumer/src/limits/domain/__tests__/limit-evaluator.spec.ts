import { LimitEvaluator } from '../services/limit-evaluator';

describe('LimitEvaluator', () => {
  it('delegates to the checker that matches the event scope', async () => {
    const userChecker = {
      name: 'user',
      scope: 'user',
      check: jest.fn().mockResolvedValue('LIMIT_HIT'),
    };

    const evaluator = new LimitEvaluator([userChecker]);

    const result = await evaluator.evaluate({
      userId: 1,
      scope: 'user.delete',
      date: new Date().toISOString(),
    });

    expect(result).toBe('LIMIT_HIT');
    expect(userChecker.check).toHaveBeenCalledTimes(1);
  });
});
