import { IFileSystemPort } from '../ports/IFileSystemPort';

export class MoveToTrashUseCase {
  constructor(private fileSystem: IFileSystemPort) {}

  async execute(path: string): Promise<void> {
    await this.fileSystem.moveToTrash(path);
  }
}
