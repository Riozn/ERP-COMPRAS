import type {
  CompletePurchaseResult,
  PreparedCompletePurchaseInput,
} from '../operations/purchase-workflow.types.js'

export interface PurchaseWorkflowRepository {
  completePurchase(input: PreparedCompletePurchaseInput): Promise<CompletePurchaseResult>
}
