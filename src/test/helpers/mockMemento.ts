import * as vscode from "vscode";

export function createMockMemento(
  initialValues: Record<string, unknown> = {},
): vscode.Memento {
  const values = new Map(Object.entries(initialValues));

  return {
    get<T>(key: string): T | undefined {
      return values.get(key) as T | undefined;
    },

    async update(key: string, value: unknown): Promise<void> {
      if (value === undefined) {
        values.delete(key);
      } else {
        values.set(key, value);
      }
    },
  } as unknown as vscode.Memento;
}
