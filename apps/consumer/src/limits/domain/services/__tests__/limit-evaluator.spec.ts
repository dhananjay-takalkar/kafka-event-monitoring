import { EventMsg } from '@event-monitoring/shared';
import type { LimitChecker } from '../../limit-checkers';
import { LimitEvaluator } from '../limit-evaluator';

describe('LimitEvaluator', () => {
  const buildChecker = (
    name: string,
    check: LimitChecker['check'],
  ): LimitChecker => ({
    name,
    scope: name,
    check,
  });

  const sampleEvent = (scope: EventMsg['scope']): EventMsg => ({
    userId: 1,
    scope,
    date: new Date().toISOString(),
  });

  it('returns null when no checker matches the event scope root', async () => {
    const evaluator = new LimitEvaluator([
      buildChecker('user', () => '3_USER_DELETIONS'),
    ]);
    const result = await evaluator.evaluate(sampleEvent('payment.create'));
    expect(result).toBeNull();
  });

  it('delegates to the matching checker based on scope root', async () => {
    const evaluateSpy = jest.fn().mockResolvedValue('TOP_SECRET_READ');
    const evaluator = new LimitEvaluator([
      buildChecker('top-secret', evaluateSpy),
    ]);

    const event = sampleEvent('top-secret.read');
    const result = await evaluator.evaluate(event);

    expect(evaluateSpy).toHaveBeenCalledWith(event);
    expect(result).toEqual('TOP_SECRET_READ');
  });

  it('supports synchronous checker implementations', async () => {
    const evaluator = new LimitEvaluator([
      buildChecker('user', () => '3_USER_DELETIONS'),
    ]);
    const result = await evaluator.evaluate(sampleEvent('user.delete'));
    expect(result).toEqual('3_USER_DELETIONS');
  });
});
