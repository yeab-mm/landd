export function parseFormData(raw: string | Record<string, unknown> | null | undefined): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, any>;
    } catch {
      return {};
    }
  }
  return raw as Record<string, any>;
}

export function serializeFormData(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}
