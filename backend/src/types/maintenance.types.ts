export interface MaintenanceRequest {
  id: string
  tenantId: string
  title: string
  description: string
  priority: string
  status: string
  apartment: string
  location?: string
  imageUrls: string[]
  resolvedAt?: Date
  resolvedBy?: string
  resolutionNotes?: string
  cost?: number
  createdAt: Date
  updatedAt: Date
}

export interface MaintenanceRequestWithTenant extends MaintenanceRequest {
  tenant: {
    id: string
    name: string
    email: string
    apartment: string
  }
}

export interface MaintenanceStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  cancelled: number
  averageResolutionTime: number
}
