export interface App {
  name: string
  path: string
  version?: string
  size: number
  icon?: string
}

export interface JunkFile {
  path: string
  type: 'cache' | 'preferences' | 'logs' | 'support'
  size: number
}
