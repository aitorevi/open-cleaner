export interface IFileSystemPort {
  checkAccess(path: string): Promise<boolean>
  readDirectory(path: string): Promise<string[]>
  getStats(path: string): Promise<{ size: number; isDirectory: boolean }>
  moveToTrash(path: string): Promise<void>
}
