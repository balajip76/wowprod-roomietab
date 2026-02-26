/**
 * Greedy net-balance matching algorithm to compute minimum transactions
 * All amounts in integer cents to avoid floating-point errors
 */

export interface MemberBalance {
  memberId: string
  netBalance: number // positive = owed to them, negative = they owe others
}

export interface SettlementTransaction {
  payerMemberId: string
  receiverMemberId: string
  amountCents: number
}

export interface MemberSummary {
  memberId: string
  totalPaid: number
  totalShare: number
  netBalance: number
}

/**
 * Compute the minimum number of transactions to settle all debts
 * Uses a greedy algorithm: match the largest debtor with the largest creditor
 */
export function computeMinimumTransactions(
  balances: MemberBalance[]
): SettlementTransaction[] {
  const transactions: SettlementTransaction[] = []

  // Create mutable copies, filter out zero balances
  const debtors = balances
    .filter((b) => b.netBalance < 0)
    .map((b) => ({ memberId: b.memberId, amount: -b.netBalance }))
    .sort((a, b) => b.amount - a.amount)

  const creditors = balances
    .filter((b) => b.netBalance > 0)
    .map((b) => ({ memberId: b.memberId, amount: b.netBalance }))
    .sort((a, b) => b.amount - a.amount)

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0) {
      transactions.push({
        payerMemberId: debtor.memberId,
        receiverMemberId: creditor.memberId,
        amountCents: amount,
      })
    }

    debtor.amount -= amount
    creditor.amount -= amount

    if (debtor.amount === 0) i++
    if (creditor.amount === 0) j++
  }

  return transactions
}

/**
 * Compute member summaries from expense data
 */
export function computeMemberSummaries(
  members: { id: string }[],
  expenses: {
    paid_by_member_id: string
    amount_cents: number
    is_deleted: boolean
  }[],
  splits: {
    expense_id: string
    member_id: string
    amount_cents: number
  }[],
  expenseIds: Set<string>
): MemberSummary[] {
  const summaries = new Map<string, MemberSummary>()

  for (const member of members) {
    summaries.set(member.id, {
      memberId: member.id,
      totalPaid: 0,
      totalShare: 0,
      netBalance: 0,
    })
  }

  // Sum up what each person paid
  for (const expense of expenses) {
    if (expense.is_deleted) continue
    const summary = summaries.get(expense.paid_by_member_id)
    if (summary) {
      summary.totalPaid += expense.amount_cents
    }
  }

  // Sum up each person's share
  for (const split of splits) {
    if (!expenseIds.has(split.expense_id)) continue
    const summary = summaries.get(split.member_id)
    if (summary) {
      summary.totalShare += split.amount_cents
    }
  }

  // Compute net balance
  for (const summary of summaries.values()) {
    summary.netBalance = summary.totalPaid - summary.totalShare
  }

  return Array.from(summaries.values())
}
