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
export type DefaultErrorData = {
  code: TRPC_ERROR_CODE_KEY;
  httpStatus: number;
  path?: string;
  stack?: string;
};

/**
 * @internal
 */
export type DefaultErrorShape = TRPCErrorShape<DefaultErrorData>;

export const defaultFormatter: ErrorFormatter<any, any> = ({ shape }) => {
  return shape;
};
