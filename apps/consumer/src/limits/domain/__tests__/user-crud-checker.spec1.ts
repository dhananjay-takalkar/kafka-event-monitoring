// import { EventMsg } from '@event-monitoring/shared';
// import { LimitStatePort } from '../ports/limit-state.port';
// import { UserCrudChecker } from '../limits';

// const createEvent = (
//   scope: EventMsg['scope'],
//   overrides: Partial<EventMsg> = {},
// ): EventMsg => ({
//   userId: 1,
//   scope,
//   date: new Date().toISOString(),
//   ...overrides,
// });

// describe('UserCrudChecker', () => {
//   const state: jest.Mocked<LimitStatePort> = {
//     incrementUserDeletes: jest.fn(),
//     pushUserUpdateTimestamp: jest.fn(),
//     resetUserDeletes: jest.fn(),
//   };

//   let checker: UserCrudChecker;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     checker = new UserCrudChecker(state);
//   });

//   it('ignores events outside the user scope', async () => {
//     const result = await checker.check(createEvent('payment.read'));
//     expect(result).toBeNull();
//     expect(state.incrementUserDeletes.mock.calls).toHaveLength(0);
//   });

//   it('increments delete counter and returns limit when threshold reached', async () => {
//     state.incrementUserDeletes.mockResolvedValueOnce(3);

//     const result = await checker.check(createEvent('user.delete'));

//     expect(state.incrementUserDeletes.mock.calls).toEqual([[1]]);
//     expect(result).toBe('3_USER_DELETIONS');
//   });

//   it('resets delete counter when non-delete actions occur', async () => {
//     await checker.check(createEvent('user.create'));

//     expect(state.resetUserDeletes.mock.calls).toEqual([[1]]);
//   });

//   it('returns limit when updates exceed rolling window', async () => {
//     state.pushUserUpdateTimestamp.mockResolvedValueOnce(2);
//     const result = await checker.check(createEvent('user.update'));

//     expect(state.pushUserUpdateTimestamp.mock.calls.length).toBe(1);
//     expect(result).toBe('2_USER_UPDATED_IN_1MINUTE');
//   });

//   it('ignores malformed update timestamps', async () => {
//     const result = await checker.check(
//       createEvent('user.update', { date: 'not-a-date' }),
//     );

//     expect(result).toBeNull();
//     expect(state.pushUserUpdateTimestamp.mock.calls).toHaveLength(0);
//   });
// });
