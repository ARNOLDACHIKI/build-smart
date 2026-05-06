import assert from 'node:assert/strict';
import { buildSubscriptionActivation, calculateSubscriptionExpiry, resolvePlanAmount } from './paymentService.js';

const yearly = resolvePlanAmount('professional', 'annual');
assert.ok(yearly);
assert.equal(yearly?.plan.name, 'Professional');
assert.equal(yearly?.pricing.basePrice, 78000);
assert.equal(yearly?.pricing.totalPrice, 90480);

const invalid = resolvePlanAmount('unknown', 'monthly');
assert.equal(invalid, null);

const base = new Date('2026-05-05T10:00:00Z');
const monthlyExpiry = calculateSubscriptionExpiry('monthly', new Date('2026-05-10T10:00:00Z'), base);
assert.equal(monthlyExpiry.toISOString(), '2026-06-09T10:00:00.000Z');

const activation = buildSubscriptionActivation(
  {
    id: 'pay-1',
    planKey: 'basic',
    planName: 'Basic',
    billingCycle: 'monthly',
    completedAt: base,
  },
  null,
  base,
);

assert.equal(activation.subscriptionStatus, 'ACTIVE');
assert.equal(activation.subscriptionPlanKey, 'basic');
assert.equal(activation.subscriptionExpiresAt.toISOString(), '2026-06-04T10:00:00.000Z');

console.log('paymentService checks passed');