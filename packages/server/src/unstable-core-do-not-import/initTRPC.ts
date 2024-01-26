import { createFlatProxy } from './createProxy';
import type { DefaultErrorData } from './error/formatter';
import { defaultFormatter, type ErrorFormatter } from './error/formatter';
import { createMiddlewareFactory } from './middleware';
import { createBuilder } from './procedureBuilder';
import type { CreateRootTypes } from './rootConfig';
import { isServerDefault, type RootConfig } from './rootConfig';
import {
  createCallerFactory,
  createRouterFactory,
  mergeRouters,
} from './router';
import type { DataTransformerOptions } from './transformer';
import { defaultTransformer, getDataTransformer } from './transformer';
import type { Unwrap } from './types';

type ErrorFormatterOptions<TContext, TErrorData extends object> =
  | {
      /**
       * Use custom error formatting
       * @link https://trpc.io/docs/v11/error-formatting
       */
      errorFormatter?: ErrorFormatter<TContext, DefaultErrorData>;
    }
  | {
      /**
       * Use custom error formatting
       * @link https://trpc.io/docs/v11/error-formatting
       */
      errorFormatter: ErrorFormatter<TContext, TErrorData>;
    };
type TransformerOptions<TTransformer extends boolean> =
  TTransformer extends true
    ? {
        /**
         * Use a data transformer
         * @link https://trpc.io/docs/v11/data-transformers
         */
        transformer: DataTransformerOptions;
      }
    : {
        /**
         * Use a data transformer
         * @link https://trpc.io/docs/v11/data-transformers
         */
        transformer?: DataTransformerOptions;
      };

type RuntimeConfigOptions<
  TContext extends object,
  TMeta extends object,
  TErrorData extends object,
  TTransformer extends boolean,
> = Partial<
  Omit<
    RootConfig<{
      ctx: TContext;
      meta: TMeta;
      errorData: any;
      transformer: any;
    }>,
    '$types' | 'transformer' | 'errorFormatter'
  >
> &
  TransformerOptions<TTransformer> &
  ErrorFormatterOptions<TContext, TErrorData>;

class TRPCBuilder<TContext extends object, TMeta extends object> {
  /**
   * Add a context shape as a generic to the root object
   * @link https://trpc.io/docs/v11/server/context
   */
  context<TNewContext extends object | ((...args: unknown[]) => object)>() {
    return new TRPCBuilder<Unwrap<TNewContext>, TMeta>();
  }

  /**
   * Add a meta shape as a generic to the root object
   * @link https://trpc.io/docs/v11/quickstart
   */
  meta<TNewMeta extends object>() {
    return new TRPCBuilder<TContext, TNewMeta>();
  }

  /**
   * Create the root object
   * @link https://trpc.io/docs/v11/server/routers#initialize-trpc
   */
  create<
    TErrorData extends object = DefaultErrorData,
    TTransformer extends boolean = false,
  >(opts?: RuntimeConfigOptions<TContext, TMeta, TErrorData, TTransformer>) {
    type $Root = CreateRootTypes<{
      ctx: TContext;
      meta: TMeta;
      errorData: TErrorData;
      transformer: TTransformer;
    }>;

    const errorFormatter: ErrorFormatter<TContext, any> =
      opts?.errorFormatter ?? defaultFormatter;
    const transformer = getDataTransformer(
      opts?.transformer ?? defaultTransformer,
    );

    const NODE_ENV = globalThis.process?.env?.NODE_ENV;
    const isDev: boolean = opts?.isDev ?? NODE_ENV !== 'production';

    const config: RootConfig<$Root> = {
      transformer,
      isDev,
      allowOutsideOfServer: opts?.allowOutsideOfServer ?? false,
      errorFormatter,
      isServer: opts?.isServer ?? isServerDefault,
      /**
       * These are just types, they can't be used at runtime
       * @internal
       */
      $types: createFlatProxy((key) => {
        throw new Error(
          `Tried to access "$types.${key}" which is not available at runtime`,
        );
      }),
    };

    {
      // Server check
      const isServer: boolean = opts?.isServer ?? isServerDefault;

      if (!isServer && opts?.allowOutsideOfServer !== true) {
        throw new Error(
          `You're trying to use @trpc/server in a non-server environment. This is not supported by default.`,
        );
      }
    }
    return {
      /**
       * Your router config
       * @internal
       */
      _config: config,
      /**
       * Builder object for creating procedures
       * @link https://trpc.io/docs/v11/server/procedures
       */
      procedure: createBuilder<$Root['ctx'], $Root['meta']>({
        meta: opts?.defaultMeta,
      }),
      /**
       * Create reusable middlewares
       * @link https://trpc.io/docs/v11/server/middlewares
       */
      middleware: createMiddlewareFactory<$Root['ctx'], $Root['meta']>(),
      /**
       * Create a router
       * @link https://trpc.io/docs/v11/server/routers
       */
      router: createRouterFactory<$Root>(config),
      /**
       * Merge Routers
       * @link https://trpc.io/docs/v11/server/merging-routers
       */
      mergeRouters,
      /**
       * Create a server-side caller for a router
       * @link https://trpc.io/docs/v11/server/server-side-calls
       */
      createCallerFactory: createCallerFactory<$Root>(),
    };
  }
}

/**
 * Builder to initialize the tRPC root object - use this exactly once per backend
 * @link https://trpc.io/docs/v11/quickstart
 */
export const initTRPC = new TRPCBuilder();
