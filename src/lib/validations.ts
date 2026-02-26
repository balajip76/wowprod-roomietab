import { z } from 'zod'

export const expenseFormSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100),
  amountCents: z.number().int().positive('Amount must be positive'),
  category: z.enum([
    'rent',
    'utilities',
    'groceries',
    'dining',
    'subscriptions',
    'transport',
    'household',
    'other',
  ]),
  splitType: z.enum(['equal', 'exact', 'percentage', 'shares']),
  paidByMemberId: z.string().uuid('Invalid member'),
  expenseDate: z.string().min(1, 'Date is required'),
  splits: z
    .array(
      z.object({
        memberId: z.string().uuid(),
        amountCents: z.number().int().min(0),
        percentage: z.number().min(0).max(100).optional(),
        shares: z.number().int().min(0).optional(),
      })
    )
    .min(1, 'At least one split is required'),
})

export const householdFormSchema = z.object({
  name: z.string().min(1, 'Household name is required').max(50),
  displayName: z.string().min(1, 'Your name is required').max(50),
})

export const memberProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  venmoHandle: z.string().max(30).optional(),
  paypalEmail: z.string().email().optional().or(z.literal('')),
  notificationPrefs: z
    .object({
      new_expense: z.boolean(),
      tagged: z.boolean(),
      month_end: z.boolean(),
      recurring: z.boolean(),
    })
    .optional(),
})

export const recurringTemplateSchema = z.object({
  householdId: z.string().uuid(),
  description: z.string().min(1).max(100),
  amountCents: z.number().int().positive(),
  category: z.enum([
    'rent',
    'utilities',
    'groceries',
    'dining',
    'subscriptions',
    'transport',
    'household',
    'other',
  ]),
  splitType: z.enum(['equal', 'exact', 'percentage', 'shares']),
  paidByMemberId: z.string().uuid(),
  splitConfig: z.array(z.record(z.unknown())),
  dayOfMonth: z.number().int().min(1).max(31),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
export type HouseholdFormValues = z.infer<typeof householdFormSchema>
export type MemberProfileValues = z.infer<typeof memberProfileSchema>
export type RecurringTemplateValues = z.infer<typeof recurringTemplateSchema>
