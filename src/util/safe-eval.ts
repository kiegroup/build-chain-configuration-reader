/**
 * Replacement of eval since eval is unsafe.
 * Refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!
 * @param expression
 * @returns
 */
export function safeEval(expression: string): unknown {
  return Function(`"use strict";return (${expression})`)();
}
