export type Category =
  | 'rent'
  | 'utilities'
  | 'groceries'
  | 'dining'
  | 'subscriptions'
  | 'transport'
  | 'household'
  | 'other'

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares'

export interface CategoryConfig {
  label: string
  emoji: string
  bgClass: string
  textClass: string
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  rent: {
    label: 'Rent',
    emoji: '🏠',
    bgClass: 'bg-indigo-100',
    textClass: 'text-indigo-700',
  },
  utilities: {
    label: 'Utilities',
    emoji: '⚡',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
  },
  groceries: {
    label: 'Groceries',
    emoji: '🛒',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
  dining: {
    label: 'Dining',
    emoji: '🍕',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
  subscriptions: {
    label: 'Subscriptions',
    emoji: '📺',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
  transport: {
    label: 'Transport',
    emoji: '🚗',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  household: {
    label: 'Household',
    emoji: '🧹',
    bgClass: 'bg-teal-100',
    textClass: 'text-teal-700',
  },
  other: {
    label: 'Other',
    emoji: '📦',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
  },
}

export const CATEGORY_LIST: Category[] = [
  'rent',
  'utilities',
  'groceries',
  'dining',
  'subscriptions',
  'transport',
  'household',
  'other',
]

export const SPLIT_TYPES: { value: SplitType; label: string; icon: string }[] = [
  { value: 'equal', label: 'Equal', icon: '⚖️' },
  { value: 'exact', label: 'Exact', icon: '🔢' },
  { value: 'percentage', label: 'Percent', icon: '%' },
  { value: 'shares', label: 'Shares', icon: '⚡' },
]

export const MAX_HOUSEHOLD_MEMBERS = 5
