import type { ProjectTemplate } from "../types/template";
import type { ITemplateService } from "./interface/templateService";
import { projectTemplates } from "../templates/projectTemplates";

export class TemplateService implements ITemplateService {
  getTemplates(): ProjectTemplate[] {
    return projectTemplates;
  }

  getTemplateById(id: string): ProjectTemplate | undefined {
    return projectTemplates.find((template) => template.id === id);
  }
}
