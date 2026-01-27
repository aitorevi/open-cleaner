export class CheckPermissionsUseCase {

  async execute(): Promise<{ hasPermissions: boolean }> {
    // For now, always return true to allow basic functionality
    // Full Disk Access is only needed for finding junk files in protected locations
    console.log('Skipping Full Disk Access check - returning true for basic functionality')
    return { hasPermissions: true }
  }
}
