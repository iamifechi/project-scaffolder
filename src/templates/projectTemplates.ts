import type { ProjectTemplate } from "../types/template";

export enum ProjectTemplateId {
  JavaScript = "javascript",
  TypeScript = "typescript",
  React = "react",
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: ProjectTemplateId.JavaScript,
    label: "$(file-code) JavaScript Project",
    description: "A basic JavaScript project",
  },
  {
    id: ProjectTemplateId.TypeScript,
    label: "$(file-code) TypeScript Project",
    description: "A basic TypeScript project",
  },
  {
    id: ProjectTemplateId.React,
    label: "$(symbol-react) React Project",
    description: "A React application",
  },
];
