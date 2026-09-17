import {
  createExpenseSchema,
  expenseSchema,
} from '@basic-hosted-expense-tracker/shared'
import { describe, expect, test } from 'bun:test'

import {
  insertExpensesSchema,
  selectExpensesSchema,
} from '../../../src/db/schema/expenses'

// Fixed dates so assertions are deterministic. No Date.now()/new Date() call
// in the schemas under test, so no need to freeze system time.
const VALID_DATE = new Date('2024-03-15T10:30:00.000Z')
const VALID_CREATED_AT = new Date('2024-03-15T09:00:00.000Z')

// INT32 bounds: from drizzle-orm/utils.ts CONSTANTS.INT32_MIN/MAX, applied to
// the `serial` column's "number int32" data type by
// node_modules/drizzle-orm/zod/column.js#numberColumnToSchema.
const INT32_MIN = -2_147_483_648
const INT32_MAX = 2_147_483_647

describe('insertExpensesSchema', () => {
  const validMinimal = {
    userId: 'user_123',
    title: 'Coffee',
    amount: '4.50',
    date: VALID_DATE,
  }

  const validFull = {
    id: 1,
    userId: 'user_123',
    title: 'Coffee',
    amount: '4.50',
    date: VALID_DATE,
    createdAt: VALID_CREATED_AT,
  }

  test('parses a minimal valid payload, omitting optional keys not supplied', () => {
    const result = insertExpensesSchema.parse(validMinimal)

    expect(result).toEqual(validMinimal)
    expect(Object.keys(result).sort()).toEqual([
      'amount',
      'date',
      'title',
      'userId',
    ])
  })

  test('parses a fully populated payload including id and createdAt', () => {
    const result = insertExpensesSchema.parse(validFull)

    expect(result).toEqual(validFull)
  })

  test('strips unknown keys rather than rejecting them', () => {
    const result = insertExpensesSchema.parse({
      ...validMinimal,
      notAColumn: 'surprise',
    })

    expect(result).toEqual(validMinimal)
    expect('notAColumn' in result).toBe(false)
  })

  test('shape has exactly the six table columns', () => {
    expect(Object.keys(insertExpensesSchema.shape).sort()).toEqual([
      'amount',
      'createdAt',
      'date',
      'id',
      'title',
      'userId',
    ])
  })

  describe('id (serial primary key: optional on insert, not nullable, int32)', () => {
    test('accepts omission', () => {
      const result = insertExpensesSchema.safeParse(validMinimal)
      expect(result.success).toBe(true)
    })

    test.each([
      ['the int32 lower boundary', INT32_MIN],
      ['the int32 upper boundary', INT32_MAX],
    ])('accepts %s', (_label, id) => {
      const result = insertExpensesSchema.safeParse({ ...validMinimal, id })
      expect(result.success).toBe(true)
    })

    test.each([
      ['one below the int32 lower boundary', INT32_MIN - 1, 'too_small'],
      ['one above the int32 upper boundary', INT32_MAX + 1, 'too_big'],
    ] as const)('rejects %s', (_label, id, code) => {
      const result = insertExpensesSchema.safeParse({ ...validMinimal, id })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.code).toBe(code)
      expect(result.error?.issues[0]?.path).toEqual(['id'])
    })

    test('rejects a non-integer number', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        id: 1.5,
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.code).toBe('invalid_type')
    })

    test('rejects null (id is not nullable)', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        id: null,
      })

      expect(result.success).toBe(false)
      // The base z.int().gte().lte() type check runs before the int-format
      // check, so a non-number input reports `expected: 'number'`, not
      // 'int' (the 'int' expectation is only reported for a non-integer
      // number, e.g. 1.5 — see the test above).
      expect(result.error?.issues[0]).toMatchObject({
        code: 'invalid_type',
        expected: 'number',
        path: ['id'],
      })
    })

    test('rejects a numeric string', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        id: '1',
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.code).toBe('invalid_type')
    })
  })

  describe.each([
    ['userId', 'string', 'kinde|üser_😀'],
    ['title', 'string', "Café, Résumé's 🎉"],
    ['amount', 'string', undefined],
    ['date', 'date', undefined],
  ] as const)('%s (not null: required)', (key, expected, unicodeValue) => {
    test('rejects a missing key', () => {
      const withoutKey = { ...validMinimal }
      delete (withoutKey as Record<string, unknown>)[key]
      const result = insertExpensesSchema.safeParse(withoutKey)

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]).toEqual({
        expected,
        code: 'invalid_type',
        path: [key],
        message: `Invalid input: expected ${expected}, received undefined`,
      })
    })

    test('rejects null', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        [key]: null,
      })
      expect(result.success).toBe(false)
    })

    if (unicodeValue !== undefined) {
      // The generated column has no `.min()`/regex — documented in
      // packages/db/TODO.md rather than "fixed" here. Contrast with
      // packages/shared's expenseSchema.title, which enforces min(3) and an
      // `A-Za-z0-9 _-` regex — the db schema enforces neither, for either
      // column.
      test('accepts an empty string (no length constraint is generated)', () => {
        const result = insertExpensesSchema.safeParse({
          ...validMinimal,
          [key]: '',
        })
        expect(result.success).toBe(true)
      })

      test('accepts unicode and emoji (no character-set constraint is generated)', () => {
        const result = insertExpensesSchema.safeParse({
          ...validMinimal,
          [key]: unicodeValue,
        })
        expect(result.success).toBe(true)
      })
    }
  })

  test('userId rejects a number in place of a string', () => {
    const result = insertExpensesSchema.safeParse({
      ...validMinimal,
      userId: 123,
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.code).toBe('invalid_type')
  })

  test('userId accepts a whitespace-only string', () => {
    const result = insertExpensesSchema.safeParse({
      ...validMinimal,
      userId: '   ',
    })
    expect(result.success).toBe(true)
  })

  describe('amount (numeric(12,2), not null: required string, unvalidated format)', () => {
    test('rejects a JS number (must be the string type)', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        amount: 4.5,
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.code).toBe('invalid_type')
    })

    // drizzle-orm/zod's stringColumnToSchema only applies a regex for a
    // "binary" constraint and a length cap when the column reports a
    // `length`. A pg `numeric` column has `precision`/`scale`, not `length`,
    // so none of that applies here: the generated schema is a bare
    // `z.string()`. Every one of these malformed values — which a real
    // `numeric(12,2)` column would reject — currently passes. See
    // packages/db/TODO.md.
    test.each([
      ['not a number at all', 'abc'],
      ['empty string', ''],
      ['whitespace only', '   '],
      ['more than 2 decimal places', '4.5001'],
      [
        'more than 10 integer digits (exceeds precision 12 - scale 2)',
        '123456789012.34',
      ],
      ['leading zeros', '004.50'],
      ['a leading plus sign', '+4.50'],
      ['a thousands separator', '4,500.00'],
      ['exponent notation', '4.5e2'],
      ['a negative amount', '-4.50'],
      ['trailing garbage', '4.50abc'],
    ])(
      'accepts %s (%j) — no format validation is generated',
      (_label, value) => {
        const result = insertExpensesSchema.safeParse({
          ...validMinimal,
          amount: value,
        })
        expect(result.success).toBe(true)
      },
    )
  })

  describe('date (timestamp with timezone, not null: required Date instance)', () => {
    // The column is z.date(), not z.iso.datetime() (packages/shared's
    // choice) — an ISO string is rejected outright, which is why
    // apps/server's route wraps the value in `new Date(...)` before calling
    // insertExpensesSchema.parse. See the schema-drift describe block below.
    test('rejects an ISO date string', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        date: '2024-03-15T10:30:00.000Z',
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]).toMatchObject({
        code: 'invalid_type',
        expected: 'date',
        path: ['date'],
      })
    })

    // z.date() checks isNaN(value.getTime()) internally, not just
    // `instanceof Date` — an Invalid Date object is rejected.
    test('rejects an Invalid Date instance', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        date: new Date('not-a-real-date'),
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.code).toBe('invalid_type')
    })

    test('accepts a Date instance', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        date: VALID_DATE,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('createdAt (timestamp, defaultNow, no notNull: optional and nullable)', () => {
    test('accepts omission, and the output has no createdAt key', () => {
      const result = insertExpensesSchema.parse(validMinimal)
      expect('createdAt' in result).toBe(false)
    })

    test('accepts explicit undefined', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        createdAt: undefined,
      })
      expect(result.success).toBe(true)
    })

    test('accepts null', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        createdAt: null,
      })
      expect(result.success).toBe(true)
      expect(result.data?.createdAt).toBeNull()
    })

    test('accepts a Date instance', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        createdAt: VALID_CREATED_AT,
      })
      expect(result.success).toBe(true)
      expect(result.data?.createdAt).toEqual(VALID_CREATED_AT)
    })

    test('rejects an ISO date string', () => {
      const result = insertExpensesSchema.safeParse({
        ...validMinimal,
        createdAt: '2024-03-15T09:00:00.000Z',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('selectExpensesSchema', () => {
  const validFull = {
    id: 1,
    userId: 'user_123',
    title: 'Coffee',
    amount: '4.50',
    date: VALID_DATE,
    createdAt: VALID_CREATED_AT,
  }

  test('parses a fully populated row', () => {
    const result = selectExpensesSchema.parse(validFull)
    expect(result).toEqual(validFull)
  })

  test('accepts createdAt: null (nullable, since the column has no notNull)', () => {
    const result = selectExpensesSchema.safeParse({
      ...validFull,
      createdAt: null,
    })
    expect(result.success).toBe(true)
    expect(result.data?.createdAt).toBeNull()
  })

  test('strips unknown keys rather than rejecting them', () => {
    const result = selectExpensesSchema.parse({
      ...validFull,
      notAColumn: 'surprise',
    })
    expect(result).toEqual(validFull)
  })

  test('shape has exactly the six table columns', () => {
    expect(Object.keys(selectExpensesSchema.shape).sort()).toEqual([
      'amount',
      'createdAt',
      'date',
      'id',
      'title',
      'userId',
    ])
  })

  // createSelectSchema's `optional` condition is unconditionally `() =>
  // false` (node_modules/drizzle-orm/zod/schema.js) — unlike the insert
  // schema, hasDefault does NOT make a select column optional. Every column,
  // including createdAt, must be present as a key; createdAt may just be
  // `null` rather than a Date.
  // 'id' expects 'number' rather than 'int' for a missing/wrong-type value:
  // the int-format check only fires once the base type check (a number)
  // already passed (e.g. 1.5 reports 'int'; undefined reports 'number').
  describe.each([
    ['id', { code: 'invalid_type', expected: 'number' }],
    ['userId', { code: 'invalid_type', expected: 'string' }],
    ['title', { code: 'invalid_type', expected: 'string' }],
    ['amount', { code: 'invalid_type', expected: 'string' }],
    ['date', { code: 'invalid_type', expected: 'date' }],
    ['createdAt', { code: 'invalid_type', expected: 'date' }],
  ])('%s is required (present as a key)', (key, expectedIssue) => {
    test('rejects a missing key', () => {
      const payload = { ...validFull }
      delete (payload as Record<string, unknown>)[key]
      const result = selectExpensesSchema.safeParse(payload)

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]).toMatchObject({
        ...expectedIssue,
        path: [key],
      })
    })
  })

  test('id rejects null (not nullable: the column is notNull)', () => {
    const result = selectExpensesSchema.safeParse({ ...validFull, id: null })
    expect(result.success).toBe(false)
  })

  test('userId rejects null (not nullable: the column is notNull)', () => {
    const result = selectExpensesSchema.safeParse({
      ...validFull,
      userId: null,
    })
    expect(result.success).toBe(false)
  })
})

// Mirrors apps/server/src/routes/expenses.ts's POST handler: validate
// against packages/shared's createExpenseSchema, then re-parse against
// insertExpensesSchema with `date` coerced to a Date and `userId` attached.
const buildInsertPayload = (clientPayload: unknown, userId: string) => {
  const expense = createExpenseSchema.parse(clientPayload)
  return {
    ...expense,
    date: new Date(expense.date),
    userId,
  }
}

describe('schema drift: packages/shared <-> packages/db', () => {
  test('a createExpenseSchema-valid payload is accepted by insertExpensesSchema once coerced', () => {
    const clientPayload = {
      title: 'Coffee',
      amount: '4.50',
      date: '2024-03-15T10:30:00.000Z',
    }

    const insertPayload = buildInsertPayload(clientPayload, 'user_123')
    const result = insertExpensesSchema.safeParse(insertPayload)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      title: 'Coffee',
      amount: '4.50',
      date: new Date('2024-03-15T10:30:00.000Z'),
      userId: 'user_123',
    })
  })

  test('createExpenseSchema only requires title, amount and date; insertExpensesSchema additionally requires userId (attached by the server, not the client)', () => {
    // createExpenseSchema = expenseSchema.omit({ id: true, userId: true, createdAt: true })
    expect(Object.keys(createExpenseSchema.shape).sort()).toEqual([
      'amount',
      'date',
      'title',
    ])
  })

  test("a createExpenseSchema-valid date string, passed to insertExpensesSchema without the server's Date coercion, fails", () => {
    // Documents why apps/server/src/routes/expenses.ts wraps the value in
    // `new Date(...)` before calling insertExpensesSchema.parse — skipping
    // that step is a real, easy-to-introduce regression.
    const clientPayload = {
      title: 'Coffee',
      amount: '4.50',
      date: '2024-03-15T10:30:00.000Z',
    }
    const expense = createExpenseSchema.parse(clientPayload)

    const result = insertExpensesSchema.safeParse({
      ...expense,
      userId: 'user_123',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({
      code: 'invalid_type',
      expected: 'date',
      path: ['date'],
    })
  })

  // packages/shared's amount regex (`^\d+(\.\d{1,2})?$`) caps decimal places
  // at 2 but places no limit on the number of integer digits, while the
  // `numeric(12, 2)` column can hold at most 10 integer digits (precision 12
  // minus scale 2). insertExpensesSchema (see the amount describe block
  // above) applies no numeric validation at all, so this gap is invisible
  // at both schema layers — it would only surface as a Postgres error at
  // insert time. Recorded in packages/db/TODO.md.
  test('an amount that exceeds the numeric(12,2) column width passes both createExpenseSchema and insertExpensesSchema', () => {
    const tooManyIntegerDigits = '123456789012.34' // 12 integer digits > the column's 10-digit capacity

    const sharedResult =
      expenseSchema.shape.amount.safeParse(tooManyIntegerDigits)
    expect(sharedResult.success).toBe(true)

    const dbResult = insertExpensesSchema.safeParse({
      userId: 'user_123',
      title: 'Coffee',
      amount: tooManyIntegerDigits,
      date: VALID_DATE,
    })
    expect(dbResult.success).toBe(true)
  })
})
