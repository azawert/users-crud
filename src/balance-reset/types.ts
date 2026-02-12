export type TBalanceResetSource = 'manual' | 'schedule'

export interface IBalanceResetJobPayload {
  source: TBalanceResetSource
  requestedAt: string
}
