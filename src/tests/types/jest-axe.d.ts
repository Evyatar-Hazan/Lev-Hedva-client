declare module 'jest-axe' {
  import { RuleObject } from 'axe-core';

  export interface AxeResults {
    violations: RuleObject[];
  }

  export function axe(html: Element | Document | string, options?: any): Promise<AxeResults>;

  export const toHaveNoViolations: jest.ExpectExtendMap;

  export const configureAxe: any;
}
