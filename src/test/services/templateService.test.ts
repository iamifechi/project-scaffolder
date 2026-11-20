import * as assert from "assert";
import { TemplateService } from "../../services/templateService.js";
import { ProjectTemplateId, projectTemplates } from "../../templates/projectTemplates.js";

suite("TemplateService Test Suite", () => {
  const templateService = new TemplateService();

  test("Should return all available templates", () => {
    const templates = templateService.getTemplates();

    assert.strictEqual(templates.length, projectTemplates.length);
  });

  test("Should find a template by its ID", () => {
    const template = templateService.getTemplateById(
      ProjectTemplateId.JavaScript,
    );

    assert.ok(template);
    assert.strictEqual(template.id, ProjectTemplateId.JavaScript);
  });

  test("Should return undefined for an unknown template ID", () => {
    const template = templateService.getTemplateById("unknown-template");

    assert.strictEqual(template, undefined);
  });
});
