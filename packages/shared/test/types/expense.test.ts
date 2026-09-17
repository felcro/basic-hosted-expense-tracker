import { describe, expect, test } from 'bun:test'

import {
  createExpenseSchema,
  defaultPostExpenseValues,
  expenseSchema,
} from '../../src/types/expense'

const validExpense = {
  id: 1,
  userId: 'user_123',
  title: 'Coffee beans',
  amount: '12.50',
  date: '2026-09-17T10:30:00.000Z',
  createdAt: '2026-09-17T10:30:00.000Z',
}

describe('expenseSchema', () => {
  test('accepts a fully valid expense', () => {
    expect(expenseSchema.parse(validExpense)).toEqual(validExpense)
  })

  test('accepts a null createdAt', () => {
    const result = expenseSchema.parse({ ...validExpense, createdAt: null })
    expect(result.createdAt).toBeNull()
  })

  test('rejects a missing createdAt', () => {
    const { createdAt: _createdAt, ...withoutCreatedAt } = validExpense
    expect(expenseSchema.safeParse(withoutCreatedAt).success).toBe(false)
  })

  test('strips unknown keys', () => {
    const result = expenseSchema.parse({ ...validExpense, isDeleted: true })
    expect(result).not.toHaveProperty('isDeleted')
  })

  describe('id', () => {
    test('accepts the lowest valid id', () => {
      expect(expenseSchema.parse({ ...validExpense, id: 1 }).id).toBe(1)
    })

    test.each([
      ['zero', 0],
      ['negative', -1],
      ['fractional', 1.5],
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
    ])('rejects a %s id', (_label, id) => {
      expect(expenseSchema.safeParse({ ...validExpense, id }).success).toBe(
        false,
      )
    })

    test('rejects a numeric string id', () => {
      expect(
        expenseSchema.safeParse({ ...validExpense, id: '1' }).success,
      ).toBe(false)
    })
  })

  describe('userId', () => {
    test('accepts an empty string', () => {
      expect(expenseSchema.parse({ ...validExpense, userId: '' }).userId).toBe(
        '',
      )
    })

    test('rejects a non-string userId', () => {
      expect(
        expenseSchema.safeParse({ ...validExpense, userId: 123 }).success,
      ).toBe(false)
    })
  })

  describe('title', () => {
    test.each([
      ['exactly three characters', 'Tea'],
      [
        'letters, digits, spaces, underscores and hyphens',
        'Order_42 - Bulk Buy',
      ],
    ])('accepts %s', (_label, title) => {
      expect(expenseSchema.parse({ ...validExpense, title }).title).toBe(title)
    })

    test('rejects a title under three characters', () => {
      const result = expenseSchema.safeParse({ ...validExpense, title: 'Te' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe(
        'Title must be at least 3 characters',
      )
    })

    test('rejects an empty title', () => {
      expect(
        expenseSchema.safeParse({ ...validExpense, title: '' }).success,
      ).toBe(false)
    })

    test.each([
      ['punctuation', 'Coffee!'],
      ['an apostrophe', "Bob's lunch"],
      ['a comma', 'Tea, milk'],
      ['an accented character', 'Café beans'],
      ['an emoji', 'Coffee ☕'],
      ['a newline', 'Coffee\nbeans'],
    ])('rejects a title containing %s', (_label, title) => {
      const result = expenseSchema.safeParse({ ...validExpense, title })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe(
        'The title must only contain valid characters',
      )
    })

    test('rejects whitespace-only titles', () => {
      expect(
        expenseSchema.safeParse({ ...validExpense, title: '   ' }).success,
      ).toBe(false)
    })
  })

  describe('amount', () => {
    test.each([
      ['whole numbers', '12'],
      ['one decimal place', '12.5'],
      ['two decimal places', '12.50'],
      ['zero', '0'],
      ['zero with decimals', '0.00'],
      ['a large value', '999999999.99'],
      ['leading zeros', '007.50'],
    ])('accepts %s', (_label, amount) => {
      expect(expenseSchema.parse({ ...validExpense, amount }).amount).toBe(
        amount,
      )
    })

    test.each([
      ['three decimal places', '12.505'],
      ['a trailing dot', '12.'],
      ['a leading dot', '.50'],
      ['a negative value', '-12.50'],
      ['an explicit plus sign', '+12.50'],
      ['a currency symbol', '£12.50'],
      ['thousands separators', '1,200.00'],
      ['exponent notation', '1e3'],
      ['whitespace padding', ' 12.50 '],
      ['an empty string', ''],
    ])('rejects %s', (_label, amount) => {
      const result = expenseSchema.safeParse({ ...validExpense, amount })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe(
        'Amount must be a valid monetary value',
      )
    })

    test('rejects a non-stringified numeric amount', () => {
      expect(
        expenseSchema.safeParse({ ...validExpense, amount: 12.5 }).success,
      ).toBe(false)
    })
  })

  describe('date', () => {
    test.each([
      ['a UTC timestamp with milliseconds', '2026-09-17T10:30:00.000Z'],
      ['a UTC timestamp without milliseconds', '2026-09-17T10:30:00Z'],
      ['a leap day', '2024-02-29T00:00:00.000Z'],
    ])('accepts %s', (_label, date) => {
      expect(expenseSchema.parse({ ...validExpense, date }).date).toBe(date)
    })

    test.each([
      ['a date-only string', '2026-09-17'],
      ['a timestamp with no timezone', '2026-09-17T10:30:00'],
      ['a space separator', '2026-09-17 10:30:00Z'],
      ['a non-leap 29 February', '2025-02-29T00:00:00.000Z'],
      ['month 13', '2026-13-01T00:00:00.000Z'],
      ['an empty string', ''],
      ['a free-text date', '17 September 2026'],
    ])('rejects %s', (_label, date) => {
      expect(expenseSchema.safeParse({ ...validExpense, date }).success).toBe(
        false,
      )
    })

    test('rejects a numeric offset because offsets are not enabled', () => {
      // z.iso.datetime() defaults to offset: false, so only `Z` is accepted.
      expect(
        expenseSchema.safeParse({
          ...validExpense,
          date: '2026-09-17T10:30:00+01:00',
        }).success,
      ).toBe(false)
    })

    test('rejects a Date instance', () => {
      expect(
        expenseSchema.safeParse({ ...validExpense, date: new Date() }).success,
      ).toBe(false)
    })
  })

  test('reports every invalid field at once', () => {
    const result = expenseSchema.safeParse({
      id: 0,
      userId: 'user_123',
      title: 'x',
      amount: 'free',
      date: 'yesterday',
      createdAt: null,
    })
    expect(result.success).toBe(false)
    expect(new Set(result.error?.issues.map((issue) => issue.path[0]))).toEqual(
      new Set(['id', 'title', 'amount', 'date']),
    )
  })
})

describe('createExpenseSchema', () => {
  const validPostExpense = {
    title: validExpense.title,
    amount: validExpense.amount,
    date: validExpense.date,
  }

  test('accepts a valid create payload', () => {
    expect(createExpenseSchema.parse(validPostExpense)).toEqual(
      validPostExpense,
    )
  })

  test('omits id, userId and createdAt from the output', () => {
    expect(Object.keys(createExpenseSchema.shape).sort()).toEqual([
      'amount',
      'date',
      'title',
    ])
  })

  test('strips id, userId and createdAt when supplied', () => {
    const result = createExpenseSchema.parse(validExpense)
    expect(result).toEqual(validPostExpense)
  })

  test.each(['title', 'amount', 'date'])('requires %s', (field) => {
    const { [field]: _omitted, ...partial } = validPostExpense
    expect(createExpenseSchema.safeParse(partial).success).toBe(false)
  })

  test('inherits the title validation rules', () => {
    expect(
      createExpenseSchema.safeParse({ ...validPostExpense, title: 'Café' })
        .success,
    ).toBe(false)
  })

  test('inherits the amount validation rules', () => {
    expect(
      createExpenseSchema.safeParse({ ...validPostExpense, amount: '12.505' })
        .success,
    ).toBe(false)
  })
})

describe('defaultPostExpenseValues', () => {
  test('carries an empty title and amount', () => {
    expect(defaultPostExpenseValues.title).toBe('')
    expect(defaultPostExpenseValues.amount).toBe('')
  })

  test('carries a date that satisfies the schema', () => {
    expect(
      createExpenseSchema.shape.date.safeParse(defaultPostExpenseValues.date)
        .success,
    ).toBe(true)
  })

  test('does not itself pass the create schema, since title and amount are blank', () => {
    // The defaults are form-initialisation values, not a submittable payload.
    expect(
      createExpenseSchema.safeParse(defaultPostExpenseValues).success,
    ).toBe(false)
  })
})
