export interface Theme {
  name: 'light' | 'dark' | 'system'
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    accent: string
    text: string
    muted: string
    success: string
    warning: string
    error: string
  }
}

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
}

export interface ModalState {
  isOpen: boolean
  type?: string
  data?: any
  onConfirm?: () => void
  onCancel?: () => void
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'PAYMENT' | 'MAINTENANCE' | 'SYSTEM' | 'ALERT'
  read: boolean
  createdAt: string
  relatedId?: string
  relatedType?: string
}

export interface BreadcrumbItem {
  label: string
  href: string
  active?: boolean
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
}

export interface FilterOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface TabItem {
  value: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

export interface AccordionItem {
  value: string
  trigger: React.ReactNode
  content: React.ReactNode
}