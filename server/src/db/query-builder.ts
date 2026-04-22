import { set } from 'es-toolkit/compat';
import { GroupDefine, RuleDefine } from '@project/define';
import {
  and,
  or,
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  between,
  notBetween,
  ilike,
  notIlike,
  sql,
  SQLWrapper,
  Column,
  ColumnBaseConfig,
  ColumnDataType,
  AnyColumn,
} from 'drizzle-orm';
import * as v from 'valibot';
// 小问题,一个是null判断,一个是类型转换
export function buildJsonPathSql(column: AnyColumn, path: string[]) {
  if (path.length === 1) {
    return sql`(${column} ->> ${path[0]})`.inlineParams();
  }

  throw '未实现';
  // const parts: string[] = [];
  // for (let i = 0; i < path.length; i++) {
  //   const escapedKey = sql`${path[i]}`.inlineParams();
  //   if (i === path.length - 1) {
  //     parts.push(`->> ${escapedKey}`);
  //   } else {
  //     parts.push(`-> ${escapedKey}`);
  //   }
  // }

  // return `(${field} ${parts.join(' ')})`;
}

const operatorToDrizzle = {
  eq: eq,
  ne: ne,
  lt: lt,
  gt: gt,
  lte: lte,
  gte: gte,
  contains: ilike,
  beginsWith: ilike,
  endsWith: ilike,
  doesNotContain: notIlike,
  doesNotBeginWith: notIlike,
  doesNotEndWith: notIlike,
  null: isNull,
  notNull: isNotNull,
  in: inArray,
  notIn: notInArray,
  between: between,
  notBetween: notBetween,
  or: or,
} as const;
type TableDefine = Record<
  string,
  Column<ColumnBaseConfig<ColumnDataType, string>>
>;
// 定义默认,2输入默认模板+动态模板
type ReturnValue = ReturnType<
  (typeof operatorToDrizzle)[keyof typeof operatorToDrizzle]
>;
type JsonQueryBuildRule<T extends string = string> = {
  field: string;
  operator: T;
  value: any[];
  keyPath: string[];
  driver: 'json';
};
type QueryBuildRule<T extends string = string> =
  | {
      field: string;
      operator: T;
      value: any[];
    }
  | JsonQueryBuildRule<T>;

export function buildCondition<T extends keyof typeof operatorToDrizzle>(
  item: QueryBuildRule<T>,
  tableSchema: TableDefine,
): NonNullable<ReturnValue> {
  const { field, operator, value } = item;
  const drizzleFn = operatorToDrizzle[operator] as any;

  if (!drizzleFn) {
    throw new Error(`Unsupported operator: ${operator}`);
  }
  let fieldRef;
  if ('driver' in item && item.driver === 'json') {
    fieldRef = buildJsonPathSql(tableSchema[field], item.keyPath);
  } else {
    fieldRef = tableSchema[field];
  }

  if (!fieldRef) {
    throw new Error(`Field not found: ${field}`);
  }

  // 0值
  if (operator === 'null' || operator === 'notNull') {
    return drizzleFn(fieldRef);
  }
  // 范围2值
  if (operator === 'between' || operator === 'notBetween') {
    return drizzleFn(fieldRef, value[0], value[1]);
  }
  if (operator === 'or') {
    return or(...value.map((item) => buildCondition(item, tableSchema)))!;
  }

  // 默认1
  const singleValue = value[0];

  if (operator === 'beginsWith' || operator === 'doesNotBeginWith') {
    return drizzleFn(fieldRef, `${singleValue}%`);
  }

  if (operator === 'endsWith' || operator === 'doesNotEndWith') {
    return drizzleFn(fieldRef, `%${singleValue}`);
  }

  if (operator === 'contains' || operator === 'doesNotContain') {
    return drizzleFn(fieldRef, `%${singleValue}%`);
  }

  return drizzleFn(fieldRef, singleValue);
}

/**
 * 递归构建查询条件
 * @param groupOrRule Group 或 Rule
 * @param tableSchema 表 schema
 */
export function buildQueryCondition(
  groupOrRule: v.InferInput<typeof GroupDefine | typeof RuleDefine>,
  tableSchema: TableDefine,
): SQLWrapper[] {
  if (groupOrRule.type === 'group') {
    const rules = groupOrRule.rules.flatMap((rule) =>
      buildQueryCondition(rule, tableSchema),
    );

    if (rules.length === 0) {
      return [];
    }

    if (rules.length === 1) {
      return rules;
    }

    // 根据 combinator 使用 and 或 or
    if (groupOrRule.combinator === 'or') {
      return [or(...rules)!];
    } else {
      return [and(...rules)!];
    }
  } else {
    // rule 类型
    const value = groupOrRule.value;
    const operator = groupOrRule.operator;

    // 处理可选字段
    if (groupOrRule.optional && (value === undefined || !value.length)) {
      return [];
    }

    return [buildCondition(groupOrRule as any, tableSchema)];
  }
}

/**
 * 将 GroupDefine 值转换为 Drizzle where 查询条件
 * @param groupOrRule Group 或 Rule
 * @param tableSchema 表 schema
 * @returns Drizzle where 条件
 */
export function convertToDrizzleWhere(
  template: v.InferOutput<typeof GroupDefine>,
  value: { keyPath: (string | number)[]; value: any }[],
  tableSchema: TableDefine,
) {
  for (const item of value) {
    set(template, item.keyPath, item.value);
  }
  const result = v.parse(GroupDefine, template);
  const condition = buildQueryCondition(result, tableSchema);
  return condition;
}
