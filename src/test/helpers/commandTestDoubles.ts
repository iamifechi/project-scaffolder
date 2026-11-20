import * as vscode from "vscode";
import sinon from "sinon";

export function stubVSCodeUI() {
  const sandbox = sinon.createSandbox();

  const showQuickPick = sandbox.stub(vscode.window, "showQuickPick");
  const showInputBox = sandbox.stub(vscode.window, "showInputBox");
  const showOpenDialog = sandbox.stub(vscode.window, "showOpenDialog");

  const showInformationMessage = sandbox.stub(
    vscode.window,
    "showInformationMessage",
  );

  const showErrorMessage = sandbox.stub(vscode.window, "showErrorMessage");

  return {
    sandbox,
    showQuickPick,
    showInputBox,
    showOpenDialog,
    showInformationMessage,
    showErrorMessage,
  };
}
