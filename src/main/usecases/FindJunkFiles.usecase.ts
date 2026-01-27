import { IAppScannerPort } from '../ports/IAppScannerPort'
import { JunkFile } from '../../shared/domain/App.entity'

export class FindJunkFilesUseCase {
  constructor(private appScanner: IAppScannerPort) {}

  async execute(appName: string): Promise<JunkFile[]> {
    return await this.appScanner.findJunkFiles(appName)
  }
}
