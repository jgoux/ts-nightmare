import { type DatabaseClient } from "@snaplet/seed/adapter";
type JsonPrimitive = null | number | string | boolean;
type Nested<V> = V | { [s: string]: V | Nested<V> } | Array<V | Nested<V>>;
type Json = Nested<JsonPrimitive>;
type MinMaxOption = { min?: number; max?: number };
type ColumnValueCallbackContext<TScalars> = {
  /**
   * The seed of the field.
   *
   * @example
   * ```ts
   * "<hash>/0/users/0/email"
   * ```
   */
  seed: string;

  /**
   * The fields already generated for this model.
   *
   * @example
   * ```ts
   * { email: "user@example.org" }
   * ```
   */
  data: Partial<TScalars>;

  /**
   * The store containing models already created in this plan.
   *
   * @example
   * ```ts
   * { posts: [{ id: 1, authorId: 1 }], authors: [{ id: 1 }] }
   * ```
   */
  store: Store

  /**
   * The global store containing all models created in this `snaplet` instance so far.
   *
   * @example
   * ```ts
   * { posts: [{ id: 1, authorId: 1 }], authors: [{ id: 1 }] }
   * ```
   */
  $store: Store

  options: Record<string, unknown> | undefined
};

/**
 * helper type to get the possible values of a scalar field
 */
type ColumnValue<T, TScalars> = T | ((ctx: ColumnValueCallbackContext<TScalars>) => T | Promise<T>);

/**
 * helper type to map a record of scalars to a record of ColumnValue
 */
type MapToColumnValue<T> = { [K in keyof T]: ColumnValue<T[K], T> };

/**
 * Create an array of `n` models.
 *
 * Can be read as "Generate `model` times `n`".
 *
 * @param `n` The number of models to generate.
 * @param `callbackFn` The `x` function calls the `callbackFn` function one time for each element in the array.
 *
 * @example Generate 10 users:
 * ```ts
 * seed.users((x) => x(10));
 * ```
 *
 * @example Generate 3 projects with a specific name:
 * ```ts
 * seed.projects((x) => x(3, { name: 'Project Name' }));
 * ```
 *
 * @example Generate 3 projects with a specific name depending on the index:
 * ```ts
 * seed.projects((x) => x(3, ({ index }) => ({ name: `Project ${index}` })));
 * ```
 */
declare function xCallbackFn<T>(
  n: number | MinMaxOption,
  callbackFn?: T
): Array<T>;

type ChildCallbackInputs<T> = (
  x: typeof xCallbackFn<T>,
) => Array<T>;

type ChildModelCallback<T> = (ctx: ModelCallbackContext & { index: number }) => T

type ChildModel<T> = T | ChildModelCallback<T>

/**
 * all the possible types for a child field
 */
type ChildInputs<T> = Array<ChildModel<T>> | ChildCallbackInputs<ChildModel<T>>;

/**
 * omit some keys TKeys from a child field
 * @example we remove ExecTask from the Snapshot child field values as we're coming from ExecTask
 * type ExecTaskChildrenInputs = {
 *   Snapshot: OmitChildInputs<SnapshotChildInputs, "ExecTask">;
 * };
 */
type OmitChildInputs<T, TKeys extends string> = T extends ChildCallbackInputs<ChildModel<
  infer U
>>
  ? ChildCallbackInputs<ChildModel<Omit<U, TKeys>>>
  : T extends Array<ChildModel<infer U>>
  ? Array<ChildModel<Omit<U, TKeys>>>
  : never;

type ConnectCallbackContext = {
  /**
   * The index of the current iteration.
   */
  index: number;

  /**
   * The seed of the relationship field.
   */
  seed: string;

  /**
   * The store containing models already created in this plan.
   *
   * @example
   * ```ts
   * { posts: [{ id: 1, authorId: 1 }], authors: [{ id: 1 }] }
   * ```
   */
  store: Store

  /**
   * The global store containing all models created in this `snaplet` instance so far.
   *
   * @example
   * ```ts
   * { posts: [{ id: 1, authorId: 1 }], authors: [{ id: 1 }] }
   * ```
   */
  $store: Store
};

/**
 * the callback function we can pass to a parent field to connect it to another model
 * @example
 * seed.posts([({ connect }) => ({ user: connect((ctx) => ({ id: ctx.store.User[0] })) }))
 */
type ConnectCallback<T> = (
  ctx: ConnectCallbackContext
) => T;

type ModelCallbackContextConnect<T> =  (cb: ConnectCallback<T>) => Connect<T>

type ModelCallbackContext = {
  /**
   * The seed of the model.
   */
  seed: string;

  /**
   * The store containing models already created in this plan.
   *
   * @example
   * ```ts
   * { posts: [{ id: 1, authorId: 1 }], authors: [{ id: 1 }] }
   * ```
   */
  store: Store

  /**
   * The global store containing all models created in this `snaplet` instance so far.
   *
   * @example
   * ```ts
   * { posts: [{ id: 1, authorId: 1 }], authors: [{ id: 1 }] }
   * ```
   */
  $store: Store
}

type ModelCallback<T> = (ctx: ModelCallbackContext) => T

type ParentModelCallback<T, TScalars> = (ctx: ModelCallbackContext & {
  connect: ModelCallbackContextConnect<TScalars>
}) => T | Connect<TScalars>

type ParentInputs<T, TScalars> =
  | T
  | ParentModelCallback<T, TScalars>;

declare class Connect<TScalars> {
  private callback: ConnectCallback<TScalars>
}

/**
 * omit some keys TKeys from a parent field
 * @example we remove Member from the Organization and User parent fields values as we're coming from Member
 * type MemberParentsInputs = {
 *   Organization: OmitParentInputs<OrganizationParentInputs, "Member">;
 *   User: OmitParentInputs<UserParentInputs, "Member">;
 * };
 */
type OmitParentInputs<
  T,
  TKeys extends string
> = T extends ParentModelCallback<infer U, infer V>
  ? ParentModelCallback<Omit<U, TKeys>, V>
  : Omit<T, TKeys>;

/**
 * compute the inputs type for a given model
 */
type Inputs<TScalars, TParents, TChildren> = Partial<
  MapToColumnValue<TScalars> & TParents & TChildren
>;

/**
 * the configurable map of models' generate and connect functions
 */
export type UserModels = {
  [KStore in keyof Store]?: Store[KStore] extends Array<
    infer TFields extends Record<string, any>
  >
    ? {
        connect?: (ctx: { store: Store }) => TFields;
        data?: Partial<MapToColumnValue<TFields>>;
      }
    : never;
};

type PlanOptions = {
  /**
   * Connect the missing relationships to one of the corresponding models in the store.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/seed#using-autoconnect-option | documentation}.
   */
  connect?: true | Partial<Store>;
  /**
   * Provide custom data generation and connect functions for this plan.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/seed#using-autoconnect-option | documentation}.
   */
  models?: UserModels;
  /**
   * Use a custom seed for this plan.
   */
  seed?: string;
};

/**
 * the plan is extending PromiseLike so it can be awaited
 * @example
 * await seed.User({ name: "John" });
 */
export interface Plan extends PromiseLike<Store> {

}
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
type Store = {
  comment: Array<commentScalars>;
  post: Array<postScalars>;
  user: Array<userScalars>;
};

type commentScalars = {
  /**
   * Column `comment.id`.
   */
  id: string;
  /**
   * Column `comment.content`.
   */
  content: string;
  /**
   * Column `comment.author_id`.
   */
  author_id: string;
  /**
   * Column `comment.post_id`.
   */
  post_id: string;
  /**
   * Column `comment.written_at`.
   */
  written_at?: ( Date | string );
}
type commentParentsInputs = {
  /**
   * Relationship from table `comment` to table `post` through the column `comment.post_id`.
   */
  post: OmitParentInputs<postParentInputs, "comment">;
  /**
   * Relationship from table `comment` to table `user` through the column `comment.author_id`.
   */
  user: OmitParentInputs<userParentInputs, "comment">;
};
type commentChildrenInputs = {

};
type commentInputs = Inputs<
  commentScalars,
  commentParentsInputs,
  commentChildrenInputs
>;
type commentChildInputs = ChildInputs<commentInputs>;
type commentParentInputs = ParentInputs<commentInputs, commentScalars>;
type postScalars = {
  /**
   * Column `post.id`.
   */
  id: string;
  /**
   * Column `post.title`.
   */
  title: string;
  /**
   * Column `post.content`.
   */
  content: string;
  /**
   * Column `post.author_id`.
   */
  author_id: string;
}
type postParentsInputs = {
  /**
   * Relationship from table `post` to table `user` through the column `post.author_id`.
   */
  user: OmitParentInputs<userParentInputs, "post">;
};
type postChildrenInputs = {
  /**
  * Relationship from table `post` to table `comment` through the column `comment.post_id`.
  */
  comment: OmitChildInputs<commentChildInputs, "post" | "post_id">;
};
type postInputs = Inputs<
  postScalars,
  postParentsInputs,
  postChildrenInputs
>;
type postChildInputs = ChildInputs<postInputs>;
type postParentInputs = ParentInputs<postInputs, postScalars>;
type userScalars = {
  /**
   * Column `user.id`.
   */
  id: string;
  /**
   * Column `user.username`.
   */
  username: string;
  /**
   * Column `user.email`.
   */
  email: string;
}
type userParentsInputs = {

};
type userChildrenInputs = {
  /**
  * Relationship from table `user` to table `comment` through the column `comment.author_id`.
  */
  comment: OmitChildInputs<commentChildInputs, "user" | "author_id">;
  /**
  * Relationship from table `user` to table `post` through the column `post.author_id`.
  */
  post: OmitChildInputs<postChildInputs, "user" | "author_id">;
};
type userInputs = Inputs<
  userScalars,
  userParentsInputs,
  userChildrenInputs
>;
type userChildInputs = ChildInputs<userInputs>;
type userParentInputs = ParentInputs<userInputs, userScalars>;
export declare class SeedClient {
  /**
   * Generate one or more `comment`.
   * @example With static inputs:
   * ```ts
   * seed.comment([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * seed.comment((x) => x(3));
   * seed.comment((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * seed.comment((x) => [{}, ...x(3), {}]);
   * ```
   */
  comment: (
    inputs: commentChildInputs,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `post`.
   * @example With static inputs:
   * ```ts
   * seed.post([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * seed.post((x) => x(3));
   * seed.post((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * seed.post((x) => [{}, ...x(3), {}]);
   * ```
   */
  post: (
    inputs: postChildInputs,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `user`.
   * @example With static inputs:
   * ```ts
   * seed.user([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * seed.user((x) => x(3));
   * seed.user((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * seed.user((x) => [{}, ...x(3), {}]);
   * ```
   */
  user: (
    inputs: userChildInputs,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Delete all data in the database while preserving the database structure.
   */
  $resetDatabase(selectConfig?: SelectConfig): Promise<unknown>;

  /**
   * Get the global store.
   */
  $store: Store;
}

  export type SeedClientOptions = {
    adapter?: DatabaseClient;
    dryRun?: boolean;
    models?: UserModels;
  }
  export declare const createSeedClient: (options?: SeedClientOptions) => Promise<SeedClient>