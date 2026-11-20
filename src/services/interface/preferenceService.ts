export interface IPreferenceService {
  getLastSelectedTemplate(): string | undefined;
  setLastSelectedTemplate(templateId: string): Promise<void>;
}