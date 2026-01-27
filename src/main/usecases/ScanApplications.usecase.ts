import * as os from 'os'
import * as path from 'path'
import { IAppScannerPort } from '../ports/IAppScannerPort'
import { App } from '../../shared/domain/App.entity'

export class ScanApplicationsUseCase {
  constructor(private appScanner: IAppScannerPort) {}

  async execute(): Promise<App[]> {
    const applications: App[] = []

    // Scan system Applications folder
    const systemApps = await this.appScanner.scanApplications('/Applications')
    applications.push(...systemApps)

    // Scan user Applications folder
    const userAppsPath = path.join(os.homedir(), 'Applications')
    const userApps = await this.appScanner.scanApplications(userAppsPath)
    applications.push(...userApps)

    // Sort by name
    applications.sort((a, b) => a.name.localeCompare(b.name))

    return applications
  }
}
