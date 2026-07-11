const VARIABLE_REGEX = /(\{\{[^}]+\}\})/g

export function isVariableToken(text: string): boolean {
  return /^\{\{[^}]+\}\}$/.test(text)
}

export function splitVariableTokens(text: string): string[] {
  return text.split(VARIABLE_REGEX)
}
