/**
 * Generate pre-filled payment deep links for Venmo, PayPal, and Zelle
 */

export function generateVenmoUrl(
  handle: string | null | undefined,
  amountCents: number,
  note?: string
): string | undefined {
  if (!handle) return undefined
  const amount = (amountCents / 100).toFixed(2)
  const params = new URLSearchParams({
    txn: 'pay',
    recipients: handle,
    amount,
    note: note ?? 'RoomieTab settlement',
  })
  return `https://venmo.com/?${params.toString()}`
}

export function generatePaypalUrl(
  email: string | null | undefined,
  amountCents: number,
  note?: string
): string | undefined {
  if (!email) return undefined
  const amount = (amountCents / 100).toFixed(2)
  const params = new URLSearchParams({
    business: email,
    amount,
    item_name: note ?? 'RoomieTab settlement',
    currency_code: 'USD',
  })
  return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&${params.toString()}`
}

export function generateZelleUrl(): string {
  // Zelle doesn't support deep links with pre-filled amounts
  // We just link to their website
  return 'https://www.zellepay.com/'
}
