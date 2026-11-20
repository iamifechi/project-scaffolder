import { ProjectTemplate } from "../../types/template";

export interface ITemplateService {
  getTemplates(): ProjectTemplate[];
  getTemplateById(id: string): ProjectTemplate | undefined;
}
