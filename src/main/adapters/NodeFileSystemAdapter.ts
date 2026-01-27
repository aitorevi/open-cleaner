import * as fs from 'fs-extra'
import { shell } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'
import { IFileSystemPort } from '../ports/IFileSystemPort'

const execAsync = promisify(exec)

export class NodeFileSystemAdapter implements IFileSystemPort {
  async checkAccess(path: string): Promise<boolean> {
    try {
      console.log('Checking access to:', path)
      await fs.access(path, fs.constants.R_OK)
      console.log('✅ Access granted to:', path)
      return true
    } catch (error) {
      console.log('❌ Access denied to:', path, error)
      return false
    }
  }

  async readDirectory(path: string): Promise<string[]> {
    try {
      return await fs.readdir(path)
    } catch (error) {
      console.error(`Error reading directory ${path}:`, error)
      return []
    }
  }

  async getStats(path: string): Promise<{ size: number; isDirectory: boolean }> {
    try {
      const stats = await fs.stat(path)
      return {
        size: stats.size,
        isDirectory: stats.isDirectory()
      }
    } catch (error) {
      console.error(`Error getting stats for ${path}:`, error)
      return { size: 0, isDirectory: false }
    }
  }

  async moveToTrash(path: string): Promise<void> {
    try {
      // First try normal method
      await shell.trashItem(path)
      console.log(`✅ Successfully moved to trash: ${path}`)
    } catch (error: any) {
      console.error(`Error moving ${path} to trash:`, error)

      // If it fails, check if it's owned by root and try with admin privileges
      if (
        error.message &&
        (error.message.includes('permisos') || error.message.includes('permission'))
      ) {
        console.log('Attempting to move to trash with administrator privileges...')
        try {
          await this.moveToTrashWithAdminPrivileges(path)
          console.log(`✅ Successfully moved to trash with admin privileges: ${path}`)
        } catch (adminError: any) {
          console.error('Failed to move with admin privileges:', adminError)
          throw new Error(
            'No se pudo mover la aplicación a la papelera. La aplicación puede estar en uso o protegida por el sistema.'
          )
        }
      } else {
        throw error
      }
    }
  }

  private async moveToTrashWithAdminPrivileges(path: string): Promise<void> {
    // Escape single quotes in path
    const escapedPath = path.replace(/'/g, "'\\''")

    // Use osascript with administrator privileges to move to trash
    // This shows macOS native authentication dialog
    const command = `osascript -e 'do shell script "mv '\\''${escapedPath}'\\'' ~/.Trash/" with administrator privileges'`

    try {
      await execAsync(command)
    } catch (error: any) {
      console.error('Admin privileges error:', error)

      // If user cancels authentication
      if (
        error.message &&
        (error.message.includes('User canceled') || error.message.includes('cancelado'))
      ) {
        throw new Error('Autenticación cancelada por el usuario')
      }

      throw new Error('No se pudo mover la aplicación a la papelera con permisos de administrador')
    }
  }
}
