/**
 * Replacement of eval since eval is unsafe.
 * Refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!
 * Also expose additional data as arg that can be reference by the expression string
 * @param expression
 * @returns
 */
export function safeEval(expression: string, args?: unknown): unknown {
  return Function("args", `"use strict";return (${expression})`)(args);
}
