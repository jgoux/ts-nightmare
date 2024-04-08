
      declare module "@snaplet/seed/config" {
        type ScalarField = {
  name: string;
  type: string;
};
type ObjectField = ScalarField & {
  relationFromFields: string[];
  relationToFields: string[];
};
type Inflection = {
  modelName?: (name: string) => string;
  scalarField?: (field: ScalarField) => string;
  parentField?: (field: ObjectField, oppositeBaseNameMap: Record<string, string>) => string;
  childField?: (field: ObjectField, oppositeField: ObjectField, oppositeBaseNameMap: Record<string, string>) => string;
  oppositeBaseNameMap?: Record<string, string>;
};
type Override = {
  comment?: {
    name?: string;
    fields?: {
      id?: string;
      content?: string;
      author_id?: string;
      post_id?: string;
      written_at?: string;
      post?: string;
      user?: string;
    };
  }
  post?: {
    name?: string;
    fields?: {
      id?: string;
      title?: string;
      content?: string;
      author_id?: string;
      user?: string;
      comment?: string;
    };
  }
  user?: {
    name?: string;
    fields?: {
      id?: string;
      username?: string;
      email?: string;
      comment?: string;
      post?: string;
    };
  }}
export type Alias = {
  /**
   * Apply a global renaming strategy to all tables and columns in the generated Seed Client.
   *
   * When `true`, a default strategy is applied:
   *
   * - **Model names:** pluralized and camelCased.
   * - **Scalar field names:** camelCased.
   * - **Parent field names (one to one relationships):** singularized and camelCased.
   * - **Child field names (one to many relationships):** pluralized and camelCased.
   * - We also support prefix extraction and opposite baseName for foreign keys inspired by [PostGraphile](https://github.com/graphile/pg-simplify-inflector#naming-your-foreign-key-fields).
   *
   * @example
   * ```ts seed.client.ts
   * import { defineConfig } from "@snaplet/seed/config";
   *
   * export default defineConfig({
   *   alias: {
   *     inflection: true,
   *   },
   * });
   * ```
   */
  inflection?: Inflection | boolean;
  /**
   * Rename specific tables and columns in the generated Seed Client.
   * This option is useful for resolving renaming conflicts that can arise when using `alias.inflection`.
   *
   * @example
   * ```ts seed.client.ts
   * import { defineConfig } from "@snaplet/seed/config";
   *
   * export default defineConfig({
   *   alias: {
   *     override: {
   *       Book: {
   *         name: "books",
   *         fields: {
   *           User: "author",
   *           published_at: "publishedAt",
   *         },
   *       },
   *     },
   *   },
   * });
   * ```
   */
  override?: Override;
};
interface FingerprintRelationField {
  count?: number | { min?: number; max?: number };
}
interface FingerprintJsonField {
  schema?: any;
}
interface FingerprintDateField {
  options?: {
    minYear?: number;
    maxYear?: number;
  }
}
interface FingerprintNumberField {
  options?: {
    min?: number;
    max?: number;
  }
}
export interface Fingerprint {
  comment?: {
    written_at?: FingerprintDateField;
    post?: FingerprintRelationField;
    user?: FingerprintRelationField;
  }
  post?: {
    user?: FingerprintRelationField;
    comment?: FingerprintRelationField;
  }
  user?: {
    comment?: FingerprintRelationField;
    post?: FingerprintRelationField;
  }}
//#region selectTypes
type PartialRecord<K extends keyof any, T> = {
      [P in K]?: T;
  };
type TablesOptions = 
  "public.comment" |
  "public.post" |
  "public.user"

type SelectOptions = TablesOptions | string
type SelectConfig = Array<SelectOptions>
//#endregion

type TypedConfig = {
  /**
   * The database adapter to use.
   *
   * @example
   * ```ts seed.config.ts
   * import { SeedPostgres } from "@snaplet/seed/adapter-postgres";
   * import { defineConfig } from "@snaplet/seed/config";
   * import postgres from "postgres";
   *
   * export default defineConfig({
   *   adapter: () => {
   *     const client = postgres(process.env.DATABASE_URL);
   *     return new SeedPostgres(client);
   *   },
   * });
   * ```
   *
   * To learn more about the available adapters, see the [Adapters](https://docs.snaplet.dev/seed/reference/adapters) reference.
   */
  adapter: () => import("@snaplet/seed/adapter").DatabaseClient | Promise<import("@snaplet/seed/adapter").DatabaseClient>;
  /**
   * Customize fields and relationships names.
   */
  alias?: Alias;
  /**
   * Customize the fingerprinting.
   */
  fingerprint?: Fingerprint;
  /**
   * Exclude or include tables from the generated Seed Client.
   * You can specify glob patterns to match tables. The patterns are executed in order.
   *
   * @example Exclude all tables containing `access_logs` and all tables in the `auth` schema:
   * ```ts seed.client.ts
   * import { defineConfig } from "@snaplet/seed/config";
   *
   * export default defineConfig({
   *   select: ["!*access_logs*", "!auth.*"],
   * });
   * ```
   *
   * @example Exclude all tables except the `public` schema:
   * ```ts seed.client.ts
   * import { defineConfig } from "@snaplet/seed/config";
   *
   * export default defineConfig({
   *   select: ["!*", "public.*"],
   * });
   * ```
   */
    select?: SelectConfig;
  };

  export function defineConfig(
    config: TypedConfig
  ): TypedConfig;
      }