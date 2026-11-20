export interface IFileService {
  createProject(
    parentPath: string,
    projectName: string,
    templateId: string,
  ): Promise<string>;
}
