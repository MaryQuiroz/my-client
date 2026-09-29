// Configuración de planes y límites — Fase 9 y 10
// Este es el ÚNICO archivo donde se definen los límites de cada plan.
// Cambiar aquí afecta a toda la lógica de cuotas y rate limiting.

export type PlanId = 'free' | 'pro' | 'agency'

export interface PlanLimits {
  searchesPerMonth: number
  auditsPerMonth: number
  messagesPerMonth: number
  usersPerAccount: number
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    searchesPerMonth: 5,
    auditsPerMonth: 3,
    messagesPerMonth: 10,
    usersPerAccount: 1,
  },
  pro: {
    searchesPerMonth: 100,
    auditsPerMonth: 50,
    messagesPerMonth: 300,
    usersPerAccount: 1,
  },
  agency: {
    searchesPerMonth: 500,
    auditsPerMonth: 200,
    messagesPerMonth: 1500,
    usersPerAccount: 5,
  },
}

export const DEFAULT_PLAN: PlanId = 'free'
