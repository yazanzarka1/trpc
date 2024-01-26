import type { ProcedureType } from '../procedure';
import type { TRPC_ERROR_CODE_KEY, TRPCErrorShape } from '../rpc';
import type { TRPCError } from './TRPCError';

/**
 * @internal
 */
export type ErrorFormatter<TContext, TErrorData extends object> = (args: {
  error: TRPCError;
  type: ProcedureType | 'unknown';
  path: string | undefined;
  input: unknown;
  ctx: TContext | undefined;
  shape: DefaultErrorShape;
}) => TRPCErrorShape<TErrorData>;

/**
 * @internal
 */
export interface DefaultErrorData {
  code: TRPC_ERROR_CODE_KEY;
  httpStatus: number;
  /**
   * The path of the procedure that failed
   */
  path?: string;
  /**
   * The stack trace of the error (only in dev mode)
   */
  stack?: string;
}

/**
 * @internal
 */
export interface DefaultErrorShape extends TRPCErrorShape<DefaultErrorData> {
  //
}

export const defaultFormatter: ErrorFormatter<any, any> = ({ shape }) => {
  return shape;
};
