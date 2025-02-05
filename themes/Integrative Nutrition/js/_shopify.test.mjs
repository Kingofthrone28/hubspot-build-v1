// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, it } from '@jest/globals';
import { calculateItemDiscount } from './_shopify';

describe('calculating a line item discount', () => {
  it('returns zero with no argument', () => {
    expect(calculateItemDiscount()).toEqual(0);
  });

  it('returns zero with without an array of discount allocations', () => {
    const item = {
      quantity: 1,
    };

    expect(calculateItemDiscount(item)).toEqual(0);
  });

  it('parses discounts correctly with a single item', () => {
    const item = {
      quantity: 1,
      discountAllocations: [{ allocatedAmount: { amount: 10 } }],
    };

    expect(calculateItemDiscount(item)).toEqual(10);
  });

  it('parses discounts correctly with more than one item', () => {
    const item = {
      quantity: 4,
      discountAllocations: [{ allocatedAmount: { amount: 10 } }],
    };

    expect(calculateItemDiscount(item)).toEqual(40);
  });
});
