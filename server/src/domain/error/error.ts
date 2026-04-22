import { TRPCError } from '@trpc/server';
import { TRPC_ERROR_CODE_KEY } from '@trpc/server';

export const ACCOUNT_UNDEFINED = new TRPCError({
  code: 'UNAUTHORIZED',
  message: '账户登录失败',
});
export const ACCOUNT_FAILED = (code: string = '') =>
  new TRPCError({
    code: 'UNAUTHORIZED',
    message: `鉴权失败-${code}`,
  });
export const ACTION_CROSS_BORDER = new TRPCError({
  code: 'BAD_REQUEST',
  message: '动作查询越界',
});
// export const CODE_VERSION_ERROR=new TRPCError({
//   code:'BAD_REQUEST',message:'版本'
// })
export class CustomError extends TRPCError {
  constructor(
    arg1: {
      message?: string;
      code: TRPC_ERROR_CODE_KEY;
      cause?: unknown;
    },
    public data: any,
  ) {
    super(arg1);
  }
}
