import { App, JunkFile } from '../../shared/domain/App.entity';

export interface IAppScannerPort {
  scanApplications(path: string): Promise<App[]>;
  findJunkFiles(appName: string): Promise<JunkFile[]>;
}
