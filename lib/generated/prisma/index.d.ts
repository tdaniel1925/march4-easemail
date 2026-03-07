
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Organization
 * 
 */
export type Organization = $Result.DefaultSelection<Prisma.$OrganizationPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model MsConnectedAccount
 * 
 */
export type MsConnectedAccount = $Result.DefaultSelection<Prisma.$MsConnectedAccountPayload>
/**
 * Model MsalTokenCache
 * 
 */
export type MsalTokenCache = $Result.DefaultSelection<Prisma.$MsalTokenCachePayload>
/**
 * Model EmailDeltaLink
 * 
 */
export type EmailDeltaLink = $Result.DefaultSelection<Prisma.$EmailDeltaLinkPayload>
/**
 * Model WebhookSubscription
 * 
 */
export type WebhookSubscription = $Result.DefaultSelection<Prisma.$WebhookSubscriptionPayload>
/**
 * Model Draft
 * 
 */
export type Draft = $Result.DefaultSelection<Prisma.$DraftPayload>
/**
 * Model Signature
 * 
 */
export type Signature = $Result.DefaultSelection<Prisma.$SignaturePayload>
/**
 * Model CachedFolder
 * 
 */
export type CachedFolder = $Result.DefaultSelection<Prisma.$CachedFolderPayload>
/**
 * Model CachedEmail
 * 
 */
export type CachedEmail = $Result.DefaultSelection<Prisma.$CachedEmailPayload>
/**
 * Model CachedCalendarEvent
 * 
 */
export type CachedCalendarEvent = $Result.DefaultSelection<Prisma.$CachedCalendarEventPayload>
/**
 * Model CachedContact
 * 
 */
export type CachedContact = $Result.DefaultSelection<Prisma.$CachedContactPayload>
/**
 * Model DeployLog
 * 
 */
export type DeployLog = $Result.DefaultSelection<Prisma.$DeployLogPayload>
/**
 * Model EmailRule
 * 
 */
export type EmailRule = $Result.DefaultSelection<Prisma.$EmailRulePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Organizations
 * const organizations = await prisma.organization.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Organizations
   * const organizations = await prisma.organization.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.organization`: Exposes CRUD operations for the **Organization** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organizations
    * const organizations = await prisma.organization.findMany()
    * ```
    */
  get organization(): Prisma.OrganizationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.msConnectedAccount`: Exposes CRUD operations for the **MsConnectedAccount** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MsConnectedAccounts
    * const msConnectedAccounts = await prisma.msConnectedAccount.findMany()
    * ```
    */
  get msConnectedAccount(): Prisma.MsConnectedAccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.msalTokenCache`: Exposes CRUD operations for the **MsalTokenCache** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MsalTokenCaches
    * const msalTokenCaches = await prisma.msalTokenCache.findMany()
    * ```
    */
  get msalTokenCache(): Prisma.MsalTokenCacheDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.emailDeltaLink`: Exposes CRUD operations for the **EmailDeltaLink** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmailDeltaLinks
    * const emailDeltaLinks = await prisma.emailDeltaLink.findMany()
    * ```
    */
  get emailDeltaLink(): Prisma.EmailDeltaLinkDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.webhookSubscription`: Exposes CRUD operations for the **WebhookSubscription** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WebhookSubscriptions
    * const webhookSubscriptions = await prisma.webhookSubscription.findMany()
    * ```
    */
  get webhookSubscription(): Prisma.WebhookSubscriptionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.draft`: Exposes CRUD operations for the **Draft** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Drafts
    * const drafts = await prisma.draft.findMany()
    * ```
    */
  get draft(): Prisma.DraftDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.signature`: Exposes CRUD operations for the **Signature** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Signatures
    * const signatures = await prisma.signature.findMany()
    * ```
    */
  get signature(): Prisma.SignatureDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cachedFolder`: Exposes CRUD operations for the **CachedFolder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CachedFolders
    * const cachedFolders = await prisma.cachedFolder.findMany()
    * ```
    */
  get cachedFolder(): Prisma.CachedFolderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cachedEmail`: Exposes CRUD operations for the **CachedEmail** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CachedEmails
    * const cachedEmails = await prisma.cachedEmail.findMany()
    * ```
    */
  get cachedEmail(): Prisma.CachedEmailDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cachedCalendarEvent`: Exposes CRUD operations for the **CachedCalendarEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CachedCalendarEvents
    * const cachedCalendarEvents = await prisma.cachedCalendarEvent.findMany()
    * ```
    */
  get cachedCalendarEvent(): Prisma.CachedCalendarEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cachedContact`: Exposes CRUD operations for the **CachedContact** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CachedContacts
    * const cachedContacts = await prisma.cachedContact.findMany()
    * ```
    */
  get cachedContact(): Prisma.CachedContactDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.deployLog`: Exposes CRUD operations for the **DeployLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DeployLogs
    * const deployLogs = await prisma.deployLog.findMany()
    * ```
    */
  get deployLog(): Prisma.DeployLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.emailRule`: Exposes CRUD operations for the **EmailRule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmailRules
    * const emailRules = await prisma.emailRule.findMany()
    * ```
    */
  get emailRule(): Prisma.EmailRuleDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.2
   * Query Engine version: 94a226be1cf2967af2541cca5529f0f7ba866919
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Organization: 'Organization',
    User: 'User',
    MsConnectedAccount: 'MsConnectedAccount',
    MsalTokenCache: 'MsalTokenCache',
    EmailDeltaLink: 'EmailDeltaLink',
    WebhookSubscription: 'WebhookSubscription',
    Draft: 'Draft',
    Signature: 'Signature',
    CachedFolder: 'CachedFolder',
    CachedEmail: 'CachedEmail',
    CachedCalendarEvent: 'CachedCalendarEvent',
    CachedContact: 'CachedContact',
    DeployLog: 'DeployLog',
    EmailRule: 'EmailRule'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "organization" | "user" | "msConnectedAccount" | "msalTokenCache" | "emailDeltaLink" | "webhookSubscription" | "draft" | "signature" | "cachedFolder" | "cachedEmail" | "cachedCalendarEvent" | "cachedContact" | "deployLog" | "emailRule"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Organization: {
        payload: Prisma.$OrganizationPayload<ExtArgs>
        fields: Prisma.OrganizationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findFirst: {
            args: Prisma.OrganizationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findMany: {
            args: Prisma.OrganizationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          create: {
            args: Prisma.OrganizationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          createMany: {
            args: Prisma.OrganizationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          delete: {
            args: Prisma.OrganizationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          update: {
            args: Prisma.OrganizationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          deleteMany: {
            args: Prisma.OrganizationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          upsert: {
            args: Prisma.OrganizationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          aggregate: {
            args: Prisma.OrganizationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganization>
          }
          groupBy: {
            args: Prisma.OrganizationGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      MsConnectedAccount: {
        payload: Prisma.$MsConnectedAccountPayload<ExtArgs>
        fields: Prisma.MsConnectedAccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MsConnectedAccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MsConnectedAccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload>
          }
          findFirst: {
            args: Prisma.MsConnectedAccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MsConnectedAccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload>
          }
          findMany: {
            args: Prisma.MsConnectedAccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload>[]
          }
          create: {
            args: Prisma.MsConnectedAccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload>
          }
          createMany: {
            args: Prisma.MsConnectedAccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MsConnectedAccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload>[]
          }
          delete: {
            args: Prisma.MsConnectedAccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload>
          }
          update: {
            args: Prisma.MsConnectedAccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload>
          }
          deleteMany: {
            args: Prisma.MsConnectedAccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MsConnectedAccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MsConnectedAccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload>[]
          }
          upsert: {
            args: Prisma.MsConnectedAccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsConnectedAccountPayload>
          }
          aggregate: {
            args: Prisma.MsConnectedAccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMsConnectedAccount>
          }
          groupBy: {
            args: Prisma.MsConnectedAccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<MsConnectedAccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.MsConnectedAccountCountArgs<ExtArgs>
            result: $Utils.Optional<MsConnectedAccountCountAggregateOutputType> | number
          }
        }
      }
      MsalTokenCache: {
        payload: Prisma.$MsalTokenCachePayload<ExtArgs>
        fields: Prisma.MsalTokenCacheFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MsalTokenCacheFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MsalTokenCacheFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload>
          }
          findFirst: {
            args: Prisma.MsalTokenCacheFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MsalTokenCacheFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload>
          }
          findMany: {
            args: Prisma.MsalTokenCacheFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload>[]
          }
          create: {
            args: Prisma.MsalTokenCacheCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload>
          }
          createMany: {
            args: Prisma.MsalTokenCacheCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MsalTokenCacheCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload>[]
          }
          delete: {
            args: Prisma.MsalTokenCacheDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload>
          }
          update: {
            args: Prisma.MsalTokenCacheUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload>
          }
          deleteMany: {
            args: Prisma.MsalTokenCacheDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MsalTokenCacheUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MsalTokenCacheUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload>[]
          }
          upsert: {
            args: Prisma.MsalTokenCacheUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MsalTokenCachePayload>
          }
          aggregate: {
            args: Prisma.MsalTokenCacheAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMsalTokenCache>
          }
          groupBy: {
            args: Prisma.MsalTokenCacheGroupByArgs<ExtArgs>
            result: $Utils.Optional<MsalTokenCacheGroupByOutputType>[]
          }
          count: {
            args: Prisma.MsalTokenCacheCountArgs<ExtArgs>
            result: $Utils.Optional<MsalTokenCacheCountAggregateOutputType> | number
          }
        }
      }
      EmailDeltaLink: {
        payload: Prisma.$EmailDeltaLinkPayload<ExtArgs>
        fields: Prisma.EmailDeltaLinkFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmailDeltaLinkFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmailDeltaLinkFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload>
          }
          findFirst: {
            args: Prisma.EmailDeltaLinkFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmailDeltaLinkFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload>
          }
          findMany: {
            args: Prisma.EmailDeltaLinkFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload>[]
          }
          create: {
            args: Prisma.EmailDeltaLinkCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload>
          }
          createMany: {
            args: Prisma.EmailDeltaLinkCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmailDeltaLinkCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload>[]
          }
          delete: {
            args: Prisma.EmailDeltaLinkDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload>
          }
          update: {
            args: Prisma.EmailDeltaLinkUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload>
          }
          deleteMany: {
            args: Prisma.EmailDeltaLinkDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmailDeltaLinkUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmailDeltaLinkUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload>[]
          }
          upsert: {
            args: Prisma.EmailDeltaLinkUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailDeltaLinkPayload>
          }
          aggregate: {
            args: Prisma.EmailDeltaLinkAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmailDeltaLink>
          }
          groupBy: {
            args: Prisma.EmailDeltaLinkGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmailDeltaLinkGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmailDeltaLinkCountArgs<ExtArgs>
            result: $Utils.Optional<EmailDeltaLinkCountAggregateOutputType> | number
          }
        }
      }
      WebhookSubscription: {
        payload: Prisma.$WebhookSubscriptionPayload<ExtArgs>
        fields: Prisma.WebhookSubscriptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WebhookSubscriptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WebhookSubscriptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload>
          }
          findFirst: {
            args: Prisma.WebhookSubscriptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WebhookSubscriptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload>
          }
          findMany: {
            args: Prisma.WebhookSubscriptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload>[]
          }
          create: {
            args: Prisma.WebhookSubscriptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload>
          }
          createMany: {
            args: Prisma.WebhookSubscriptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WebhookSubscriptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload>[]
          }
          delete: {
            args: Prisma.WebhookSubscriptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload>
          }
          update: {
            args: Prisma.WebhookSubscriptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload>
          }
          deleteMany: {
            args: Prisma.WebhookSubscriptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WebhookSubscriptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WebhookSubscriptionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload>[]
          }
          upsert: {
            args: Prisma.WebhookSubscriptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookSubscriptionPayload>
          }
          aggregate: {
            args: Prisma.WebhookSubscriptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWebhookSubscription>
          }
          groupBy: {
            args: Prisma.WebhookSubscriptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<WebhookSubscriptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.WebhookSubscriptionCountArgs<ExtArgs>
            result: $Utils.Optional<WebhookSubscriptionCountAggregateOutputType> | number
          }
        }
      }
      Draft: {
        payload: Prisma.$DraftPayload<ExtArgs>
        fields: Prisma.DraftFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DraftFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DraftFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>
          }
          findFirst: {
            args: Prisma.DraftFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DraftFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>
          }
          findMany: {
            args: Prisma.DraftFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>[]
          }
          create: {
            args: Prisma.DraftCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>
          }
          createMany: {
            args: Prisma.DraftCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DraftCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>[]
          }
          delete: {
            args: Prisma.DraftDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>
          }
          update: {
            args: Prisma.DraftUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>
          }
          deleteMany: {
            args: Prisma.DraftDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DraftUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DraftUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>[]
          }
          upsert: {
            args: Prisma.DraftUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>
          }
          aggregate: {
            args: Prisma.DraftAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDraft>
          }
          groupBy: {
            args: Prisma.DraftGroupByArgs<ExtArgs>
            result: $Utils.Optional<DraftGroupByOutputType>[]
          }
          count: {
            args: Prisma.DraftCountArgs<ExtArgs>
            result: $Utils.Optional<DraftCountAggregateOutputType> | number
          }
        }
      }
      Signature: {
        payload: Prisma.$SignaturePayload<ExtArgs>
        fields: Prisma.SignatureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SignatureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SignatureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload>
          }
          findFirst: {
            args: Prisma.SignatureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SignatureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload>
          }
          findMany: {
            args: Prisma.SignatureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload>[]
          }
          create: {
            args: Prisma.SignatureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload>
          }
          createMany: {
            args: Prisma.SignatureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SignatureCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload>[]
          }
          delete: {
            args: Prisma.SignatureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload>
          }
          update: {
            args: Prisma.SignatureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload>
          }
          deleteMany: {
            args: Prisma.SignatureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SignatureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SignatureUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload>[]
          }
          upsert: {
            args: Prisma.SignatureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignaturePayload>
          }
          aggregate: {
            args: Prisma.SignatureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSignature>
          }
          groupBy: {
            args: Prisma.SignatureGroupByArgs<ExtArgs>
            result: $Utils.Optional<SignatureGroupByOutputType>[]
          }
          count: {
            args: Prisma.SignatureCountArgs<ExtArgs>
            result: $Utils.Optional<SignatureCountAggregateOutputType> | number
          }
        }
      }
      CachedFolder: {
        payload: Prisma.$CachedFolderPayload<ExtArgs>
        fields: Prisma.CachedFolderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CachedFolderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CachedFolderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload>
          }
          findFirst: {
            args: Prisma.CachedFolderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CachedFolderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload>
          }
          findMany: {
            args: Prisma.CachedFolderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload>[]
          }
          create: {
            args: Prisma.CachedFolderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload>
          }
          createMany: {
            args: Prisma.CachedFolderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CachedFolderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload>[]
          }
          delete: {
            args: Prisma.CachedFolderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload>
          }
          update: {
            args: Prisma.CachedFolderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload>
          }
          deleteMany: {
            args: Prisma.CachedFolderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CachedFolderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CachedFolderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload>[]
          }
          upsert: {
            args: Prisma.CachedFolderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedFolderPayload>
          }
          aggregate: {
            args: Prisma.CachedFolderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCachedFolder>
          }
          groupBy: {
            args: Prisma.CachedFolderGroupByArgs<ExtArgs>
            result: $Utils.Optional<CachedFolderGroupByOutputType>[]
          }
          count: {
            args: Prisma.CachedFolderCountArgs<ExtArgs>
            result: $Utils.Optional<CachedFolderCountAggregateOutputType> | number
          }
        }
      }
      CachedEmail: {
        payload: Prisma.$CachedEmailPayload<ExtArgs>
        fields: Prisma.CachedEmailFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CachedEmailFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CachedEmailFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload>
          }
          findFirst: {
            args: Prisma.CachedEmailFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CachedEmailFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload>
          }
          findMany: {
            args: Prisma.CachedEmailFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload>[]
          }
          create: {
            args: Prisma.CachedEmailCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload>
          }
          createMany: {
            args: Prisma.CachedEmailCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CachedEmailCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload>[]
          }
          delete: {
            args: Prisma.CachedEmailDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload>
          }
          update: {
            args: Prisma.CachedEmailUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload>
          }
          deleteMany: {
            args: Prisma.CachedEmailDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CachedEmailUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CachedEmailUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload>[]
          }
          upsert: {
            args: Prisma.CachedEmailUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedEmailPayload>
          }
          aggregate: {
            args: Prisma.CachedEmailAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCachedEmail>
          }
          groupBy: {
            args: Prisma.CachedEmailGroupByArgs<ExtArgs>
            result: $Utils.Optional<CachedEmailGroupByOutputType>[]
          }
          count: {
            args: Prisma.CachedEmailCountArgs<ExtArgs>
            result: $Utils.Optional<CachedEmailCountAggregateOutputType> | number
          }
        }
      }
      CachedCalendarEvent: {
        payload: Prisma.$CachedCalendarEventPayload<ExtArgs>
        fields: Prisma.CachedCalendarEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CachedCalendarEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CachedCalendarEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload>
          }
          findFirst: {
            args: Prisma.CachedCalendarEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CachedCalendarEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload>
          }
          findMany: {
            args: Prisma.CachedCalendarEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload>[]
          }
          create: {
            args: Prisma.CachedCalendarEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload>
          }
          createMany: {
            args: Prisma.CachedCalendarEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CachedCalendarEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload>[]
          }
          delete: {
            args: Prisma.CachedCalendarEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload>
          }
          update: {
            args: Prisma.CachedCalendarEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload>
          }
          deleteMany: {
            args: Prisma.CachedCalendarEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CachedCalendarEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CachedCalendarEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload>[]
          }
          upsert: {
            args: Prisma.CachedCalendarEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCalendarEventPayload>
          }
          aggregate: {
            args: Prisma.CachedCalendarEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCachedCalendarEvent>
          }
          groupBy: {
            args: Prisma.CachedCalendarEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<CachedCalendarEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.CachedCalendarEventCountArgs<ExtArgs>
            result: $Utils.Optional<CachedCalendarEventCountAggregateOutputType> | number
          }
        }
      }
      CachedContact: {
        payload: Prisma.$CachedContactPayload<ExtArgs>
        fields: Prisma.CachedContactFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CachedContactFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CachedContactFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload>
          }
          findFirst: {
            args: Prisma.CachedContactFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CachedContactFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload>
          }
          findMany: {
            args: Prisma.CachedContactFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload>[]
          }
          create: {
            args: Prisma.CachedContactCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload>
          }
          createMany: {
            args: Prisma.CachedContactCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CachedContactCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload>[]
          }
          delete: {
            args: Prisma.CachedContactDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload>
          }
          update: {
            args: Prisma.CachedContactUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload>
          }
          deleteMany: {
            args: Prisma.CachedContactDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CachedContactUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CachedContactUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload>[]
          }
          upsert: {
            args: Prisma.CachedContactUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedContactPayload>
          }
          aggregate: {
            args: Prisma.CachedContactAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCachedContact>
          }
          groupBy: {
            args: Prisma.CachedContactGroupByArgs<ExtArgs>
            result: $Utils.Optional<CachedContactGroupByOutputType>[]
          }
          count: {
            args: Prisma.CachedContactCountArgs<ExtArgs>
            result: $Utils.Optional<CachedContactCountAggregateOutputType> | number
          }
        }
      }
      DeployLog: {
        payload: Prisma.$DeployLogPayload<ExtArgs>
        fields: Prisma.DeployLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeployLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeployLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload>
          }
          findFirst: {
            args: Prisma.DeployLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeployLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload>
          }
          findMany: {
            args: Prisma.DeployLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload>[]
          }
          create: {
            args: Prisma.DeployLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload>
          }
          createMany: {
            args: Prisma.DeployLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeployLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload>[]
          }
          delete: {
            args: Prisma.DeployLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload>
          }
          update: {
            args: Prisma.DeployLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload>
          }
          deleteMany: {
            args: Prisma.DeployLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeployLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DeployLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload>[]
          }
          upsert: {
            args: Prisma.DeployLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeployLogPayload>
          }
          aggregate: {
            args: Prisma.DeployLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeployLog>
          }
          groupBy: {
            args: Prisma.DeployLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeployLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeployLogCountArgs<ExtArgs>
            result: $Utils.Optional<DeployLogCountAggregateOutputType> | number
          }
        }
      }
      EmailRule: {
        payload: Prisma.$EmailRulePayload<ExtArgs>
        fields: Prisma.EmailRuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmailRuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmailRuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload>
          }
          findFirst: {
            args: Prisma.EmailRuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmailRuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload>
          }
          findMany: {
            args: Prisma.EmailRuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload>[]
          }
          create: {
            args: Prisma.EmailRuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload>
          }
          createMany: {
            args: Prisma.EmailRuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmailRuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload>[]
          }
          delete: {
            args: Prisma.EmailRuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload>
          }
          update: {
            args: Prisma.EmailRuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload>
          }
          deleteMany: {
            args: Prisma.EmailRuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmailRuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmailRuleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload>[]
          }
          upsert: {
            args: Prisma.EmailRuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailRulePayload>
          }
          aggregate: {
            args: Prisma.EmailRuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmailRule>
          }
          groupBy: {
            args: Prisma.EmailRuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmailRuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmailRuleCountArgs<ExtArgs>
            result: $Utils.Optional<EmailRuleCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    organization?: OrganizationOmit
    user?: UserOmit
    msConnectedAccount?: MsConnectedAccountOmit
    msalTokenCache?: MsalTokenCacheOmit
    emailDeltaLink?: EmailDeltaLinkOmit
    webhookSubscription?: WebhookSubscriptionOmit
    draft?: DraftOmit
    signature?: SignatureOmit
    cachedFolder?: CachedFolderOmit
    cachedEmail?: CachedEmailOmit
    cachedCalendarEvent?: CachedCalendarEventOmit
    cachedContact?: CachedContactOmit
    deployLog?: DeployLogOmit
    emailRule?: EmailRuleOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type OrganizationCountOutputType
   */

  export type OrganizationCountOutputType = {
    users: number
  }

  export type OrganizationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | OrganizationCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationCountOutputType
     */
    select?: OrganizationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    msAccounts: number
    deltaLinks: number
    webhookSubs: number
    drafts: number
    emailRules: number
    signatures: number
    cachedFolders: number
    cachedEmails: number
    cachedCalEvents: number
    cachedContacts: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    msAccounts?: boolean | UserCountOutputTypeCountMsAccountsArgs
    deltaLinks?: boolean | UserCountOutputTypeCountDeltaLinksArgs
    webhookSubs?: boolean | UserCountOutputTypeCountWebhookSubsArgs
    drafts?: boolean | UserCountOutputTypeCountDraftsArgs
    emailRules?: boolean | UserCountOutputTypeCountEmailRulesArgs
    signatures?: boolean | UserCountOutputTypeCountSignaturesArgs
    cachedFolders?: boolean | UserCountOutputTypeCountCachedFoldersArgs
    cachedEmails?: boolean | UserCountOutputTypeCountCachedEmailsArgs
    cachedCalEvents?: boolean | UserCountOutputTypeCountCachedCalEventsArgs
    cachedContacts?: boolean | UserCountOutputTypeCountCachedContactsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMsAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MsConnectedAccountWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDeltaLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailDeltaLinkWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWebhookSubsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WebhookSubscriptionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDraftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DraftWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountEmailRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailRuleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSignaturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignatureWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCachedFoldersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedFolderWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCachedEmailsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedEmailWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCachedCalEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedCalendarEventWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCachedContactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedContactWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Organization
   */

  export type AggregateOrganization = {
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  export type OrganizationMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrganizationMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrganizationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organization to aggregate.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Organizations
    **/
    _count?: true | OrganizationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationMaxAggregateInputType
  }

  export type GetOrganizationAggregateType<T extends OrganizationAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganization]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganization[P]>
      : GetScalarType<T[P], AggregateOrganization[P]>
  }




  export type OrganizationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationWhereInput
    orderBy?: OrganizationOrderByWithAggregationInput | OrganizationOrderByWithAggregationInput[]
    by: OrganizationScalarFieldEnum[] | OrganizationScalarFieldEnum
    having?: OrganizationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationCountAggregateInputType | true
    _min?: OrganizationMinAggregateInputType
    _max?: OrganizationMaxAggregateInputType
  }

  export type OrganizationGroupByOutputType = {
    id: string
    name: string
    slug: string
    createdAt: Date
    updatedAt: Date
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  type GetOrganizationGroupByPayload<T extends OrganizationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | Organization$usersArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrganizationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "createdAt" | "updatedAt", ExtArgs["result"]["organization"]>
  export type OrganizationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Organization$usersArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrganizationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OrganizationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OrganizationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Organization"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["organization"]>
    composites: {}
  }

  type OrganizationGetPayload<S extends boolean | null | undefined | OrganizationDefaultArgs> = $Result.GetResult<Prisma.$OrganizationPayload, S>

  type OrganizationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationCountAggregateInputType | true
    }

  export interface OrganizationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Organization'], meta: { name: 'Organization' } }
    /**
     * Find zero or one Organization that matches the filter.
     * @param {OrganizationFindUniqueArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationFindUniqueArgs>(args: SelectSubset<T, OrganizationFindUniqueArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organization that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationFindUniqueOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationFindFirstArgs>(args?: SelectSubset<T, OrganizationFindFirstArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organizations
     * const organizations = await prisma.organization.findMany()
     * 
     * // Get first 10 Organizations
     * const organizations = await prisma.organization.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationWithIdOnly = await prisma.organization.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationFindManyArgs>(args?: SelectSubset<T, OrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organization.
     * @param {OrganizationCreateArgs} args - Arguments to create a Organization.
     * @example
     * // Create one Organization
     * const Organization = await prisma.organization.create({
     *   data: {
     *     // ... data to create a Organization
     *   }
     * })
     * 
     */
    create<T extends OrganizationCreateArgs>(args: SelectSubset<T, OrganizationCreateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organizations.
     * @param {OrganizationCreateManyArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationCreateManyArgs>(args?: SelectSubset<T, OrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Organizations and returns the data saved in the database.
     * @param {OrganizationCreateManyAndReturnArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganizationCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Organization.
     * @param {OrganizationDeleteArgs} args - Arguments to delete one Organization.
     * @example
     * // Delete one Organization
     * const Organization = await prisma.organization.delete({
     *   where: {
     *     // ... filter to delete one Organization
     *   }
     * })
     * 
     */
    delete<T extends OrganizationDeleteArgs>(args: SelectSubset<T, OrganizationDeleteArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organization.
     * @param {OrganizationUpdateArgs} args - Arguments to update one Organization.
     * @example
     * // Update one Organization
     * const organization = await prisma.organization.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationUpdateArgs>(args: SelectSubset<T, OrganizationUpdateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organizations.
     * @param {OrganizationDeleteManyArgs} args - Arguments to filter Organizations to delete.
     * @example
     * // Delete a few Organizations
     * const { count } = await prisma.organization.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationDeleteManyArgs>(args?: SelectSubset<T, OrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationUpdateManyArgs>(args: SelectSubset<T, OrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations and returns the data updated in the database.
     * @param {OrganizationUpdateManyAndReturnArgs} args - Arguments to update many Organizations.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrganizationUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Organization.
     * @param {OrganizationUpsertArgs} args - Arguments to update or create a Organization.
     * @example
     * // Update or create a Organization
     * const organization = await prisma.organization.upsert({
     *   create: {
     *     // ... data to create a Organization
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organization we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationUpsertArgs>(args: SelectSubset<T, OrganizationUpsertArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationCountArgs} args - Arguments to filter Organizations to count.
     * @example
     * // Count the number of Organizations
     * const count = await prisma.organization.count({
     *   where: {
     *     // ... the filter for the Organizations we want to count
     *   }
     * })
    **/
    count<T extends OrganizationCountArgs>(
      args?: Subset<T, OrganizationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrganizationAggregateArgs>(args: Subset<T, OrganizationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationAggregateType<T>>

    /**
     * Group by Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrganizationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Organization model
   */
  readonly fields: OrganizationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Organization.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Organization$usersArgs<ExtArgs> = {}>(args?: Subset<T, Organization$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Organization model
   */
  interface OrganizationFieldRefs {
    readonly id: FieldRef<"Organization", 'String'>
    readonly name: FieldRef<"Organization", 'String'>
    readonly slug: FieldRef<"Organization", 'String'>
    readonly createdAt: FieldRef<"Organization", 'DateTime'>
    readonly updatedAt: FieldRef<"Organization", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Organization findUnique
   */
  export type OrganizationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findUniqueOrThrow
   */
  export type OrganizationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findFirst
   */
  export type OrganizationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findFirstOrThrow
   */
  export type OrganizationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findMany
   */
  export type OrganizationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organizations to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization create
   */
  export type OrganizationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to create a Organization.
     */
    data: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
  }

  /**
   * Organization createMany
   */
  export type OrganizationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization createManyAndReturn
   */
  export type OrganizationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization update
   */
  export type OrganizationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to update a Organization.
     */
    data: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
    /**
     * Choose, which Organization to update.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization updateMany
   */
  export type OrganizationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization updateManyAndReturn
   */
  export type OrganizationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization upsert
   */
  export type OrganizationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The filter to search for the Organization to update in case it exists.
     */
    where: OrganizationWhereUniqueInput
    /**
     * In case the Organization found by the `where` argument doesn't exist, create a new Organization with this data.
     */
    create: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
    /**
     * In case the Organization was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
  }

  /**
   * Organization delete
   */
  export type OrganizationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter which Organization to delete.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization deleteMany
   */
  export type OrganizationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organizations to delete
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to delete.
     */
    limit?: number
  }

  /**
   * Organization.users
   */
  export type Organization$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Organization without action
   */
  export type OrganizationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    avatarUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
    orgId: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    avatarUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
    orgId: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    avatarUrl: number
    createdAt: number
    updatedAt: number
    orgId: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    avatarUrl?: true
    createdAt?: true
    updatedAt?: true
    orgId?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    avatarUrl?: true
    createdAt?: true
    updatedAt?: true
    orgId?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    avatarUrl?: true
    createdAt?: true
    updatedAt?: true
    orgId?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    avatarUrl: string | null
    createdAt: Date
    updatedAt: Date
    orgId: string
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    avatarUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    orgId?: boolean
    org?: boolean | OrganizationDefaultArgs<ExtArgs>
    msAccounts?: boolean | User$msAccountsArgs<ExtArgs>
    msalCache?: boolean | User$msalCacheArgs<ExtArgs>
    deltaLinks?: boolean | User$deltaLinksArgs<ExtArgs>
    webhookSubs?: boolean | User$webhookSubsArgs<ExtArgs>
    drafts?: boolean | User$draftsArgs<ExtArgs>
    emailRules?: boolean | User$emailRulesArgs<ExtArgs>
    signatures?: boolean | User$signaturesArgs<ExtArgs>
    cachedFolders?: boolean | User$cachedFoldersArgs<ExtArgs>
    cachedEmails?: boolean | User$cachedEmailsArgs<ExtArgs>
    cachedCalEvents?: boolean | User$cachedCalEventsArgs<ExtArgs>
    cachedContacts?: boolean | User$cachedContactsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    avatarUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    orgId?: boolean
    org?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    avatarUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    orgId?: boolean
    org?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    avatarUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    orgId?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "avatarUrl" | "createdAt" | "updatedAt" | "orgId", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    org?: boolean | OrganizationDefaultArgs<ExtArgs>
    msAccounts?: boolean | User$msAccountsArgs<ExtArgs>
    msalCache?: boolean | User$msalCacheArgs<ExtArgs>
    deltaLinks?: boolean | User$deltaLinksArgs<ExtArgs>
    webhookSubs?: boolean | User$webhookSubsArgs<ExtArgs>
    drafts?: boolean | User$draftsArgs<ExtArgs>
    emailRules?: boolean | User$emailRulesArgs<ExtArgs>
    signatures?: boolean | User$signaturesArgs<ExtArgs>
    cachedFolders?: boolean | User$cachedFoldersArgs<ExtArgs>
    cachedEmails?: boolean | User$cachedEmailsArgs<ExtArgs>
    cachedCalEvents?: boolean | User$cachedCalEventsArgs<ExtArgs>
    cachedContacts?: boolean | User$cachedContactsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    org?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    org?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      org: Prisma.$OrganizationPayload<ExtArgs>
      msAccounts: Prisma.$MsConnectedAccountPayload<ExtArgs>[]
      msalCache: Prisma.$MsalTokenCachePayload<ExtArgs> | null
      deltaLinks: Prisma.$EmailDeltaLinkPayload<ExtArgs>[]
      webhookSubs: Prisma.$WebhookSubscriptionPayload<ExtArgs>[]
      drafts: Prisma.$DraftPayload<ExtArgs>[]
      emailRules: Prisma.$EmailRulePayload<ExtArgs>[]
      signatures: Prisma.$SignaturePayload<ExtArgs>[]
      cachedFolders: Prisma.$CachedFolderPayload<ExtArgs>[]
      cachedEmails: Prisma.$CachedEmailPayload<ExtArgs>[]
      cachedCalEvents: Prisma.$CachedCalendarEventPayload<ExtArgs>[]
      cachedContacts: Prisma.$CachedContactPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      avatarUrl: string | null
      createdAt: Date
      updatedAt: Date
      orgId: string
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    org<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    msAccounts<T extends User$msAccountsArgs<ExtArgs> = {}>(args?: Subset<T, User$msAccountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    msalCache<T extends User$msalCacheArgs<ExtArgs> = {}>(args?: Subset<T, User$msalCacheArgs<ExtArgs>>): Prisma__MsalTokenCacheClient<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    deltaLinks<T extends User$deltaLinksArgs<ExtArgs> = {}>(args?: Subset<T, User$deltaLinksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    webhookSubs<T extends User$webhookSubsArgs<ExtArgs> = {}>(args?: Subset<T, User$webhookSubsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    drafts<T extends User$draftsArgs<ExtArgs> = {}>(args?: Subset<T, User$draftsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    emailRules<T extends User$emailRulesArgs<ExtArgs> = {}>(args?: Subset<T, User$emailRulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    signatures<T extends User$signaturesArgs<ExtArgs> = {}>(args?: Subset<T, User$signaturesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cachedFolders<T extends User$cachedFoldersArgs<ExtArgs> = {}>(args?: Subset<T, User$cachedFoldersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cachedEmails<T extends User$cachedEmailsArgs<ExtArgs> = {}>(args?: Subset<T, User$cachedEmailsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cachedCalEvents<T extends User$cachedCalEventsArgs<ExtArgs> = {}>(args?: Subset<T, User$cachedCalEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cachedContacts<T extends User$cachedContactsArgs<ExtArgs> = {}>(args?: Subset<T, User$cachedContactsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly avatarUrl: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly orgId: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.msAccounts
   */
  export type User$msAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    where?: MsConnectedAccountWhereInput
    orderBy?: MsConnectedAccountOrderByWithRelationInput | MsConnectedAccountOrderByWithRelationInput[]
    cursor?: MsConnectedAccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MsConnectedAccountScalarFieldEnum | MsConnectedAccountScalarFieldEnum[]
  }

  /**
   * User.msalCache
   */
  export type User$msalCacheArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    where?: MsalTokenCacheWhereInput
  }

  /**
   * User.deltaLinks
   */
  export type User$deltaLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    where?: EmailDeltaLinkWhereInput
    orderBy?: EmailDeltaLinkOrderByWithRelationInput | EmailDeltaLinkOrderByWithRelationInput[]
    cursor?: EmailDeltaLinkWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmailDeltaLinkScalarFieldEnum | EmailDeltaLinkScalarFieldEnum[]
  }

  /**
   * User.webhookSubs
   */
  export type User$webhookSubsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    where?: WebhookSubscriptionWhereInput
    orderBy?: WebhookSubscriptionOrderByWithRelationInput | WebhookSubscriptionOrderByWithRelationInput[]
    cursor?: WebhookSubscriptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WebhookSubscriptionScalarFieldEnum | WebhookSubscriptionScalarFieldEnum[]
  }

  /**
   * User.drafts
   */
  export type User$draftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    where?: DraftWhereInput
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[]
    cursor?: DraftWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DraftScalarFieldEnum | DraftScalarFieldEnum[]
  }

  /**
   * User.emailRules
   */
  export type User$emailRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    where?: EmailRuleWhereInput
    orderBy?: EmailRuleOrderByWithRelationInput | EmailRuleOrderByWithRelationInput[]
    cursor?: EmailRuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmailRuleScalarFieldEnum | EmailRuleScalarFieldEnum[]
  }

  /**
   * User.signatures
   */
  export type User$signaturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    where?: SignatureWhereInput
    orderBy?: SignatureOrderByWithRelationInput | SignatureOrderByWithRelationInput[]
    cursor?: SignatureWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SignatureScalarFieldEnum | SignatureScalarFieldEnum[]
  }

  /**
   * User.cachedFolders
   */
  export type User$cachedFoldersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    where?: CachedFolderWhereInput
    orderBy?: CachedFolderOrderByWithRelationInput | CachedFolderOrderByWithRelationInput[]
    cursor?: CachedFolderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CachedFolderScalarFieldEnum | CachedFolderScalarFieldEnum[]
  }

  /**
   * User.cachedEmails
   */
  export type User$cachedEmailsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    where?: CachedEmailWhereInput
    orderBy?: CachedEmailOrderByWithRelationInput | CachedEmailOrderByWithRelationInput[]
    cursor?: CachedEmailWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CachedEmailScalarFieldEnum | CachedEmailScalarFieldEnum[]
  }

  /**
   * User.cachedCalEvents
   */
  export type User$cachedCalEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    where?: CachedCalendarEventWhereInput
    orderBy?: CachedCalendarEventOrderByWithRelationInput | CachedCalendarEventOrderByWithRelationInput[]
    cursor?: CachedCalendarEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CachedCalendarEventScalarFieldEnum | CachedCalendarEventScalarFieldEnum[]
  }

  /**
   * User.cachedContacts
   */
  export type User$cachedContactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    where?: CachedContactWhereInput
    orderBy?: CachedContactOrderByWithRelationInput | CachedContactOrderByWithRelationInput[]
    cursor?: CachedContactWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CachedContactScalarFieldEnum | CachedContactScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model MsConnectedAccount
   */

  export type AggregateMsConnectedAccount = {
    _count: MsConnectedAccountCountAggregateOutputType | null
    _min: MsConnectedAccountMinAggregateOutputType | null
    _max: MsConnectedAccountMaxAggregateOutputType | null
  }

  export type MsConnectedAccountMinAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    msEmail: string | null
    displayName: string | null
    tenantId: string | null
    isDefault: boolean | null
    connectedAt: Date | null
    updatedAt: Date | null
  }

  export type MsConnectedAccountMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    msEmail: string | null
    displayName: string | null
    tenantId: string | null
    isDefault: boolean | null
    connectedAt: Date | null
    updatedAt: Date | null
  }

  export type MsConnectedAccountCountAggregateOutputType = {
    id: number
    userId: number
    homeAccountId: number
    msEmail: number
    displayName: number
    tenantId: number
    isDefault: number
    connectedAt: number
    updatedAt: number
    _all: number
  }


  export type MsConnectedAccountMinAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    msEmail?: true
    displayName?: true
    tenantId?: true
    isDefault?: true
    connectedAt?: true
    updatedAt?: true
  }

  export type MsConnectedAccountMaxAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    msEmail?: true
    displayName?: true
    tenantId?: true
    isDefault?: true
    connectedAt?: true
    updatedAt?: true
  }

  export type MsConnectedAccountCountAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    msEmail?: true
    displayName?: true
    tenantId?: true
    isDefault?: true
    connectedAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MsConnectedAccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MsConnectedAccount to aggregate.
     */
    where?: MsConnectedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MsConnectedAccounts to fetch.
     */
    orderBy?: MsConnectedAccountOrderByWithRelationInput | MsConnectedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MsConnectedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MsConnectedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MsConnectedAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MsConnectedAccounts
    **/
    _count?: true | MsConnectedAccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MsConnectedAccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MsConnectedAccountMaxAggregateInputType
  }

  export type GetMsConnectedAccountAggregateType<T extends MsConnectedAccountAggregateArgs> = {
        [P in keyof T & keyof AggregateMsConnectedAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMsConnectedAccount[P]>
      : GetScalarType<T[P], AggregateMsConnectedAccount[P]>
  }




  export type MsConnectedAccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MsConnectedAccountWhereInput
    orderBy?: MsConnectedAccountOrderByWithAggregationInput | MsConnectedAccountOrderByWithAggregationInput[]
    by: MsConnectedAccountScalarFieldEnum[] | MsConnectedAccountScalarFieldEnum
    having?: MsConnectedAccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MsConnectedAccountCountAggregateInputType | true
    _min?: MsConnectedAccountMinAggregateInputType
    _max?: MsConnectedAccountMaxAggregateInputType
  }

  export type MsConnectedAccountGroupByOutputType = {
    id: string
    userId: string
    homeAccountId: string
    msEmail: string
    displayName: string | null
    tenantId: string | null
    isDefault: boolean
    connectedAt: Date
    updatedAt: Date
    _count: MsConnectedAccountCountAggregateOutputType | null
    _min: MsConnectedAccountMinAggregateOutputType | null
    _max: MsConnectedAccountMaxAggregateOutputType | null
  }

  type GetMsConnectedAccountGroupByPayload<T extends MsConnectedAccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MsConnectedAccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MsConnectedAccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MsConnectedAccountGroupByOutputType[P]>
            : GetScalarType<T[P], MsConnectedAccountGroupByOutputType[P]>
        }
      >
    >


  export type MsConnectedAccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    msEmail?: boolean
    displayName?: boolean
    tenantId?: boolean
    isDefault?: boolean
    connectedAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["msConnectedAccount"]>

  export type MsConnectedAccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    msEmail?: boolean
    displayName?: boolean
    tenantId?: boolean
    isDefault?: boolean
    connectedAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["msConnectedAccount"]>

  export type MsConnectedAccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    msEmail?: boolean
    displayName?: boolean
    tenantId?: boolean
    isDefault?: boolean
    connectedAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["msConnectedAccount"]>

  export type MsConnectedAccountSelectScalar = {
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    msEmail?: boolean
    displayName?: boolean
    tenantId?: boolean
    isDefault?: boolean
    connectedAt?: boolean
    updatedAt?: boolean
  }

  export type MsConnectedAccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "homeAccountId" | "msEmail" | "displayName" | "tenantId" | "isDefault" | "connectedAt" | "updatedAt", ExtArgs["result"]["msConnectedAccount"]>
  export type MsConnectedAccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MsConnectedAccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MsConnectedAccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $MsConnectedAccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MsConnectedAccount"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      homeAccountId: string
      msEmail: string
      displayName: string | null
      tenantId: string | null
      isDefault: boolean
      connectedAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["msConnectedAccount"]>
    composites: {}
  }

  type MsConnectedAccountGetPayload<S extends boolean | null | undefined | MsConnectedAccountDefaultArgs> = $Result.GetResult<Prisma.$MsConnectedAccountPayload, S>

  type MsConnectedAccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MsConnectedAccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MsConnectedAccountCountAggregateInputType | true
    }

  export interface MsConnectedAccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MsConnectedAccount'], meta: { name: 'MsConnectedAccount' } }
    /**
     * Find zero or one MsConnectedAccount that matches the filter.
     * @param {MsConnectedAccountFindUniqueArgs} args - Arguments to find a MsConnectedAccount
     * @example
     * // Get one MsConnectedAccount
     * const msConnectedAccount = await prisma.msConnectedAccount.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MsConnectedAccountFindUniqueArgs>(args: SelectSubset<T, MsConnectedAccountFindUniqueArgs<ExtArgs>>): Prisma__MsConnectedAccountClient<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MsConnectedAccount that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MsConnectedAccountFindUniqueOrThrowArgs} args - Arguments to find a MsConnectedAccount
     * @example
     * // Get one MsConnectedAccount
     * const msConnectedAccount = await prisma.msConnectedAccount.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MsConnectedAccountFindUniqueOrThrowArgs>(args: SelectSubset<T, MsConnectedAccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MsConnectedAccountClient<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MsConnectedAccount that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsConnectedAccountFindFirstArgs} args - Arguments to find a MsConnectedAccount
     * @example
     * // Get one MsConnectedAccount
     * const msConnectedAccount = await prisma.msConnectedAccount.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MsConnectedAccountFindFirstArgs>(args?: SelectSubset<T, MsConnectedAccountFindFirstArgs<ExtArgs>>): Prisma__MsConnectedAccountClient<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MsConnectedAccount that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsConnectedAccountFindFirstOrThrowArgs} args - Arguments to find a MsConnectedAccount
     * @example
     * // Get one MsConnectedAccount
     * const msConnectedAccount = await prisma.msConnectedAccount.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MsConnectedAccountFindFirstOrThrowArgs>(args?: SelectSubset<T, MsConnectedAccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__MsConnectedAccountClient<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MsConnectedAccounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsConnectedAccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MsConnectedAccounts
     * const msConnectedAccounts = await prisma.msConnectedAccount.findMany()
     * 
     * // Get first 10 MsConnectedAccounts
     * const msConnectedAccounts = await prisma.msConnectedAccount.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const msConnectedAccountWithIdOnly = await prisma.msConnectedAccount.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MsConnectedAccountFindManyArgs>(args?: SelectSubset<T, MsConnectedAccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MsConnectedAccount.
     * @param {MsConnectedAccountCreateArgs} args - Arguments to create a MsConnectedAccount.
     * @example
     * // Create one MsConnectedAccount
     * const MsConnectedAccount = await prisma.msConnectedAccount.create({
     *   data: {
     *     // ... data to create a MsConnectedAccount
     *   }
     * })
     * 
     */
    create<T extends MsConnectedAccountCreateArgs>(args: SelectSubset<T, MsConnectedAccountCreateArgs<ExtArgs>>): Prisma__MsConnectedAccountClient<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MsConnectedAccounts.
     * @param {MsConnectedAccountCreateManyArgs} args - Arguments to create many MsConnectedAccounts.
     * @example
     * // Create many MsConnectedAccounts
     * const msConnectedAccount = await prisma.msConnectedAccount.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MsConnectedAccountCreateManyArgs>(args?: SelectSubset<T, MsConnectedAccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MsConnectedAccounts and returns the data saved in the database.
     * @param {MsConnectedAccountCreateManyAndReturnArgs} args - Arguments to create many MsConnectedAccounts.
     * @example
     * // Create many MsConnectedAccounts
     * const msConnectedAccount = await prisma.msConnectedAccount.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MsConnectedAccounts and only return the `id`
     * const msConnectedAccountWithIdOnly = await prisma.msConnectedAccount.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MsConnectedAccountCreateManyAndReturnArgs>(args?: SelectSubset<T, MsConnectedAccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MsConnectedAccount.
     * @param {MsConnectedAccountDeleteArgs} args - Arguments to delete one MsConnectedAccount.
     * @example
     * // Delete one MsConnectedAccount
     * const MsConnectedAccount = await prisma.msConnectedAccount.delete({
     *   where: {
     *     // ... filter to delete one MsConnectedAccount
     *   }
     * })
     * 
     */
    delete<T extends MsConnectedAccountDeleteArgs>(args: SelectSubset<T, MsConnectedAccountDeleteArgs<ExtArgs>>): Prisma__MsConnectedAccountClient<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MsConnectedAccount.
     * @param {MsConnectedAccountUpdateArgs} args - Arguments to update one MsConnectedAccount.
     * @example
     * // Update one MsConnectedAccount
     * const msConnectedAccount = await prisma.msConnectedAccount.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MsConnectedAccountUpdateArgs>(args: SelectSubset<T, MsConnectedAccountUpdateArgs<ExtArgs>>): Prisma__MsConnectedAccountClient<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MsConnectedAccounts.
     * @param {MsConnectedAccountDeleteManyArgs} args - Arguments to filter MsConnectedAccounts to delete.
     * @example
     * // Delete a few MsConnectedAccounts
     * const { count } = await prisma.msConnectedAccount.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MsConnectedAccountDeleteManyArgs>(args?: SelectSubset<T, MsConnectedAccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MsConnectedAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsConnectedAccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MsConnectedAccounts
     * const msConnectedAccount = await prisma.msConnectedAccount.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MsConnectedAccountUpdateManyArgs>(args: SelectSubset<T, MsConnectedAccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MsConnectedAccounts and returns the data updated in the database.
     * @param {MsConnectedAccountUpdateManyAndReturnArgs} args - Arguments to update many MsConnectedAccounts.
     * @example
     * // Update many MsConnectedAccounts
     * const msConnectedAccount = await prisma.msConnectedAccount.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MsConnectedAccounts and only return the `id`
     * const msConnectedAccountWithIdOnly = await prisma.msConnectedAccount.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MsConnectedAccountUpdateManyAndReturnArgs>(args: SelectSubset<T, MsConnectedAccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MsConnectedAccount.
     * @param {MsConnectedAccountUpsertArgs} args - Arguments to update or create a MsConnectedAccount.
     * @example
     * // Update or create a MsConnectedAccount
     * const msConnectedAccount = await prisma.msConnectedAccount.upsert({
     *   create: {
     *     // ... data to create a MsConnectedAccount
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MsConnectedAccount we want to update
     *   }
     * })
     */
    upsert<T extends MsConnectedAccountUpsertArgs>(args: SelectSubset<T, MsConnectedAccountUpsertArgs<ExtArgs>>): Prisma__MsConnectedAccountClient<$Result.GetResult<Prisma.$MsConnectedAccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MsConnectedAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsConnectedAccountCountArgs} args - Arguments to filter MsConnectedAccounts to count.
     * @example
     * // Count the number of MsConnectedAccounts
     * const count = await prisma.msConnectedAccount.count({
     *   where: {
     *     // ... the filter for the MsConnectedAccounts we want to count
     *   }
     * })
    **/
    count<T extends MsConnectedAccountCountArgs>(
      args?: Subset<T, MsConnectedAccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MsConnectedAccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MsConnectedAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsConnectedAccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MsConnectedAccountAggregateArgs>(args: Subset<T, MsConnectedAccountAggregateArgs>): Prisma.PrismaPromise<GetMsConnectedAccountAggregateType<T>>

    /**
     * Group by MsConnectedAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsConnectedAccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MsConnectedAccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MsConnectedAccountGroupByArgs['orderBy'] }
        : { orderBy?: MsConnectedAccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MsConnectedAccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMsConnectedAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MsConnectedAccount model
   */
  readonly fields: MsConnectedAccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MsConnectedAccount.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MsConnectedAccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MsConnectedAccount model
   */
  interface MsConnectedAccountFieldRefs {
    readonly id: FieldRef<"MsConnectedAccount", 'String'>
    readonly userId: FieldRef<"MsConnectedAccount", 'String'>
    readonly homeAccountId: FieldRef<"MsConnectedAccount", 'String'>
    readonly msEmail: FieldRef<"MsConnectedAccount", 'String'>
    readonly displayName: FieldRef<"MsConnectedAccount", 'String'>
    readonly tenantId: FieldRef<"MsConnectedAccount", 'String'>
    readonly isDefault: FieldRef<"MsConnectedAccount", 'Boolean'>
    readonly connectedAt: FieldRef<"MsConnectedAccount", 'DateTime'>
    readonly updatedAt: FieldRef<"MsConnectedAccount", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MsConnectedAccount findUnique
   */
  export type MsConnectedAccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which MsConnectedAccount to fetch.
     */
    where: MsConnectedAccountWhereUniqueInput
  }

  /**
   * MsConnectedAccount findUniqueOrThrow
   */
  export type MsConnectedAccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which MsConnectedAccount to fetch.
     */
    where: MsConnectedAccountWhereUniqueInput
  }

  /**
   * MsConnectedAccount findFirst
   */
  export type MsConnectedAccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which MsConnectedAccount to fetch.
     */
    where?: MsConnectedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MsConnectedAccounts to fetch.
     */
    orderBy?: MsConnectedAccountOrderByWithRelationInput | MsConnectedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MsConnectedAccounts.
     */
    cursor?: MsConnectedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MsConnectedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MsConnectedAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MsConnectedAccounts.
     */
    distinct?: MsConnectedAccountScalarFieldEnum | MsConnectedAccountScalarFieldEnum[]
  }

  /**
   * MsConnectedAccount findFirstOrThrow
   */
  export type MsConnectedAccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which MsConnectedAccount to fetch.
     */
    where?: MsConnectedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MsConnectedAccounts to fetch.
     */
    orderBy?: MsConnectedAccountOrderByWithRelationInput | MsConnectedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MsConnectedAccounts.
     */
    cursor?: MsConnectedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MsConnectedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MsConnectedAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MsConnectedAccounts.
     */
    distinct?: MsConnectedAccountScalarFieldEnum | MsConnectedAccountScalarFieldEnum[]
  }

  /**
   * MsConnectedAccount findMany
   */
  export type MsConnectedAccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter, which MsConnectedAccounts to fetch.
     */
    where?: MsConnectedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MsConnectedAccounts to fetch.
     */
    orderBy?: MsConnectedAccountOrderByWithRelationInput | MsConnectedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MsConnectedAccounts.
     */
    cursor?: MsConnectedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MsConnectedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MsConnectedAccounts.
     */
    skip?: number
    distinct?: MsConnectedAccountScalarFieldEnum | MsConnectedAccountScalarFieldEnum[]
  }

  /**
   * MsConnectedAccount create
   */
  export type MsConnectedAccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    /**
     * The data needed to create a MsConnectedAccount.
     */
    data: XOR<MsConnectedAccountCreateInput, MsConnectedAccountUncheckedCreateInput>
  }

  /**
   * MsConnectedAccount createMany
   */
  export type MsConnectedAccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MsConnectedAccounts.
     */
    data: MsConnectedAccountCreateManyInput | MsConnectedAccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MsConnectedAccount createManyAndReturn
   */
  export type MsConnectedAccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * The data used to create many MsConnectedAccounts.
     */
    data: MsConnectedAccountCreateManyInput | MsConnectedAccountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MsConnectedAccount update
   */
  export type MsConnectedAccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    /**
     * The data needed to update a MsConnectedAccount.
     */
    data: XOR<MsConnectedAccountUpdateInput, MsConnectedAccountUncheckedUpdateInput>
    /**
     * Choose, which MsConnectedAccount to update.
     */
    where: MsConnectedAccountWhereUniqueInput
  }

  /**
   * MsConnectedAccount updateMany
   */
  export type MsConnectedAccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MsConnectedAccounts.
     */
    data: XOR<MsConnectedAccountUpdateManyMutationInput, MsConnectedAccountUncheckedUpdateManyInput>
    /**
     * Filter which MsConnectedAccounts to update
     */
    where?: MsConnectedAccountWhereInput
    /**
     * Limit how many MsConnectedAccounts to update.
     */
    limit?: number
  }

  /**
   * MsConnectedAccount updateManyAndReturn
   */
  export type MsConnectedAccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * The data used to update MsConnectedAccounts.
     */
    data: XOR<MsConnectedAccountUpdateManyMutationInput, MsConnectedAccountUncheckedUpdateManyInput>
    /**
     * Filter which MsConnectedAccounts to update
     */
    where?: MsConnectedAccountWhereInput
    /**
     * Limit how many MsConnectedAccounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MsConnectedAccount upsert
   */
  export type MsConnectedAccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    /**
     * The filter to search for the MsConnectedAccount to update in case it exists.
     */
    where: MsConnectedAccountWhereUniqueInput
    /**
     * In case the MsConnectedAccount found by the `where` argument doesn't exist, create a new MsConnectedAccount with this data.
     */
    create: XOR<MsConnectedAccountCreateInput, MsConnectedAccountUncheckedCreateInput>
    /**
     * In case the MsConnectedAccount was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MsConnectedAccountUpdateInput, MsConnectedAccountUncheckedUpdateInput>
  }

  /**
   * MsConnectedAccount delete
   */
  export type MsConnectedAccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
    /**
     * Filter which MsConnectedAccount to delete.
     */
    where: MsConnectedAccountWhereUniqueInput
  }

  /**
   * MsConnectedAccount deleteMany
   */
  export type MsConnectedAccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MsConnectedAccounts to delete
     */
    where?: MsConnectedAccountWhereInput
    /**
     * Limit how many MsConnectedAccounts to delete.
     */
    limit?: number
  }

  /**
   * MsConnectedAccount without action
   */
  export type MsConnectedAccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsConnectedAccount
     */
    select?: MsConnectedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsConnectedAccount
     */
    omit?: MsConnectedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsConnectedAccountInclude<ExtArgs> | null
  }


  /**
   * Model MsalTokenCache
   */

  export type AggregateMsalTokenCache = {
    _count: MsalTokenCacheCountAggregateOutputType | null
    _min: MsalTokenCacheMinAggregateOutputType | null
    _max: MsalTokenCacheMaxAggregateOutputType | null
  }

  export type MsalTokenCacheMinAggregateOutputType = {
    id: string | null
    userId: string | null
    cacheJson: string | null
    updatedAt: Date | null
  }

  export type MsalTokenCacheMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    cacheJson: string | null
    updatedAt: Date | null
  }

  export type MsalTokenCacheCountAggregateOutputType = {
    id: number
    userId: number
    cacheJson: number
    updatedAt: number
    _all: number
  }


  export type MsalTokenCacheMinAggregateInputType = {
    id?: true
    userId?: true
    cacheJson?: true
    updatedAt?: true
  }

  export type MsalTokenCacheMaxAggregateInputType = {
    id?: true
    userId?: true
    cacheJson?: true
    updatedAt?: true
  }

  export type MsalTokenCacheCountAggregateInputType = {
    id?: true
    userId?: true
    cacheJson?: true
    updatedAt?: true
    _all?: true
  }

  export type MsalTokenCacheAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MsalTokenCache to aggregate.
     */
    where?: MsalTokenCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MsalTokenCaches to fetch.
     */
    orderBy?: MsalTokenCacheOrderByWithRelationInput | MsalTokenCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MsalTokenCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MsalTokenCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MsalTokenCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MsalTokenCaches
    **/
    _count?: true | MsalTokenCacheCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MsalTokenCacheMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MsalTokenCacheMaxAggregateInputType
  }

  export type GetMsalTokenCacheAggregateType<T extends MsalTokenCacheAggregateArgs> = {
        [P in keyof T & keyof AggregateMsalTokenCache]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMsalTokenCache[P]>
      : GetScalarType<T[P], AggregateMsalTokenCache[P]>
  }




  export type MsalTokenCacheGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MsalTokenCacheWhereInput
    orderBy?: MsalTokenCacheOrderByWithAggregationInput | MsalTokenCacheOrderByWithAggregationInput[]
    by: MsalTokenCacheScalarFieldEnum[] | MsalTokenCacheScalarFieldEnum
    having?: MsalTokenCacheScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MsalTokenCacheCountAggregateInputType | true
    _min?: MsalTokenCacheMinAggregateInputType
    _max?: MsalTokenCacheMaxAggregateInputType
  }

  export type MsalTokenCacheGroupByOutputType = {
    id: string
    userId: string
    cacheJson: string
    updatedAt: Date
    _count: MsalTokenCacheCountAggregateOutputType | null
    _min: MsalTokenCacheMinAggregateOutputType | null
    _max: MsalTokenCacheMaxAggregateOutputType | null
  }

  type GetMsalTokenCacheGroupByPayload<T extends MsalTokenCacheGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MsalTokenCacheGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MsalTokenCacheGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MsalTokenCacheGroupByOutputType[P]>
            : GetScalarType<T[P], MsalTokenCacheGroupByOutputType[P]>
        }
      >
    >


  export type MsalTokenCacheSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    cacheJson?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["msalTokenCache"]>

  export type MsalTokenCacheSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    cacheJson?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["msalTokenCache"]>

  export type MsalTokenCacheSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    cacheJson?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["msalTokenCache"]>

  export type MsalTokenCacheSelectScalar = {
    id?: boolean
    userId?: boolean
    cacheJson?: boolean
    updatedAt?: boolean
  }

  export type MsalTokenCacheOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "cacheJson" | "updatedAt", ExtArgs["result"]["msalTokenCache"]>
  export type MsalTokenCacheInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MsalTokenCacheIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MsalTokenCacheIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $MsalTokenCachePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MsalTokenCache"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      cacheJson: string
      updatedAt: Date
    }, ExtArgs["result"]["msalTokenCache"]>
    composites: {}
  }

  type MsalTokenCacheGetPayload<S extends boolean | null | undefined | MsalTokenCacheDefaultArgs> = $Result.GetResult<Prisma.$MsalTokenCachePayload, S>

  type MsalTokenCacheCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MsalTokenCacheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MsalTokenCacheCountAggregateInputType | true
    }

  export interface MsalTokenCacheDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MsalTokenCache'], meta: { name: 'MsalTokenCache' } }
    /**
     * Find zero or one MsalTokenCache that matches the filter.
     * @param {MsalTokenCacheFindUniqueArgs} args - Arguments to find a MsalTokenCache
     * @example
     * // Get one MsalTokenCache
     * const msalTokenCache = await prisma.msalTokenCache.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MsalTokenCacheFindUniqueArgs>(args: SelectSubset<T, MsalTokenCacheFindUniqueArgs<ExtArgs>>): Prisma__MsalTokenCacheClient<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MsalTokenCache that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MsalTokenCacheFindUniqueOrThrowArgs} args - Arguments to find a MsalTokenCache
     * @example
     * // Get one MsalTokenCache
     * const msalTokenCache = await prisma.msalTokenCache.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MsalTokenCacheFindUniqueOrThrowArgs>(args: SelectSubset<T, MsalTokenCacheFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MsalTokenCacheClient<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MsalTokenCache that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsalTokenCacheFindFirstArgs} args - Arguments to find a MsalTokenCache
     * @example
     * // Get one MsalTokenCache
     * const msalTokenCache = await prisma.msalTokenCache.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MsalTokenCacheFindFirstArgs>(args?: SelectSubset<T, MsalTokenCacheFindFirstArgs<ExtArgs>>): Prisma__MsalTokenCacheClient<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MsalTokenCache that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsalTokenCacheFindFirstOrThrowArgs} args - Arguments to find a MsalTokenCache
     * @example
     * // Get one MsalTokenCache
     * const msalTokenCache = await prisma.msalTokenCache.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MsalTokenCacheFindFirstOrThrowArgs>(args?: SelectSubset<T, MsalTokenCacheFindFirstOrThrowArgs<ExtArgs>>): Prisma__MsalTokenCacheClient<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MsalTokenCaches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsalTokenCacheFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MsalTokenCaches
     * const msalTokenCaches = await prisma.msalTokenCache.findMany()
     * 
     * // Get first 10 MsalTokenCaches
     * const msalTokenCaches = await prisma.msalTokenCache.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const msalTokenCacheWithIdOnly = await prisma.msalTokenCache.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MsalTokenCacheFindManyArgs>(args?: SelectSubset<T, MsalTokenCacheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MsalTokenCache.
     * @param {MsalTokenCacheCreateArgs} args - Arguments to create a MsalTokenCache.
     * @example
     * // Create one MsalTokenCache
     * const MsalTokenCache = await prisma.msalTokenCache.create({
     *   data: {
     *     // ... data to create a MsalTokenCache
     *   }
     * })
     * 
     */
    create<T extends MsalTokenCacheCreateArgs>(args: SelectSubset<T, MsalTokenCacheCreateArgs<ExtArgs>>): Prisma__MsalTokenCacheClient<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MsalTokenCaches.
     * @param {MsalTokenCacheCreateManyArgs} args - Arguments to create many MsalTokenCaches.
     * @example
     * // Create many MsalTokenCaches
     * const msalTokenCache = await prisma.msalTokenCache.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MsalTokenCacheCreateManyArgs>(args?: SelectSubset<T, MsalTokenCacheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MsalTokenCaches and returns the data saved in the database.
     * @param {MsalTokenCacheCreateManyAndReturnArgs} args - Arguments to create many MsalTokenCaches.
     * @example
     * // Create many MsalTokenCaches
     * const msalTokenCache = await prisma.msalTokenCache.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MsalTokenCaches and only return the `id`
     * const msalTokenCacheWithIdOnly = await prisma.msalTokenCache.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MsalTokenCacheCreateManyAndReturnArgs>(args?: SelectSubset<T, MsalTokenCacheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MsalTokenCache.
     * @param {MsalTokenCacheDeleteArgs} args - Arguments to delete one MsalTokenCache.
     * @example
     * // Delete one MsalTokenCache
     * const MsalTokenCache = await prisma.msalTokenCache.delete({
     *   where: {
     *     // ... filter to delete one MsalTokenCache
     *   }
     * })
     * 
     */
    delete<T extends MsalTokenCacheDeleteArgs>(args: SelectSubset<T, MsalTokenCacheDeleteArgs<ExtArgs>>): Prisma__MsalTokenCacheClient<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MsalTokenCache.
     * @param {MsalTokenCacheUpdateArgs} args - Arguments to update one MsalTokenCache.
     * @example
     * // Update one MsalTokenCache
     * const msalTokenCache = await prisma.msalTokenCache.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MsalTokenCacheUpdateArgs>(args: SelectSubset<T, MsalTokenCacheUpdateArgs<ExtArgs>>): Prisma__MsalTokenCacheClient<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MsalTokenCaches.
     * @param {MsalTokenCacheDeleteManyArgs} args - Arguments to filter MsalTokenCaches to delete.
     * @example
     * // Delete a few MsalTokenCaches
     * const { count } = await prisma.msalTokenCache.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MsalTokenCacheDeleteManyArgs>(args?: SelectSubset<T, MsalTokenCacheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MsalTokenCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsalTokenCacheUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MsalTokenCaches
     * const msalTokenCache = await prisma.msalTokenCache.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MsalTokenCacheUpdateManyArgs>(args: SelectSubset<T, MsalTokenCacheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MsalTokenCaches and returns the data updated in the database.
     * @param {MsalTokenCacheUpdateManyAndReturnArgs} args - Arguments to update many MsalTokenCaches.
     * @example
     * // Update many MsalTokenCaches
     * const msalTokenCache = await prisma.msalTokenCache.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MsalTokenCaches and only return the `id`
     * const msalTokenCacheWithIdOnly = await prisma.msalTokenCache.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MsalTokenCacheUpdateManyAndReturnArgs>(args: SelectSubset<T, MsalTokenCacheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MsalTokenCache.
     * @param {MsalTokenCacheUpsertArgs} args - Arguments to update or create a MsalTokenCache.
     * @example
     * // Update or create a MsalTokenCache
     * const msalTokenCache = await prisma.msalTokenCache.upsert({
     *   create: {
     *     // ... data to create a MsalTokenCache
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MsalTokenCache we want to update
     *   }
     * })
     */
    upsert<T extends MsalTokenCacheUpsertArgs>(args: SelectSubset<T, MsalTokenCacheUpsertArgs<ExtArgs>>): Prisma__MsalTokenCacheClient<$Result.GetResult<Prisma.$MsalTokenCachePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MsalTokenCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsalTokenCacheCountArgs} args - Arguments to filter MsalTokenCaches to count.
     * @example
     * // Count the number of MsalTokenCaches
     * const count = await prisma.msalTokenCache.count({
     *   where: {
     *     // ... the filter for the MsalTokenCaches we want to count
     *   }
     * })
    **/
    count<T extends MsalTokenCacheCountArgs>(
      args?: Subset<T, MsalTokenCacheCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MsalTokenCacheCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MsalTokenCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsalTokenCacheAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MsalTokenCacheAggregateArgs>(args: Subset<T, MsalTokenCacheAggregateArgs>): Prisma.PrismaPromise<GetMsalTokenCacheAggregateType<T>>

    /**
     * Group by MsalTokenCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MsalTokenCacheGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MsalTokenCacheGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MsalTokenCacheGroupByArgs['orderBy'] }
        : { orderBy?: MsalTokenCacheGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MsalTokenCacheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMsalTokenCacheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MsalTokenCache model
   */
  readonly fields: MsalTokenCacheFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MsalTokenCache.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MsalTokenCacheClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MsalTokenCache model
   */
  interface MsalTokenCacheFieldRefs {
    readonly id: FieldRef<"MsalTokenCache", 'String'>
    readonly userId: FieldRef<"MsalTokenCache", 'String'>
    readonly cacheJson: FieldRef<"MsalTokenCache", 'String'>
    readonly updatedAt: FieldRef<"MsalTokenCache", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MsalTokenCache findUnique
   */
  export type MsalTokenCacheFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    /**
     * Filter, which MsalTokenCache to fetch.
     */
    where: MsalTokenCacheWhereUniqueInput
  }

  /**
   * MsalTokenCache findUniqueOrThrow
   */
  export type MsalTokenCacheFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    /**
     * Filter, which MsalTokenCache to fetch.
     */
    where: MsalTokenCacheWhereUniqueInput
  }

  /**
   * MsalTokenCache findFirst
   */
  export type MsalTokenCacheFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    /**
     * Filter, which MsalTokenCache to fetch.
     */
    where?: MsalTokenCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MsalTokenCaches to fetch.
     */
    orderBy?: MsalTokenCacheOrderByWithRelationInput | MsalTokenCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MsalTokenCaches.
     */
    cursor?: MsalTokenCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MsalTokenCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MsalTokenCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MsalTokenCaches.
     */
    distinct?: MsalTokenCacheScalarFieldEnum | MsalTokenCacheScalarFieldEnum[]
  }

  /**
   * MsalTokenCache findFirstOrThrow
   */
  export type MsalTokenCacheFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    /**
     * Filter, which MsalTokenCache to fetch.
     */
    where?: MsalTokenCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MsalTokenCaches to fetch.
     */
    orderBy?: MsalTokenCacheOrderByWithRelationInput | MsalTokenCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MsalTokenCaches.
     */
    cursor?: MsalTokenCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MsalTokenCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MsalTokenCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MsalTokenCaches.
     */
    distinct?: MsalTokenCacheScalarFieldEnum | MsalTokenCacheScalarFieldEnum[]
  }

  /**
   * MsalTokenCache findMany
   */
  export type MsalTokenCacheFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    /**
     * Filter, which MsalTokenCaches to fetch.
     */
    where?: MsalTokenCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MsalTokenCaches to fetch.
     */
    orderBy?: MsalTokenCacheOrderByWithRelationInput | MsalTokenCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MsalTokenCaches.
     */
    cursor?: MsalTokenCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MsalTokenCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MsalTokenCaches.
     */
    skip?: number
    distinct?: MsalTokenCacheScalarFieldEnum | MsalTokenCacheScalarFieldEnum[]
  }

  /**
   * MsalTokenCache create
   */
  export type MsalTokenCacheCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    /**
     * The data needed to create a MsalTokenCache.
     */
    data: XOR<MsalTokenCacheCreateInput, MsalTokenCacheUncheckedCreateInput>
  }

  /**
   * MsalTokenCache createMany
   */
  export type MsalTokenCacheCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MsalTokenCaches.
     */
    data: MsalTokenCacheCreateManyInput | MsalTokenCacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MsalTokenCache createManyAndReturn
   */
  export type MsalTokenCacheCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * The data used to create many MsalTokenCaches.
     */
    data: MsalTokenCacheCreateManyInput | MsalTokenCacheCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MsalTokenCache update
   */
  export type MsalTokenCacheUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    /**
     * The data needed to update a MsalTokenCache.
     */
    data: XOR<MsalTokenCacheUpdateInput, MsalTokenCacheUncheckedUpdateInput>
    /**
     * Choose, which MsalTokenCache to update.
     */
    where: MsalTokenCacheWhereUniqueInput
  }

  /**
   * MsalTokenCache updateMany
   */
  export type MsalTokenCacheUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MsalTokenCaches.
     */
    data: XOR<MsalTokenCacheUpdateManyMutationInput, MsalTokenCacheUncheckedUpdateManyInput>
    /**
     * Filter which MsalTokenCaches to update
     */
    where?: MsalTokenCacheWhereInput
    /**
     * Limit how many MsalTokenCaches to update.
     */
    limit?: number
  }

  /**
   * MsalTokenCache updateManyAndReturn
   */
  export type MsalTokenCacheUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * The data used to update MsalTokenCaches.
     */
    data: XOR<MsalTokenCacheUpdateManyMutationInput, MsalTokenCacheUncheckedUpdateManyInput>
    /**
     * Filter which MsalTokenCaches to update
     */
    where?: MsalTokenCacheWhereInput
    /**
     * Limit how many MsalTokenCaches to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MsalTokenCache upsert
   */
  export type MsalTokenCacheUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    /**
     * The filter to search for the MsalTokenCache to update in case it exists.
     */
    where: MsalTokenCacheWhereUniqueInput
    /**
     * In case the MsalTokenCache found by the `where` argument doesn't exist, create a new MsalTokenCache with this data.
     */
    create: XOR<MsalTokenCacheCreateInput, MsalTokenCacheUncheckedCreateInput>
    /**
     * In case the MsalTokenCache was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MsalTokenCacheUpdateInput, MsalTokenCacheUncheckedUpdateInput>
  }

  /**
   * MsalTokenCache delete
   */
  export type MsalTokenCacheDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
    /**
     * Filter which MsalTokenCache to delete.
     */
    where: MsalTokenCacheWhereUniqueInput
  }

  /**
   * MsalTokenCache deleteMany
   */
  export type MsalTokenCacheDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MsalTokenCaches to delete
     */
    where?: MsalTokenCacheWhereInput
    /**
     * Limit how many MsalTokenCaches to delete.
     */
    limit?: number
  }

  /**
   * MsalTokenCache without action
   */
  export type MsalTokenCacheDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MsalTokenCache
     */
    select?: MsalTokenCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MsalTokenCache
     */
    omit?: MsalTokenCacheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MsalTokenCacheInclude<ExtArgs> | null
  }


  /**
   * Model EmailDeltaLink
   */

  export type AggregateEmailDeltaLink = {
    _count: EmailDeltaLinkCountAggregateOutputType | null
    _min: EmailDeltaLinkMinAggregateOutputType | null
    _max: EmailDeltaLinkMaxAggregateOutputType | null
  }

  export type EmailDeltaLinkMinAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    folderId: string | null
    deltaToken: string | null
    updatedAt: Date | null
  }

  export type EmailDeltaLinkMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    folderId: string | null
    deltaToken: string | null
    updatedAt: Date | null
  }

  export type EmailDeltaLinkCountAggregateOutputType = {
    id: number
    userId: number
    homeAccountId: number
    folderId: number
    deltaToken: number
    updatedAt: number
    _all: number
  }


  export type EmailDeltaLinkMinAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    folderId?: true
    deltaToken?: true
    updatedAt?: true
  }

  export type EmailDeltaLinkMaxAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    folderId?: true
    deltaToken?: true
    updatedAt?: true
  }

  export type EmailDeltaLinkCountAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    folderId?: true
    deltaToken?: true
    updatedAt?: true
    _all?: true
  }

  export type EmailDeltaLinkAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailDeltaLink to aggregate.
     */
    where?: EmailDeltaLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailDeltaLinks to fetch.
     */
    orderBy?: EmailDeltaLinkOrderByWithRelationInput | EmailDeltaLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmailDeltaLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailDeltaLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailDeltaLinks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmailDeltaLinks
    **/
    _count?: true | EmailDeltaLinkCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmailDeltaLinkMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmailDeltaLinkMaxAggregateInputType
  }

  export type GetEmailDeltaLinkAggregateType<T extends EmailDeltaLinkAggregateArgs> = {
        [P in keyof T & keyof AggregateEmailDeltaLink]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmailDeltaLink[P]>
      : GetScalarType<T[P], AggregateEmailDeltaLink[P]>
  }




  export type EmailDeltaLinkGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailDeltaLinkWhereInput
    orderBy?: EmailDeltaLinkOrderByWithAggregationInput | EmailDeltaLinkOrderByWithAggregationInput[]
    by: EmailDeltaLinkScalarFieldEnum[] | EmailDeltaLinkScalarFieldEnum
    having?: EmailDeltaLinkScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmailDeltaLinkCountAggregateInputType | true
    _min?: EmailDeltaLinkMinAggregateInputType
    _max?: EmailDeltaLinkMaxAggregateInputType
  }

  export type EmailDeltaLinkGroupByOutputType = {
    id: string
    userId: string
    homeAccountId: string
    folderId: string
    deltaToken: string
    updatedAt: Date
    _count: EmailDeltaLinkCountAggregateOutputType | null
    _min: EmailDeltaLinkMinAggregateOutputType | null
    _max: EmailDeltaLinkMaxAggregateOutputType | null
  }

  type GetEmailDeltaLinkGroupByPayload<T extends EmailDeltaLinkGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmailDeltaLinkGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmailDeltaLinkGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmailDeltaLinkGroupByOutputType[P]>
            : GetScalarType<T[P], EmailDeltaLinkGroupByOutputType[P]>
        }
      >
    >


  export type EmailDeltaLinkSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    folderId?: boolean
    deltaToken?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailDeltaLink"]>

  export type EmailDeltaLinkSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    folderId?: boolean
    deltaToken?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailDeltaLink"]>

  export type EmailDeltaLinkSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    folderId?: boolean
    deltaToken?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailDeltaLink"]>

  export type EmailDeltaLinkSelectScalar = {
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    folderId?: boolean
    deltaToken?: boolean
    updatedAt?: boolean
  }

  export type EmailDeltaLinkOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "homeAccountId" | "folderId" | "deltaToken" | "updatedAt", ExtArgs["result"]["emailDeltaLink"]>
  export type EmailDeltaLinkInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type EmailDeltaLinkIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type EmailDeltaLinkIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $EmailDeltaLinkPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmailDeltaLink"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      homeAccountId: string
      folderId: string
      deltaToken: string
      updatedAt: Date
    }, ExtArgs["result"]["emailDeltaLink"]>
    composites: {}
  }

  type EmailDeltaLinkGetPayload<S extends boolean | null | undefined | EmailDeltaLinkDefaultArgs> = $Result.GetResult<Prisma.$EmailDeltaLinkPayload, S>

  type EmailDeltaLinkCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmailDeltaLinkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmailDeltaLinkCountAggregateInputType | true
    }

  export interface EmailDeltaLinkDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmailDeltaLink'], meta: { name: 'EmailDeltaLink' } }
    /**
     * Find zero or one EmailDeltaLink that matches the filter.
     * @param {EmailDeltaLinkFindUniqueArgs} args - Arguments to find a EmailDeltaLink
     * @example
     * // Get one EmailDeltaLink
     * const emailDeltaLink = await prisma.emailDeltaLink.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmailDeltaLinkFindUniqueArgs>(args: SelectSubset<T, EmailDeltaLinkFindUniqueArgs<ExtArgs>>): Prisma__EmailDeltaLinkClient<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EmailDeltaLink that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmailDeltaLinkFindUniqueOrThrowArgs} args - Arguments to find a EmailDeltaLink
     * @example
     * // Get one EmailDeltaLink
     * const emailDeltaLink = await prisma.emailDeltaLink.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmailDeltaLinkFindUniqueOrThrowArgs>(args: SelectSubset<T, EmailDeltaLinkFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmailDeltaLinkClient<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmailDeltaLink that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailDeltaLinkFindFirstArgs} args - Arguments to find a EmailDeltaLink
     * @example
     * // Get one EmailDeltaLink
     * const emailDeltaLink = await prisma.emailDeltaLink.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmailDeltaLinkFindFirstArgs>(args?: SelectSubset<T, EmailDeltaLinkFindFirstArgs<ExtArgs>>): Prisma__EmailDeltaLinkClient<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmailDeltaLink that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailDeltaLinkFindFirstOrThrowArgs} args - Arguments to find a EmailDeltaLink
     * @example
     * // Get one EmailDeltaLink
     * const emailDeltaLink = await prisma.emailDeltaLink.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmailDeltaLinkFindFirstOrThrowArgs>(args?: SelectSubset<T, EmailDeltaLinkFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmailDeltaLinkClient<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EmailDeltaLinks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailDeltaLinkFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmailDeltaLinks
     * const emailDeltaLinks = await prisma.emailDeltaLink.findMany()
     * 
     * // Get first 10 EmailDeltaLinks
     * const emailDeltaLinks = await prisma.emailDeltaLink.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const emailDeltaLinkWithIdOnly = await prisma.emailDeltaLink.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmailDeltaLinkFindManyArgs>(args?: SelectSubset<T, EmailDeltaLinkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EmailDeltaLink.
     * @param {EmailDeltaLinkCreateArgs} args - Arguments to create a EmailDeltaLink.
     * @example
     * // Create one EmailDeltaLink
     * const EmailDeltaLink = await prisma.emailDeltaLink.create({
     *   data: {
     *     // ... data to create a EmailDeltaLink
     *   }
     * })
     * 
     */
    create<T extends EmailDeltaLinkCreateArgs>(args: SelectSubset<T, EmailDeltaLinkCreateArgs<ExtArgs>>): Prisma__EmailDeltaLinkClient<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EmailDeltaLinks.
     * @param {EmailDeltaLinkCreateManyArgs} args - Arguments to create many EmailDeltaLinks.
     * @example
     * // Create many EmailDeltaLinks
     * const emailDeltaLink = await prisma.emailDeltaLink.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmailDeltaLinkCreateManyArgs>(args?: SelectSubset<T, EmailDeltaLinkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EmailDeltaLinks and returns the data saved in the database.
     * @param {EmailDeltaLinkCreateManyAndReturnArgs} args - Arguments to create many EmailDeltaLinks.
     * @example
     * // Create many EmailDeltaLinks
     * const emailDeltaLink = await prisma.emailDeltaLink.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EmailDeltaLinks and only return the `id`
     * const emailDeltaLinkWithIdOnly = await prisma.emailDeltaLink.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmailDeltaLinkCreateManyAndReturnArgs>(args?: SelectSubset<T, EmailDeltaLinkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EmailDeltaLink.
     * @param {EmailDeltaLinkDeleteArgs} args - Arguments to delete one EmailDeltaLink.
     * @example
     * // Delete one EmailDeltaLink
     * const EmailDeltaLink = await prisma.emailDeltaLink.delete({
     *   where: {
     *     // ... filter to delete one EmailDeltaLink
     *   }
     * })
     * 
     */
    delete<T extends EmailDeltaLinkDeleteArgs>(args: SelectSubset<T, EmailDeltaLinkDeleteArgs<ExtArgs>>): Prisma__EmailDeltaLinkClient<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EmailDeltaLink.
     * @param {EmailDeltaLinkUpdateArgs} args - Arguments to update one EmailDeltaLink.
     * @example
     * // Update one EmailDeltaLink
     * const emailDeltaLink = await prisma.emailDeltaLink.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmailDeltaLinkUpdateArgs>(args: SelectSubset<T, EmailDeltaLinkUpdateArgs<ExtArgs>>): Prisma__EmailDeltaLinkClient<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EmailDeltaLinks.
     * @param {EmailDeltaLinkDeleteManyArgs} args - Arguments to filter EmailDeltaLinks to delete.
     * @example
     * // Delete a few EmailDeltaLinks
     * const { count } = await prisma.emailDeltaLink.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmailDeltaLinkDeleteManyArgs>(args?: SelectSubset<T, EmailDeltaLinkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailDeltaLinks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailDeltaLinkUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmailDeltaLinks
     * const emailDeltaLink = await prisma.emailDeltaLink.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmailDeltaLinkUpdateManyArgs>(args: SelectSubset<T, EmailDeltaLinkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailDeltaLinks and returns the data updated in the database.
     * @param {EmailDeltaLinkUpdateManyAndReturnArgs} args - Arguments to update many EmailDeltaLinks.
     * @example
     * // Update many EmailDeltaLinks
     * const emailDeltaLink = await prisma.emailDeltaLink.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EmailDeltaLinks and only return the `id`
     * const emailDeltaLinkWithIdOnly = await prisma.emailDeltaLink.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EmailDeltaLinkUpdateManyAndReturnArgs>(args: SelectSubset<T, EmailDeltaLinkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EmailDeltaLink.
     * @param {EmailDeltaLinkUpsertArgs} args - Arguments to update or create a EmailDeltaLink.
     * @example
     * // Update or create a EmailDeltaLink
     * const emailDeltaLink = await prisma.emailDeltaLink.upsert({
     *   create: {
     *     // ... data to create a EmailDeltaLink
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmailDeltaLink we want to update
     *   }
     * })
     */
    upsert<T extends EmailDeltaLinkUpsertArgs>(args: SelectSubset<T, EmailDeltaLinkUpsertArgs<ExtArgs>>): Prisma__EmailDeltaLinkClient<$Result.GetResult<Prisma.$EmailDeltaLinkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EmailDeltaLinks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailDeltaLinkCountArgs} args - Arguments to filter EmailDeltaLinks to count.
     * @example
     * // Count the number of EmailDeltaLinks
     * const count = await prisma.emailDeltaLink.count({
     *   where: {
     *     // ... the filter for the EmailDeltaLinks we want to count
     *   }
     * })
    **/
    count<T extends EmailDeltaLinkCountArgs>(
      args?: Subset<T, EmailDeltaLinkCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmailDeltaLinkCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmailDeltaLink.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailDeltaLinkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmailDeltaLinkAggregateArgs>(args: Subset<T, EmailDeltaLinkAggregateArgs>): Prisma.PrismaPromise<GetEmailDeltaLinkAggregateType<T>>

    /**
     * Group by EmailDeltaLink.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailDeltaLinkGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmailDeltaLinkGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmailDeltaLinkGroupByArgs['orderBy'] }
        : { orderBy?: EmailDeltaLinkGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmailDeltaLinkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmailDeltaLinkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmailDeltaLink model
   */
  readonly fields: EmailDeltaLinkFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmailDeltaLink.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmailDeltaLinkClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmailDeltaLink model
   */
  interface EmailDeltaLinkFieldRefs {
    readonly id: FieldRef<"EmailDeltaLink", 'String'>
    readonly userId: FieldRef<"EmailDeltaLink", 'String'>
    readonly homeAccountId: FieldRef<"EmailDeltaLink", 'String'>
    readonly folderId: FieldRef<"EmailDeltaLink", 'String'>
    readonly deltaToken: FieldRef<"EmailDeltaLink", 'String'>
    readonly updatedAt: FieldRef<"EmailDeltaLink", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EmailDeltaLink findUnique
   */
  export type EmailDeltaLinkFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    /**
     * Filter, which EmailDeltaLink to fetch.
     */
    where: EmailDeltaLinkWhereUniqueInput
  }

  /**
   * EmailDeltaLink findUniqueOrThrow
   */
  export type EmailDeltaLinkFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    /**
     * Filter, which EmailDeltaLink to fetch.
     */
    where: EmailDeltaLinkWhereUniqueInput
  }

  /**
   * EmailDeltaLink findFirst
   */
  export type EmailDeltaLinkFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    /**
     * Filter, which EmailDeltaLink to fetch.
     */
    where?: EmailDeltaLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailDeltaLinks to fetch.
     */
    orderBy?: EmailDeltaLinkOrderByWithRelationInput | EmailDeltaLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailDeltaLinks.
     */
    cursor?: EmailDeltaLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailDeltaLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailDeltaLinks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailDeltaLinks.
     */
    distinct?: EmailDeltaLinkScalarFieldEnum | EmailDeltaLinkScalarFieldEnum[]
  }

  /**
   * EmailDeltaLink findFirstOrThrow
   */
  export type EmailDeltaLinkFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    /**
     * Filter, which EmailDeltaLink to fetch.
     */
    where?: EmailDeltaLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailDeltaLinks to fetch.
     */
    orderBy?: EmailDeltaLinkOrderByWithRelationInput | EmailDeltaLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailDeltaLinks.
     */
    cursor?: EmailDeltaLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailDeltaLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailDeltaLinks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailDeltaLinks.
     */
    distinct?: EmailDeltaLinkScalarFieldEnum | EmailDeltaLinkScalarFieldEnum[]
  }

  /**
   * EmailDeltaLink findMany
   */
  export type EmailDeltaLinkFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    /**
     * Filter, which EmailDeltaLinks to fetch.
     */
    where?: EmailDeltaLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailDeltaLinks to fetch.
     */
    orderBy?: EmailDeltaLinkOrderByWithRelationInput | EmailDeltaLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmailDeltaLinks.
     */
    cursor?: EmailDeltaLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailDeltaLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailDeltaLinks.
     */
    skip?: number
    distinct?: EmailDeltaLinkScalarFieldEnum | EmailDeltaLinkScalarFieldEnum[]
  }

  /**
   * EmailDeltaLink create
   */
  export type EmailDeltaLinkCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    /**
     * The data needed to create a EmailDeltaLink.
     */
    data: XOR<EmailDeltaLinkCreateInput, EmailDeltaLinkUncheckedCreateInput>
  }

  /**
   * EmailDeltaLink createMany
   */
  export type EmailDeltaLinkCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmailDeltaLinks.
     */
    data: EmailDeltaLinkCreateManyInput | EmailDeltaLinkCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmailDeltaLink createManyAndReturn
   */
  export type EmailDeltaLinkCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * The data used to create many EmailDeltaLinks.
     */
    data: EmailDeltaLinkCreateManyInput | EmailDeltaLinkCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmailDeltaLink update
   */
  export type EmailDeltaLinkUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    /**
     * The data needed to update a EmailDeltaLink.
     */
    data: XOR<EmailDeltaLinkUpdateInput, EmailDeltaLinkUncheckedUpdateInput>
    /**
     * Choose, which EmailDeltaLink to update.
     */
    where: EmailDeltaLinkWhereUniqueInput
  }

  /**
   * EmailDeltaLink updateMany
   */
  export type EmailDeltaLinkUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmailDeltaLinks.
     */
    data: XOR<EmailDeltaLinkUpdateManyMutationInput, EmailDeltaLinkUncheckedUpdateManyInput>
    /**
     * Filter which EmailDeltaLinks to update
     */
    where?: EmailDeltaLinkWhereInput
    /**
     * Limit how many EmailDeltaLinks to update.
     */
    limit?: number
  }

  /**
   * EmailDeltaLink updateManyAndReturn
   */
  export type EmailDeltaLinkUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * The data used to update EmailDeltaLinks.
     */
    data: XOR<EmailDeltaLinkUpdateManyMutationInput, EmailDeltaLinkUncheckedUpdateManyInput>
    /**
     * Filter which EmailDeltaLinks to update
     */
    where?: EmailDeltaLinkWhereInput
    /**
     * Limit how many EmailDeltaLinks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmailDeltaLink upsert
   */
  export type EmailDeltaLinkUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    /**
     * The filter to search for the EmailDeltaLink to update in case it exists.
     */
    where: EmailDeltaLinkWhereUniqueInput
    /**
     * In case the EmailDeltaLink found by the `where` argument doesn't exist, create a new EmailDeltaLink with this data.
     */
    create: XOR<EmailDeltaLinkCreateInput, EmailDeltaLinkUncheckedCreateInput>
    /**
     * In case the EmailDeltaLink was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmailDeltaLinkUpdateInput, EmailDeltaLinkUncheckedUpdateInput>
  }

  /**
   * EmailDeltaLink delete
   */
  export type EmailDeltaLinkDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
    /**
     * Filter which EmailDeltaLink to delete.
     */
    where: EmailDeltaLinkWhereUniqueInput
  }

  /**
   * EmailDeltaLink deleteMany
   */
  export type EmailDeltaLinkDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailDeltaLinks to delete
     */
    where?: EmailDeltaLinkWhereInput
    /**
     * Limit how many EmailDeltaLinks to delete.
     */
    limit?: number
  }

  /**
   * EmailDeltaLink without action
   */
  export type EmailDeltaLinkDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailDeltaLink
     */
    select?: EmailDeltaLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailDeltaLink
     */
    omit?: EmailDeltaLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailDeltaLinkInclude<ExtArgs> | null
  }


  /**
   * Model WebhookSubscription
   */

  export type AggregateWebhookSubscription = {
    _count: WebhookSubscriptionCountAggregateOutputType | null
    _min: WebhookSubscriptionMinAggregateOutputType | null
    _max: WebhookSubscriptionMaxAggregateOutputType | null
  }

  export type WebhookSubscriptionMinAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    subscriptionId: string | null
    resource: string | null
    expiresAt: Date | null
    clientState: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WebhookSubscriptionMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    subscriptionId: string | null
    resource: string | null
    expiresAt: Date | null
    clientState: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WebhookSubscriptionCountAggregateOutputType = {
    id: number
    userId: number
    homeAccountId: number
    subscriptionId: number
    resource: number
    expiresAt: number
    clientState: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WebhookSubscriptionMinAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    subscriptionId?: true
    resource?: true
    expiresAt?: true
    clientState?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WebhookSubscriptionMaxAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    subscriptionId?: true
    resource?: true
    expiresAt?: true
    clientState?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WebhookSubscriptionCountAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    subscriptionId?: true
    resource?: true
    expiresAt?: true
    clientState?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WebhookSubscriptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WebhookSubscription to aggregate.
     */
    where?: WebhookSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebhookSubscriptions to fetch.
     */
    orderBy?: WebhookSubscriptionOrderByWithRelationInput | WebhookSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WebhookSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebhookSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebhookSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WebhookSubscriptions
    **/
    _count?: true | WebhookSubscriptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WebhookSubscriptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WebhookSubscriptionMaxAggregateInputType
  }

  export type GetWebhookSubscriptionAggregateType<T extends WebhookSubscriptionAggregateArgs> = {
        [P in keyof T & keyof AggregateWebhookSubscription]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWebhookSubscription[P]>
      : GetScalarType<T[P], AggregateWebhookSubscription[P]>
  }




  export type WebhookSubscriptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WebhookSubscriptionWhereInput
    orderBy?: WebhookSubscriptionOrderByWithAggregationInput | WebhookSubscriptionOrderByWithAggregationInput[]
    by: WebhookSubscriptionScalarFieldEnum[] | WebhookSubscriptionScalarFieldEnum
    having?: WebhookSubscriptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WebhookSubscriptionCountAggregateInputType | true
    _min?: WebhookSubscriptionMinAggregateInputType
    _max?: WebhookSubscriptionMaxAggregateInputType
  }

  export type WebhookSubscriptionGroupByOutputType = {
    id: string
    userId: string
    homeAccountId: string
    subscriptionId: string
    resource: string
    expiresAt: Date
    clientState: string
    createdAt: Date
    updatedAt: Date
    _count: WebhookSubscriptionCountAggregateOutputType | null
    _min: WebhookSubscriptionMinAggregateOutputType | null
    _max: WebhookSubscriptionMaxAggregateOutputType | null
  }

  type GetWebhookSubscriptionGroupByPayload<T extends WebhookSubscriptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WebhookSubscriptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WebhookSubscriptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WebhookSubscriptionGroupByOutputType[P]>
            : GetScalarType<T[P], WebhookSubscriptionGroupByOutputType[P]>
        }
      >
    >


  export type WebhookSubscriptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    subscriptionId?: boolean
    resource?: boolean
    expiresAt?: boolean
    clientState?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["webhookSubscription"]>

  export type WebhookSubscriptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    subscriptionId?: boolean
    resource?: boolean
    expiresAt?: boolean
    clientState?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["webhookSubscription"]>

  export type WebhookSubscriptionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    subscriptionId?: boolean
    resource?: boolean
    expiresAt?: boolean
    clientState?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["webhookSubscription"]>

  export type WebhookSubscriptionSelectScalar = {
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    subscriptionId?: boolean
    resource?: boolean
    expiresAt?: boolean
    clientState?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WebhookSubscriptionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "homeAccountId" | "subscriptionId" | "resource" | "expiresAt" | "clientState" | "createdAt" | "updatedAt", ExtArgs["result"]["webhookSubscription"]>
  export type WebhookSubscriptionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WebhookSubscriptionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type WebhookSubscriptionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $WebhookSubscriptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WebhookSubscription"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      homeAccountId: string
      subscriptionId: string
      resource: string
      expiresAt: Date
      clientState: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["webhookSubscription"]>
    composites: {}
  }

  type WebhookSubscriptionGetPayload<S extends boolean | null | undefined | WebhookSubscriptionDefaultArgs> = $Result.GetResult<Prisma.$WebhookSubscriptionPayload, S>

  type WebhookSubscriptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WebhookSubscriptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WebhookSubscriptionCountAggregateInputType | true
    }

  export interface WebhookSubscriptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WebhookSubscription'], meta: { name: 'WebhookSubscription' } }
    /**
     * Find zero or one WebhookSubscription that matches the filter.
     * @param {WebhookSubscriptionFindUniqueArgs} args - Arguments to find a WebhookSubscription
     * @example
     * // Get one WebhookSubscription
     * const webhookSubscription = await prisma.webhookSubscription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WebhookSubscriptionFindUniqueArgs>(args: SelectSubset<T, WebhookSubscriptionFindUniqueArgs<ExtArgs>>): Prisma__WebhookSubscriptionClient<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WebhookSubscription that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WebhookSubscriptionFindUniqueOrThrowArgs} args - Arguments to find a WebhookSubscription
     * @example
     * // Get one WebhookSubscription
     * const webhookSubscription = await prisma.webhookSubscription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WebhookSubscriptionFindUniqueOrThrowArgs>(args: SelectSubset<T, WebhookSubscriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WebhookSubscriptionClient<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WebhookSubscription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookSubscriptionFindFirstArgs} args - Arguments to find a WebhookSubscription
     * @example
     * // Get one WebhookSubscription
     * const webhookSubscription = await prisma.webhookSubscription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WebhookSubscriptionFindFirstArgs>(args?: SelectSubset<T, WebhookSubscriptionFindFirstArgs<ExtArgs>>): Prisma__WebhookSubscriptionClient<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WebhookSubscription that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookSubscriptionFindFirstOrThrowArgs} args - Arguments to find a WebhookSubscription
     * @example
     * // Get one WebhookSubscription
     * const webhookSubscription = await prisma.webhookSubscription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WebhookSubscriptionFindFirstOrThrowArgs>(args?: SelectSubset<T, WebhookSubscriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__WebhookSubscriptionClient<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WebhookSubscriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookSubscriptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WebhookSubscriptions
     * const webhookSubscriptions = await prisma.webhookSubscription.findMany()
     * 
     * // Get first 10 WebhookSubscriptions
     * const webhookSubscriptions = await prisma.webhookSubscription.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const webhookSubscriptionWithIdOnly = await prisma.webhookSubscription.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WebhookSubscriptionFindManyArgs>(args?: SelectSubset<T, WebhookSubscriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WebhookSubscription.
     * @param {WebhookSubscriptionCreateArgs} args - Arguments to create a WebhookSubscription.
     * @example
     * // Create one WebhookSubscription
     * const WebhookSubscription = await prisma.webhookSubscription.create({
     *   data: {
     *     // ... data to create a WebhookSubscription
     *   }
     * })
     * 
     */
    create<T extends WebhookSubscriptionCreateArgs>(args: SelectSubset<T, WebhookSubscriptionCreateArgs<ExtArgs>>): Prisma__WebhookSubscriptionClient<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WebhookSubscriptions.
     * @param {WebhookSubscriptionCreateManyArgs} args - Arguments to create many WebhookSubscriptions.
     * @example
     * // Create many WebhookSubscriptions
     * const webhookSubscription = await prisma.webhookSubscription.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WebhookSubscriptionCreateManyArgs>(args?: SelectSubset<T, WebhookSubscriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WebhookSubscriptions and returns the data saved in the database.
     * @param {WebhookSubscriptionCreateManyAndReturnArgs} args - Arguments to create many WebhookSubscriptions.
     * @example
     * // Create many WebhookSubscriptions
     * const webhookSubscription = await prisma.webhookSubscription.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WebhookSubscriptions and only return the `id`
     * const webhookSubscriptionWithIdOnly = await prisma.webhookSubscription.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WebhookSubscriptionCreateManyAndReturnArgs>(args?: SelectSubset<T, WebhookSubscriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WebhookSubscription.
     * @param {WebhookSubscriptionDeleteArgs} args - Arguments to delete one WebhookSubscription.
     * @example
     * // Delete one WebhookSubscription
     * const WebhookSubscription = await prisma.webhookSubscription.delete({
     *   where: {
     *     // ... filter to delete one WebhookSubscription
     *   }
     * })
     * 
     */
    delete<T extends WebhookSubscriptionDeleteArgs>(args: SelectSubset<T, WebhookSubscriptionDeleteArgs<ExtArgs>>): Prisma__WebhookSubscriptionClient<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WebhookSubscription.
     * @param {WebhookSubscriptionUpdateArgs} args - Arguments to update one WebhookSubscription.
     * @example
     * // Update one WebhookSubscription
     * const webhookSubscription = await prisma.webhookSubscription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WebhookSubscriptionUpdateArgs>(args: SelectSubset<T, WebhookSubscriptionUpdateArgs<ExtArgs>>): Prisma__WebhookSubscriptionClient<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WebhookSubscriptions.
     * @param {WebhookSubscriptionDeleteManyArgs} args - Arguments to filter WebhookSubscriptions to delete.
     * @example
     * // Delete a few WebhookSubscriptions
     * const { count } = await prisma.webhookSubscription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WebhookSubscriptionDeleteManyArgs>(args?: SelectSubset<T, WebhookSubscriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WebhookSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookSubscriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WebhookSubscriptions
     * const webhookSubscription = await prisma.webhookSubscription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WebhookSubscriptionUpdateManyArgs>(args: SelectSubset<T, WebhookSubscriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WebhookSubscriptions and returns the data updated in the database.
     * @param {WebhookSubscriptionUpdateManyAndReturnArgs} args - Arguments to update many WebhookSubscriptions.
     * @example
     * // Update many WebhookSubscriptions
     * const webhookSubscription = await prisma.webhookSubscription.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WebhookSubscriptions and only return the `id`
     * const webhookSubscriptionWithIdOnly = await prisma.webhookSubscription.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WebhookSubscriptionUpdateManyAndReturnArgs>(args: SelectSubset<T, WebhookSubscriptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WebhookSubscription.
     * @param {WebhookSubscriptionUpsertArgs} args - Arguments to update or create a WebhookSubscription.
     * @example
     * // Update or create a WebhookSubscription
     * const webhookSubscription = await prisma.webhookSubscription.upsert({
     *   create: {
     *     // ... data to create a WebhookSubscription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WebhookSubscription we want to update
     *   }
     * })
     */
    upsert<T extends WebhookSubscriptionUpsertArgs>(args: SelectSubset<T, WebhookSubscriptionUpsertArgs<ExtArgs>>): Prisma__WebhookSubscriptionClient<$Result.GetResult<Prisma.$WebhookSubscriptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WebhookSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookSubscriptionCountArgs} args - Arguments to filter WebhookSubscriptions to count.
     * @example
     * // Count the number of WebhookSubscriptions
     * const count = await prisma.webhookSubscription.count({
     *   where: {
     *     // ... the filter for the WebhookSubscriptions we want to count
     *   }
     * })
    **/
    count<T extends WebhookSubscriptionCountArgs>(
      args?: Subset<T, WebhookSubscriptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WebhookSubscriptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WebhookSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookSubscriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WebhookSubscriptionAggregateArgs>(args: Subset<T, WebhookSubscriptionAggregateArgs>): Prisma.PrismaPromise<GetWebhookSubscriptionAggregateType<T>>

    /**
     * Group by WebhookSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookSubscriptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WebhookSubscriptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WebhookSubscriptionGroupByArgs['orderBy'] }
        : { orderBy?: WebhookSubscriptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WebhookSubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWebhookSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WebhookSubscription model
   */
  readonly fields: WebhookSubscriptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WebhookSubscription.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WebhookSubscriptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WebhookSubscription model
   */
  interface WebhookSubscriptionFieldRefs {
    readonly id: FieldRef<"WebhookSubscription", 'String'>
    readonly userId: FieldRef<"WebhookSubscription", 'String'>
    readonly homeAccountId: FieldRef<"WebhookSubscription", 'String'>
    readonly subscriptionId: FieldRef<"WebhookSubscription", 'String'>
    readonly resource: FieldRef<"WebhookSubscription", 'String'>
    readonly expiresAt: FieldRef<"WebhookSubscription", 'DateTime'>
    readonly clientState: FieldRef<"WebhookSubscription", 'String'>
    readonly createdAt: FieldRef<"WebhookSubscription", 'DateTime'>
    readonly updatedAt: FieldRef<"WebhookSubscription", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WebhookSubscription findUnique
   */
  export type WebhookSubscriptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which WebhookSubscription to fetch.
     */
    where: WebhookSubscriptionWhereUniqueInput
  }

  /**
   * WebhookSubscription findUniqueOrThrow
   */
  export type WebhookSubscriptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which WebhookSubscription to fetch.
     */
    where: WebhookSubscriptionWhereUniqueInput
  }

  /**
   * WebhookSubscription findFirst
   */
  export type WebhookSubscriptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which WebhookSubscription to fetch.
     */
    where?: WebhookSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebhookSubscriptions to fetch.
     */
    orderBy?: WebhookSubscriptionOrderByWithRelationInput | WebhookSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WebhookSubscriptions.
     */
    cursor?: WebhookSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebhookSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebhookSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WebhookSubscriptions.
     */
    distinct?: WebhookSubscriptionScalarFieldEnum | WebhookSubscriptionScalarFieldEnum[]
  }

  /**
   * WebhookSubscription findFirstOrThrow
   */
  export type WebhookSubscriptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which WebhookSubscription to fetch.
     */
    where?: WebhookSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebhookSubscriptions to fetch.
     */
    orderBy?: WebhookSubscriptionOrderByWithRelationInput | WebhookSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WebhookSubscriptions.
     */
    cursor?: WebhookSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebhookSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebhookSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WebhookSubscriptions.
     */
    distinct?: WebhookSubscriptionScalarFieldEnum | WebhookSubscriptionScalarFieldEnum[]
  }

  /**
   * WebhookSubscription findMany
   */
  export type WebhookSubscriptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which WebhookSubscriptions to fetch.
     */
    where?: WebhookSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebhookSubscriptions to fetch.
     */
    orderBy?: WebhookSubscriptionOrderByWithRelationInput | WebhookSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WebhookSubscriptions.
     */
    cursor?: WebhookSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebhookSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebhookSubscriptions.
     */
    skip?: number
    distinct?: WebhookSubscriptionScalarFieldEnum | WebhookSubscriptionScalarFieldEnum[]
  }

  /**
   * WebhookSubscription create
   */
  export type WebhookSubscriptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to create a WebhookSubscription.
     */
    data: XOR<WebhookSubscriptionCreateInput, WebhookSubscriptionUncheckedCreateInput>
  }

  /**
   * WebhookSubscription createMany
   */
  export type WebhookSubscriptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WebhookSubscriptions.
     */
    data: WebhookSubscriptionCreateManyInput | WebhookSubscriptionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WebhookSubscription createManyAndReturn
   */
  export type WebhookSubscriptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * The data used to create many WebhookSubscriptions.
     */
    data: WebhookSubscriptionCreateManyInput | WebhookSubscriptionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WebhookSubscription update
   */
  export type WebhookSubscriptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to update a WebhookSubscription.
     */
    data: XOR<WebhookSubscriptionUpdateInput, WebhookSubscriptionUncheckedUpdateInput>
    /**
     * Choose, which WebhookSubscription to update.
     */
    where: WebhookSubscriptionWhereUniqueInput
  }

  /**
   * WebhookSubscription updateMany
   */
  export type WebhookSubscriptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WebhookSubscriptions.
     */
    data: XOR<WebhookSubscriptionUpdateManyMutationInput, WebhookSubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which WebhookSubscriptions to update
     */
    where?: WebhookSubscriptionWhereInput
    /**
     * Limit how many WebhookSubscriptions to update.
     */
    limit?: number
  }

  /**
   * WebhookSubscription updateManyAndReturn
   */
  export type WebhookSubscriptionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * The data used to update WebhookSubscriptions.
     */
    data: XOR<WebhookSubscriptionUpdateManyMutationInput, WebhookSubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which WebhookSubscriptions to update
     */
    where?: WebhookSubscriptionWhereInput
    /**
     * Limit how many WebhookSubscriptions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WebhookSubscription upsert
   */
  export type WebhookSubscriptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    /**
     * The filter to search for the WebhookSubscription to update in case it exists.
     */
    where: WebhookSubscriptionWhereUniqueInput
    /**
     * In case the WebhookSubscription found by the `where` argument doesn't exist, create a new WebhookSubscription with this data.
     */
    create: XOR<WebhookSubscriptionCreateInput, WebhookSubscriptionUncheckedCreateInput>
    /**
     * In case the WebhookSubscription was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WebhookSubscriptionUpdateInput, WebhookSubscriptionUncheckedUpdateInput>
  }

  /**
   * WebhookSubscription delete
   */
  export type WebhookSubscriptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
    /**
     * Filter which WebhookSubscription to delete.
     */
    where: WebhookSubscriptionWhereUniqueInput
  }

  /**
   * WebhookSubscription deleteMany
   */
  export type WebhookSubscriptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WebhookSubscriptions to delete
     */
    where?: WebhookSubscriptionWhereInput
    /**
     * Limit how many WebhookSubscriptions to delete.
     */
    limit?: number
  }

  /**
   * WebhookSubscription without action
   */
  export type WebhookSubscriptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookSubscription
     */
    select?: WebhookSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookSubscription
     */
    omit?: WebhookSubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookSubscriptionInclude<ExtArgs> | null
  }


  /**
   * Model Draft
   */

  export type AggregateDraft = {
    _count: DraftCountAggregateOutputType | null
    _min: DraftMinAggregateOutputType | null
    _max: DraftMaxAggregateOutputType | null
  }

  export type DraftMinAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    graphDraftId: string | null
    subject: string | null
    bodyHtml: string | null
    importance: string | null
    requestReadReceipt: boolean | null
    draftType: string | null
    inReplyToMessageId: string | null
    forwardedMessageId: string | null
    scheduledAt: Date | null
    scheduledSent: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DraftMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    graphDraftId: string | null
    subject: string | null
    bodyHtml: string | null
    importance: string | null
    requestReadReceipt: boolean | null
    draftType: string | null
    inReplyToMessageId: string | null
    forwardedMessageId: string | null
    scheduledAt: Date | null
    scheduledSent: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DraftCountAggregateOutputType = {
    id: number
    userId: number
    homeAccountId: number
    graphDraftId: number
    toRecipients: number
    ccRecipients: number
    bccRecipients: number
    subject: number
    bodyHtml: number
    attachments: number
    importance: number
    requestReadReceipt: number
    draftType: number
    inReplyToMessageId: number
    forwardedMessageId: number
    scheduledAt: number
    scheduledSent: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DraftMinAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    graphDraftId?: true
    subject?: true
    bodyHtml?: true
    importance?: true
    requestReadReceipt?: true
    draftType?: true
    inReplyToMessageId?: true
    forwardedMessageId?: true
    scheduledAt?: true
    scheduledSent?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DraftMaxAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    graphDraftId?: true
    subject?: true
    bodyHtml?: true
    importance?: true
    requestReadReceipt?: true
    draftType?: true
    inReplyToMessageId?: true
    forwardedMessageId?: true
    scheduledAt?: true
    scheduledSent?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DraftCountAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    graphDraftId?: true
    toRecipients?: true
    ccRecipients?: true
    bccRecipients?: true
    subject?: true
    bodyHtml?: true
    attachments?: true
    importance?: true
    requestReadReceipt?: true
    draftType?: true
    inReplyToMessageId?: true
    forwardedMessageId?: true
    scheduledAt?: true
    scheduledSent?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DraftAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Draft to aggregate.
     */
    where?: DraftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drafts to fetch.
     */
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DraftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drafts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drafts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Drafts
    **/
    _count?: true | DraftCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DraftMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DraftMaxAggregateInputType
  }

  export type GetDraftAggregateType<T extends DraftAggregateArgs> = {
        [P in keyof T & keyof AggregateDraft]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDraft[P]>
      : GetScalarType<T[P], AggregateDraft[P]>
  }




  export type DraftGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DraftWhereInput
    orderBy?: DraftOrderByWithAggregationInput | DraftOrderByWithAggregationInput[]
    by: DraftScalarFieldEnum[] | DraftScalarFieldEnum
    having?: DraftScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DraftCountAggregateInputType | true
    _min?: DraftMinAggregateInputType
    _max?: DraftMaxAggregateInputType
  }

  export type DraftGroupByOutputType = {
    id: string
    userId: string
    homeAccountId: string | null
    graphDraftId: string | null
    toRecipients: JsonValue
    ccRecipients: JsonValue
    bccRecipients: JsonValue
    subject: string | null
    bodyHtml: string | null
    attachments: JsonValue
    importance: string
    requestReadReceipt: boolean
    draftType: string
    inReplyToMessageId: string | null
    forwardedMessageId: string | null
    scheduledAt: Date | null
    scheduledSent: boolean
    createdAt: Date
    updatedAt: Date
    _count: DraftCountAggregateOutputType | null
    _min: DraftMinAggregateOutputType | null
    _max: DraftMaxAggregateOutputType | null
  }

  type GetDraftGroupByPayload<T extends DraftGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DraftGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DraftGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DraftGroupByOutputType[P]>
            : GetScalarType<T[P], DraftGroupByOutputType[P]>
        }
      >
    >


  export type DraftSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    graphDraftId?: boolean
    toRecipients?: boolean
    ccRecipients?: boolean
    bccRecipients?: boolean
    subject?: boolean
    bodyHtml?: boolean
    attachments?: boolean
    importance?: boolean
    requestReadReceipt?: boolean
    draftType?: boolean
    inReplyToMessageId?: boolean
    forwardedMessageId?: boolean
    scheduledAt?: boolean
    scheduledSent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["draft"]>

  export type DraftSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    graphDraftId?: boolean
    toRecipients?: boolean
    ccRecipients?: boolean
    bccRecipients?: boolean
    subject?: boolean
    bodyHtml?: boolean
    attachments?: boolean
    importance?: boolean
    requestReadReceipt?: boolean
    draftType?: boolean
    inReplyToMessageId?: boolean
    forwardedMessageId?: boolean
    scheduledAt?: boolean
    scheduledSent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["draft"]>

  export type DraftSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    graphDraftId?: boolean
    toRecipients?: boolean
    ccRecipients?: boolean
    bccRecipients?: boolean
    subject?: boolean
    bodyHtml?: boolean
    attachments?: boolean
    importance?: boolean
    requestReadReceipt?: boolean
    draftType?: boolean
    inReplyToMessageId?: boolean
    forwardedMessageId?: boolean
    scheduledAt?: boolean
    scheduledSent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["draft"]>

  export type DraftSelectScalar = {
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    graphDraftId?: boolean
    toRecipients?: boolean
    ccRecipients?: boolean
    bccRecipients?: boolean
    subject?: boolean
    bodyHtml?: boolean
    attachments?: boolean
    importance?: boolean
    requestReadReceipt?: boolean
    draftType?: boolean
    inReplyToMessageId?: boolean
    forwardedMessageId?: boolean
    scheduledAt?: boolean
    scheduledSent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DraftOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "homeAccountId" | "graphDraftId" | "toRecipients" | "ccRecipients" | "bccRecipients" | "subject" | "bodyHtml" | "attachments" | "importance" | "requestReadReceipt" | "draftType" | "inReplyToMessageId" | "forwardedMessageId" | "scheduledAt" | "scheduledSent" | "createdAt" | "updatedAt", ExtArgs["result"]["draft"]>
  export type DraftInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DraftIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DraftIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DraftPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Draft"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      homeAccountId: string | null
      graphDraftId: string | null
      toRecipients: Prisma.JsonValue
      ccRecipients: Prisma.JsonValue
      bccRecipients: Prisma.JsonValue
      subject: string | null
      bodyHtml: string | null
      attachments: Prisma.JsonValue
      importance: string
      requestReadReceipt: boolean
      draftType: string
      inReplyToMessageId: string | null
      forwardedMessageId: string | null
      scheduledAt: Date | null
      scheduledSent: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["draft"]>
    composites: {}
  }

  type DraftGetPayload<S extends boolean | null | undefined | DraftDefaultArgs> = $Result.GetResult<Prisma.$DraftPayload, S>

  type DraftCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DraftFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DraftCountAggregateInputType | true
    }

  export interface DraftDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Draft'], meta: { name: 'Draft' } }
    /**
     * Find zero or one Draft that matches the filter.
     * @param {DraftFindUniqueArgs} args - Arguments to find a Draft
     * @example
     * // Get one Draft
     * const draft = await prisma.draft.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DraftFindUniqueArgs>(args: SelectSubset<T, DraftFindUniqueArgs<ExtArgs>>): Prisma__DraftClient<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Draft that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DraftFindUniqueOrThrowArgs} args - Arguments to find a Draft
     * @example
     * // Get one Draft
     * const draft = await prisma.draft.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DraftFindUniqueOrThrowArgs>(args: SelectSubset<T, DraftFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DraftClient<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Draft that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftFindFirstArgs} args - Arguments to find a Draft
     * @example
     * // Get one Draft
     * const draft = await prisma.draft.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DraftFindFirstArgs>(args?: SelectSubset<T, DraftFindFirstArgs<ExtArgs>>): Prisma__DraftClient<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Draft that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftFindFirstOrThrowArgs} args - Arguments to find a Draft
     * @example
     * // Get one Draft
     * const draft = await prisma.draft.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DraftFindFirstOrThrowArgs>(args?: SelectSubset<T, DraftFindFirstOrThrowArgs<ExtArgs>>): Prisma__DraftClient<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Drafts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Drafts
     * const drafts = await prisma.draft.findMany()
     * 
     * // Get first 10 Drafts
     * const drafts = await prisma.draft.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const draftWithIdOnly = await prisma.draft.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DraftFindManyArgs>(args?: SelectSubset<T, DraftFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Draft.
     * @param {DraftCreateArgs} args - Arguments to create a Draft.
     * @example
     * // Create one Draft
     * const Draft = await prisma.draft.create({
     *   data: {
     *     // ... data to create a Draft
     *   }
     * })
     * 
     */
    create<T extends DraftCreateArgs>(args: SelectSubset<T, DraftCreateArgs<ExtArgs>>): Prisma__DraftClient<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Drafts.
     * @param {DraftCreateManyArgs} args - Arguments to create many Drafts.
     * @example
     * // Create many Drafts
     * const draft = await prisma.draft.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DraftCreateManyArgs>(args?: SelectSubset<T, DraftCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Drafts and returns the data saved in the database.
     * @param {DraftCreateManyAndReturnArgs} args - Arguments to create many Drafts.
     * @example
     * // Create many Drafts
     * const draft = await prisma.draft.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Drafts and only return the `id`
     * const draftWithIdOnly = await prisma.draft.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DraftCreateManyAndReturnArgs>(args?: SelectSubset<T, DraftCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Draft.
     * @param {DraftDeleteArgs} args - Arguments to delete one Draft.
     * @example
     * // Delete one Draft
     * const Draft = await prisma.draft.delete({
     *   where: {
     *     // ... filter to delete one Draft
     *   }
     * })
     * 
     */
    delete<T extends DraftDeleteArgs>(args: SelectSubset<T, DraftDeleteArgs<ExtArgs>>): Prisma__DraftClient<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Draft.
     * @param {DraftUpdateArgs} args - Arguments to update one Draft.
     * @example
     * // Update one Draft
     * const draft = await prisma.draft.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DraftUpdateArgs>(args: SelectSubset<T, DraftUpdateArgs<ExtArgs>>): Prisma__DraftClient<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Drafts.
     * @param {DraftDeleteManyArgs} args - Arguments to filter Drafts to delete.
     * @example
     * // Delete a few Drafts
     * const { count } = await prisma.draft.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DraftDeleteManyArgs>(args?: SelectSubset<T, DraftDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Drafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Drafts
     * const draft = await prisma.draft.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DraftUpdateManyArgs>(args: SelectSubset<T, DraftUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Drafts and returns the data updated in the database.
     * @param {DraftUpdateManyAndReturnArgs} args - Arguments to update many Drafts.
     * @example
     * // Update many Drafts
     * const draft = await prisma.draft.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Drafts and only return the `id`
     * const draftWithIdOnly = await prisma.draft.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DraftUpdateManyAndReturnArgs>(args: SelectSubset<T, DraftUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Draft.
     * @param {DraftUpsertArgs} args - Arguments to update or create a Draft.
     * @example
     * // Update or create a Draft
     * const draft = await prisma.draft.upsert({
     *   create: {
     *     // ... data to create a Draft
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Draft we want to update
     *   }
     * })
     */
    upsert<T extends DraftUpsertArgs>(args: SelectSubset<T, DraftUpsertArgs<ExtArgs>>): Prisma__DraftClient<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Drafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftCountArgs} args - Arguments to filter Drafts to count.
     * @example
     * // Count the number of Drafts
     * const count = await prisma.draft.count({
     *   where: {
     *     // ... the filter for the Drafts we want to count
     *   }
     * })
    **/
    count<T extends DraftCountArgs>(
      args?: Subset<T, DraftCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DraftCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Draft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DraftAggregateArgs>(args: Subset<T, DraftAggregateArgs>): Prisma.PrismaPromise<GetDraftAggregateType<T>>

    /**
     * Group by Draft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DraftGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DraftGroupByArgs['orderBy'] }
        : { orderBy?: DraftGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DraftGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDraftGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Draft model
   */
  readonly fields: DraftFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Draft.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DraftClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Draft model
   */
  interface DraftFieldRefs {
    readonly id: FieldRef<"Draft", 'String'>
    readonly userId: FieldRef<"Draft", 'String'>
    readonly homeAccountId: FieldRef<"Draft", 'String'>
    readonly graphDraftId: FieldRef<"Draft", 'String'>
    readonly toRecipients: FieldRef<"Draft", 'Json'>
    readonly ccRecipients: FieldRef<"Draft", 'Json'>
    readonly bccRecipients: FieldRef<"Draft", 'Json'>
    readonly subject: FieldRef<"Draft", 'String'>
    readonly bodyHtml: FieldRef<"Draft", 'String'>
    readonly attachments: FieldRef<"Draft", 'Json'>
    readonly importance: FieldRef<"Draft", 'String'>
    readonly requestReadReceipt: FieldRef<"Draft", 'Boolean'>
    readonly draftType: FieldRef<"Draft", 'String'>
    readonly inReplyToMessageId: FieldRef<"Draft", 'String'>
    readonly forwardedMessageId: FieldRef<"Draft", 'String'>
    readonly scheduledAt: FieldRef<"Draft", 'DateTime'>
    readonly scheduledSent: FieldRef<"Draft", 'Boolean'>
    readonly createdAt: FieldRef<"Draft", 'DateTime'>
    readonly updatedAt: FieldRef<"Draft", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Draft findUnique
   */
  export type DraftFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    /**
     * Filter, which Draft to fetch.
     */
    where: DraftWhereUniqueInput
  }

  /**
   * Draft findUniqueOrThrow
   */
  export type DraftFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    /**
     * Filter, which Draft to fetch.
     */
    where: DraftWhereUniqueInput
  }

  /**
   * Draft findFirst
   */
  export type DraftFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    /**
     * Filter, which Draft to fetch.
     */
    where?: DraftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drafts to fetch.
     */
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drafts.
     */
    cursor?: DraftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drafts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drafts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drafts.
     */
    distinct?: DraftScalarFieldEnum | DraftScalarFieldEnum[]
  }

  /**
   * Draft findFirstOrThrow
   */
  export type DraftFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    /**
     * Filter, which Draft to fetch.
     */
    where?: DraftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drafts to fetch.
     */
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drafts.
     */
    cursor?: DraftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drafts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drafts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drafts.
     */
    distinct?: DraftScalarFieldEnum | DraftScalarFieldEnum[]
  }

  /**
   * Draft findMany
   */
  export type DraftFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    /**
     * Filter, which Drafts to fetch.
     */
    where?: DraftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drafts to fetch.
     */
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Drafts.
     */
    cursor?: DraftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drafts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drafts.
     */
    skip?: number
    distinct?: DraftScalarFieldEnum | DraftScalarFieldEnum[]
  }

  /**
   * Draft create
   */
  export type DraftCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    /**
     * The data needed to create a Draft.
     */
    data: XOR<DraftCreateInput, DraftUncheckedCreateInput>
  }

  /**
   * Draft createMany
   */
  export type DraftCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Drafts.
     */
    data: DraftCreateManyInput | DraftCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Draft createManyAndReturn
   */
  export type DraftCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * The data used to create many Drafts.
     */
    data: DraftCreateManyInput | DraftCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Draft update
   */
  export type DraftUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    /**
     * The data needed to update a Draft.
     */
    data: XOR<DraftUpdateInput, DraftUncheckedUpdateInput>
    /**
     * Choose, which Draft to update.
     */
    where: DraftWhereUniqueInput
  }

  /**
   * Draft updateMany
   */
  export type DraftUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Drafts.
     */
    data: XOR<DraftUpdateManyMutationInput, DraftUncheckedUpdateManyInput>
    /**
     * Filter which Drafts to update
     */
    where?: DraftWhereInput
    /**
     * Limit how many Drafts to update.
     */
    limit?: number
  }

  /**
   * Draft updateManyAndReturn
   */
  export type DraftUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * The data used to update Drafts.
     */
    data: XOR<DraftUpdateManyMutationInput, DraftUncheckedUpdateManyInput>
    /**
     * Filter which Drafts to update
     */
    where?: DraftWhereInput
    /**
     * Limit how many Drafts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Draft upsert
   */
  export type DraftUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    /**
     * The filter to search for the Draft to update in case it exists.
     */
    where: DraftWhereUniqueInput
    /**
     * In case the Draft found by the `where` argument doesn't exist, create a new Draft with this data.
     */
    create: XOR<DraftCreateInput, DraftUncheckedCreateInput>
    /**
     * In case the Draft was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DraftUpdateInput, DraftUncheckedUpdateInput>
  }

  /**
   * Draft delete
   */
  export type DraftDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
    /**
     * Filter which Draft to delete.
     */
    where: DraftWhereUniqueInput
  }

  /**
   * Draft deleteMany
   */
  export type DraftDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Drafts to delete
     */
    where?: DraftWhereInput
    /**
     * Limit how many Drafts to delete.
     */
    limit?: number
  }

  /**
   * Draft without action
   */
  export type DraftDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Draft
     */
    omit?: DraftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null
  }


  /**
   * Model Signature
   */

  export type AggregateSignature = {
    _count: SignatureCountAggregateOutputType | null
    _min: SignatureMinAggregateOutputType | null
    _max: SignatureMaxAggregateOutputType | null
  }

  export type SignatureMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    html: string | null
    title: string | null
    company: string | null
    phone: string | null
    defaultNew: boolean | null
    defaultReplies: boolean | null
    account: string | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SignatureMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    html: string | null
    title: string | null
    company: string | null
    phone: string | null
    defaultNew: boolean | null
    defaultReplies: boolean | null
    account: string | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SignatureCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    html: number
    title: number
    company: number
    phone: number
    defaultNew: number
    defaultReplies: number
    account: number
    isDefault: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SignatureMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    html?: true
    title?: true
    company?: true
    phone?: true
    defaultNew?: true
    defaultReplies?: true
    account?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SignatureMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    html?: true
    title?: true
    company?: true
    phone?: true
    defaultNew?: true
    defaultReplies?: true
    account?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SignatureCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    html?: true
    title?: true
    company?: true
    phone?: true
    defaultNew?: true
    defaultReplies?: true
    account?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SignatureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Signature to aggregate.
     */
    where?: SignatureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signatures to fetch.
     */
    orderBy?: SignatureOrderByWithRelationInput | SignatureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SignatureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signatures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signatures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Signatures
    **/
    _count?: true | SignatureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SignatureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SignatureMaxAggregateInputType
  }

  export type GetSignatureAggregateType<T extends SignatureAggregateArgs> = {
        [P in keyof T & keyof AggregateSignature]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSignature[P]>
      : GetScalarType<T[P], AggregateSignature[P]>
  }




  export type SignatureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignatureWhereInput
    orderBy?: SignatureOrderByWithAggregationInput | SignatureOrderByWithAggregationInput[]
    by: SignatureScalarFieldEnum[] | SignatureScalarFieldEnum
    having?: SignatureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SignatureCountAggregateInputType | true
    _min?: SignatureMinAggregateInputType
    _max?: SignatureMaxAggregateInputType
  }

  export type SignatureGroupByOutputType = {
    id: string
    userId: string
    name: string
    html: string
    title: string | null
    company: string | null
    phone: string | null
    defaultNew: boolean
    defaultReplies: boolean
    account: string
    isDefault: boolean
    createdAt: Date
    updatedAt: Date
    _count: SignatureCountAggregateOutputType | null
    _min: SignatureMinAggregateOutputType | null
    _max: SignatureMaxAggregateOutputType | null
  }

  type GetSignatureGroupByPayload<T extends SignatureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SignatureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SignatureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SignatureGroupByOutputType[P]>
            : GetScalarType<T[P], SignatureGroupByOutputType[P]>
        }
      >
    >


  export type SignatureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    html?: boolean
    title?: boolean
    company?: boolean
    phone?: boolean
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signature"]>

  export type SignatureSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    html?: boolean
    title?: boolean
    company?: boolean
    phone?: boolean
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signature"]>

  export type SignatureSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    html?: boolean
    title?: boolean
    company?: boolean
    phone?: boolean
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signature"]>

  export type SignatureSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    html?: boolean
    title?: boolean
    company?: boolean
    phone?: boolean
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SignatureOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "html" | "title" | "company" | "phone" | "defaultNew" | "defaultReplies" | "account" | "isDefault" | "createdAt" | "updatedAt", ExtArgs["result"]["signature"]>
  export type SignatureInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SignatureIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SignatureIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SignaturePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Signature"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      html: string
      title: string | null
      company: string | null
      phone: string | null
      defaultNew: boolean
      defaultReplies: boolean
      account: string
      isDefault: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["signature"]>
    composites: {}
  }

  type SignatureGetPayload<S extends boolean | null | undefined | SignatureDefaultArgs> = $Result.GetResult<Prisma.$SignaturePayload, S>

  type SignatureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SignatureFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SignatureCountAggregateInputType | true
    }

  export interface SignatureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Signature'], meta: { name: 'Signature' } }
    /**
     * Find zero or one Signature that matches the filter.
     * @param {SignatureFindUniqueArgs} args - Arguments to find a Signature
     * @example
     * // Get one Signature
     * const signature = await prisma.signature.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SignatureFindUniqueArgs>(args: SelectSubset<T, SignatureFindUniqueArgs<ExtArgs>>): Prisma__SignatureClient<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Signature that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SignatureFindUniqueOrThrowArgs} args - Arguments to find a Signature
     * @example
     * // Get one Signature
     * const signature = await prisma.signature.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SignatureFindUniqueOrThrowArgs>(args: SelectSubset<T, SignatureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SignatureClient<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Signature that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignatureFindFirstArgs} args - Arguments to find a Signature
     * @example
     * // Get one Signature
     * const signature = await prisma.signature.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SignatureFindFirstArgs>(args?: SelectSubset<T, SignatureFindFirstArgs<ExtArgs>>): Prisma__SignatureClient<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Signature that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignatureFindFirstOrThrowArgs} args - Arguments to find a Signature
     * @example
     * // Get one Signature
     * const signature = await prisma.signature.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SignatureFindFirstOrThrowArgs>(args?: SelectSubset<T, SignatureFindFirstOrThrowArgs<ExtArgs>>): Prisma__SignatureClient<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Signatures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignatureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Signatures
     * const signatures = await prisma.signature.findMany()
     * 
     * // Get first 10 Signatures
     * const signatures = await prisma.signature.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const signatureWithIdOnly = await prisma.signature.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SignatureFindManyArgs>(args?: SelectSubset<T, SignatureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Signature.
     * @param {SignatureCreateArgs} args - Arguments to create a Signature.
     * @example
     * // Create one Signature
     * const Signature = await prisma.signature.create({
     *   data: {
     *     // ... data to create a Signature
     *   }
     * })
     * 
     */
    create<T extends SignatureCreateArgs>(args: SelectSubset<T, SignatureCreateArgs<ExtArgs>>): Prisma__SignatureClient<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Signatures.
     * @param {SignatureCreateManyArgs} args - Arguments to create many Signatures.
     * @example
     * // Create many Signatures
     * const signature = await prisma.signature.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SignatureCreateManyArgs>(args?: SelectSubset<T, SignatureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Signatures and returns the data saved in the database.
     * @param {SignatureCreateManyAndReturnArgs} args - Arguments to create many Signatures.
     * @example
     * // Create many Signatures
     * const signature = await prisma.signature.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Signatures and only return the `id`
     * const signatureWithIdOnly = await prisma.signature.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SignatureCreateManyAndReturnArgs>(args?: SelectSubset<T, SignatureCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Signature.
     * @param {SignatureDeleteArgs} args - Arguments to delete one Signature.
     * @example
     * // Delete one Signature
     * const Signature = await prisma.signature.delete({
     *   where: {
     *     // ... filter to delete one Signature
     *   }
     * })
     * 
     */
    delete<T extends SignatureDeleteArgs>(args: SelectSubset<T, SignatureDeleteArgs<ExtArgs>>): Prisma__SignatureClient<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Signature.
     * @param {SignatureUpdateArgs} args - Arguments to update one Signature.
     * @example
     * // Update one Signature
     * const signature = await prisma.signature.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SignatureUpdateArgs>(args: SelectSubset<T, SignatureUpdateArgs<ExtArgs>>): Prisma__SignatureClient<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Signatures.
     * @param {SignatureDeleteManyArgs} args - Arguments to filter Signatures to delete.
     * @example
     * // Delete a few Signatures
     * const { count } = await prisma.signature.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SignatureDeleteManyArgs>(args?: SelectSubset<T, SignatureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Signatures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignatureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Signatures
     * const signature = await prisma.signature.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SignatureUpdateManyArgs>(args: SelectSubset<T, SignatureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Signatures and returns the data updated in the database.
     * @param {SignatureUpdateManyAndReturnArgs} args - Arguments to update many Signatures.
     * @example
     * // Update many Signatures
     * const signature = await prisma.signature.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Signatures and only return the `id`
     * const signatureWithIdOnly = await prisma.signature.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SignatureUpdateManyAndReturnArgs>(args: SelectSubset<T, SignatureUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Signature.
     * @param {SignatureUpsertArgs} args - Arguments to update or create a Signature.
     * @example
     * // Update or create a Signature
     * const signature = await prisma.signature.upsert({
     *   create: {
     *     // ... data to create a Signature
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Signature we want to update
     *   }
     * })
     */
    upsert<T extends SignatureUpsertArgs>(args: SelectSubset<T, SignatureUpsertArgs<ExtArgs>>): Prisma__SignatureClient<$Result.GetResult<Prisma.$SignaturePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Signatures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignatureCountArgs} args - Arguments to filter Signatures to count.
     * @example
     * // Count the number of Signatures
     * const count = await prisma.signature.count({
     *   where: {
     *     // ... the filter for the Signatures we want to count
     *   }
     * })
    **/
    count<T extends SignatureCountArgs>(
      args?: Subset<T, SignatureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SignatureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Signature.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignatureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SignatureAggregateArgs>(args: Subset<T, SignatureAggregateArgs>): Prisma.PrismaPromise<GetSignatureAggregateType<T>>

    /**
     * Group by Signature.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignatureGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SignatureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SignatureGroupByArgs['orderBy'] }
        : { orderBy?: SignatureGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SignatureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSignatureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Signature model
   */
  readonly fields: SignatureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Signature.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SignatureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Signature model
   */
  interface SignatureFieldRefs {
    readonly id: FieldRef<"Signature", 'String'>
    readonly userId: FieldRef<"Signature", 'String'>
    readonly name: FieldRef<"Signature", 'String'>
    readonly html: FieldRef<"Signature", 'String'>
    readonly title: FieldRef<"Signature", 'String'>
    readonly company: FieldRef<"Signature", 'String'>
    readonly phone: FieldRef<"Signature", 'String'>
    readonly defaultNew: FieldRef<"Signature", 'Boolean'>
    readonly defaultReplies: FieldRef<"Signature", 'Boolean'>
    readonly account: FieldRef<"Signature", 'String'>
    readonly isDefault: FieldRef<"Signature", 'Boolean'>
    readonly createdAt: FieldRef<"Signature", 'DateTime'>
    readonly updatedAt: FieldRef<"Signature", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Signature findUnique
   */
  export type SignatureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    /**
     * Filter, which Signature to fetch.
     */
    where: SignatureWhereUniqueInput
  }

  /**
   * Signature findUniqueOrThrow
   */
  export type SignatureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    /**
     * Filter, which Signature to fetch.
     */
    where: SignatureWhereUniqueInput
  }

  /**
   * Signature findFirst
   */
  export type SignatureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    /**
     * Filter, which Signature to fetch.
     */
    where?: SignatureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signatures to fetch.
     */
    orderBy?: SignatureOrderByWithRelationInput | SignatureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Signatures.
     */
    cursor?: SignatureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signatures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signatures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signatures.
     */
    distinct?: SignatureScalarFieldEnum | SignatureScalarFieldEnum[]
  }

  /**
   * Signature findFirstOrThrow
   */
  export type SignatureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    /**
     * Filter, which Signature to fetch.
     */
    where?: SignatureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signatures to fetch.
     */
    orderBy?: SignatureOrderByWithRelationInput | SignatureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Signatures.
     */
    cursor?: SignatureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signatures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signatures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signatures.
     */
    distinct?: SignatureScalarFieldEnum | SignatureScalarFieldEnum[]
  }

  /**
   * Signature findMany
   */
  export type SignatureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    /**
     * Filter, which Signatures to fetch.
     */
    where?: SignatureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signatures to fetch.
     */
    orderBy?: SignatureOrderByWithRelationInput | SignatureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Signatures.
     */
    cursor?: SignatureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signatures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signatures.
     */
    skip?: number
    distinct?: SignatureScalarFieldEnum | SignatureScalarFieldEnum[]
  }

  /**
   * Signature create
   */
  export type SignatureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    /**
     * The data needed to create a Signature.
     */
    data: XOR<SignatureCreateInput, SignatureUncheckedCreateInput>
  }

  /**
   * Signature createMany
   */
  export type SignatureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Signatures.
     */
    data: SignatureCreateManyInput | SignatureCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Signature createManyAndReturn
   */
  export type SignatureCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * The data used to create many Signatures.
     */
    data: SignatureCreateManyInput | SignatureCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Signature update
   */
  export type SignatureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    /**
     * The data needed to update a Signature.
     */
    data: XOR<SignatureUpdateInput, SignatureUncheckedUpdateInput>
    /**
     * Choose, which Signature to update.
     */
    where: SignatureWhereUniqueInput
  }

  /**
   * Signature updateMany
   */
  export type SignatureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Signatures.
     */
    data: XOR<SignatureUpdateManyMutationInput, SignatureUncheckedUpdateManyInput>
    /**
     * Filter which Signatures to update
     */
    where?: SignatureWhereInput
    /**
     * Limit how many Signatures to update.
     */
    limit?: number
  }

  /**
   * Signature updateManyAndReturn
   */
  export type SignatureUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * The data used to update Signatures.
     */
    data: XOR<SignatureUpdateManyMutationInput, SignatureUncheckedUpdateManyInput>
    /**
     * Filter which Signatures to update
     */
    where?: SignatureWhereInput
    /**
     * Limit how many Signatures to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Signature upsert
   */
  export type SignatureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    /**
     * The filter to search for the Signature to update in case it exists.
     */
    where: SignatureWhereUniqueInput
    /**
     * In case the Signature found by the `where` argument doesn't exist, create a new Signature with this data.
     */
    create: XOR<SignatureCreateInput, SignatureUncheckedCreateInput>
    /**
     * In case the Signature was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SignatureUpdateInput, SignatureUncheckedUpdateInput>
  }

  /**
   * Signature delete
   */
  export type SignatureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
    /**
     * Filter which Signature to delete.
     */
    where: SignatureWhereUniqueInput
  }

  /**
   * Signature deleteMany
   */
  export type SignatureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Signatures to delete
     */
    where?: SignatureWhereInput
    /**
     * Limit how many Signatures to delete.
     */
    limit?: number
  }

  /**
   * Signature without action
   */
  export type SignatureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signature
     */
    select?: SignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signature
     */
    omit?: SignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignatureInclude<ExtArgs> | null
  }


  /**
   * Model CachedFolder
   */

  export type AggregateCachedFolder = {
    _count: CachedFolderCountAggregateOutputType | null
    _avg: CachedFolderAvgAggregateOutputType | null
    _sum: CachedFolderSumAggregateOutputType | null
    _min: CachedFolderMinAggregateOutputType | null
    _max: CachedFolderMaxAggregateOutputType | null
  }

  export type CachedFolderAvgAggregateOutputType = {
    unreadCount: number | null
    totalCount: number | null
  }

  export type CachedFolderSumAggregateOutputType = {
    unreadCount: number | null
    totalCount: number | null
  }

  export type CachedFolderMinAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    displayName: string | null
    parentFolderId: string | null
    unreadCount: number | null
    totalCount: number | null
    wellKnownName: string | null
    syncedAt: Date | null
  }

  export type CachedFolderMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    displayName: string | null
    parentFolderId: string | null
    unreadCount: number | null
    totalCount: number | null
    wellKnownName: string | null
    syncedAt: Date | null
  }

  export type CachedFolderCountAggregateOutputType = {
    id: number
    userId: number
    homeAccountId: number
    displayName: number
    parentFolderId: number
    unreadCount: number
    totalCount: number
    wellKnownName: number
    syncedAt: number
    _all: number
  }


  export type CachedFolderAvgAggregateInputType = {
    unreadCount?: true
    totalCount?: true
  }

  export type CachedFolderSumAggregateInputType = {
    unreadCount?: true
    totalCount?: true
  }

  export type CachedFolderMinAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    displayName?: true
    parentFolderId?: true
    unreadCount?: true
    totalCount?: true
    wellKnownName?: true
    syncedAt?: true
  }

  export type CachedFolderMaxAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    displayName?: true
    parentFolderId?: true
    unreadCount?: true
    totalCount?: true
    wellKnownName?: true
    syncedAt?: true
  }

  export type CachedFolderCountAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    displayName?: true
    parentFolderId?: true
    unreadCount?: true
    totalCount?: true
    wellKnownName?: true
    syncedAt?: true
    _all?: true
  }

  export type CachedFolderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedFolder to aggregate.
     */
    where?: CachedFolderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedFolders to fetch.
     */
    orderBy?: CachedFolderOrderByWithRelationInput | CachedFolderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CachedFolderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedFolders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedFolders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CachedFolders
    **/
    _count?: true | CachedFolderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CachedFolderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CachedFolderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CachedFolderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CachedFolderMaxAggregateInputType
  }

  export type GetCachedFolderAggregateType<T extends CachedFolderAggregateArgs> = {
        [P in keyof T & keyof AggregateCachedFolder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCachedFolder[P]>
      : GetScalarType<T[P], AggregateCachedFolder[P]>
  }




  export type CachedFolderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedFolderWhereInput
    orderBy?: CachedFolderOrderByWithAggregationInput | CachedFolderOrderByWithAggregationInput[]
    by: CachedFolderScalarFieldEnum[] | CachedFolderScalarFieldEnum
    having?: CachedFolderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CachedFolderCountAggregateInputType | true
    _avg?: CachedFolderAvgAggregateInputType
    _sum?: CachedFolderSumAggregateInputType
    _min?: CachedFolderMinAggregateInputType
    _max?: CachedFolderMaxAggregateInputType
  }

  export type CachedFolderGroupByOutputType = {
    id: string
    userId: string
    homeAccountId: string
    displayName: string
    parentFolderId: string | null
    unreadCount: number
    totalCount: number
    wellKnownName: string | null
    syncedAt: Date
    _count: CachedFolderCountAggregateOutputType | null
    _avg: CachedFolderAvgAggregateOutputType | null
    _sum: CachedFolderSumAggregateOutputType | null
    _min: CachedFolderMinAggregateOutputType | null
    _max: CachedFolderMaxAggregateOutputType | null
  }

  type GetCachedFolderGroupByPayload<T extends CachedFolderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CachedFolderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CachedFolderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CachedFolderGroupByOutputType[P]>
            : GetScalarType<T[P], CachedFolderGroupByOutputType[P]>
        }
      >
    >


  export type CachedFolderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    displayName?: boolean
    parentFolderId?: boolean
    unreadCount?: boolean
    totalCount?: boolean
    wellKnownName?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedFolder"]>

  export type CachedFolderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    displayName?: boolean
    parentFolderId?: boolean
    unreadCount?: boolean
    totalCount?: boolean
    wellKnownName?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedFolder"]>

  export type CachedFolderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    displayName?: boolean
    parentFolderId?: boolean
    unreadCount?: boolean
    totalCount?: boolean
    wellKnownName?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedFolder"]>

  export type CachedFolderSelectScalar = {
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    displayName?: boolean
    parentFolderId?: boolean
    unreadCount?: boolean
    totalCount?: boolean
    wellKnownName?: boolean
    syncedAt?: boolean
  }

  export type CachedFolderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "homeAccountId" | "displayName" | "parentFolderId" | "unreadCount" | "totalCount" | "wellKnownName" | "syncedAt", ExtArgs["result"]["cachedFolder"]>
  export type CachedFolderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CachedFolderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CachedFolderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CachedFolderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CachedFolder"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      homeAccountId: string
      displayName: string
      parentFolderId: string | null
      unreadCount: number
      totalCount: number
      wellKnownName: string | null
      syncedAt: Date
    }, ExtArgs["result"]["cachedFolder"]>
    composites: {}
  }

  type CachedFolderGetPayload<S extends boolean | null | undefined | CachedFolderDefaultArgs> = $Result.GetResult<Prisma.$CachedFolderPayload, S>

  type CachedFolderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CachedFolderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CachedFolderCountAggregateInputType | true
    }

  export interface CachedFolderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CachedFolder'], meta: { name: 'CachedFolder' } }
    /**
     * Find zero or one CachedFolder that matches the filter.
     * @param {CachedFolderFindUniqueArgs} args - Arguments to find a CachedFolder
     * @example
     * // Get one CachedFolder
     * const cachedFolder = await prisma.cachedFolder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CachedFolderFindUniqueArgs>(args: SelectSubset<T, CachedFolderFindUniqueArgs<ExtArgs>>): Prisma__CachedFolderClient<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CachedFolder that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CachedFolderFindUniqueOrThrowArgs} args - Arguments to find a CachedFolder
     * @example
     * // Get one CachedFolder
     * const cachedFolder = await prisma.cachedFolder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CachedFolderFindUniqueOrThrowArgs>(args: SelectSubset<T, CachedFolderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CachedFolderClient<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedFolder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedFolderFindFirstArgs} args - Arguments to find a CachedFolder
     * @example
     * // Get one CachedFolder
     * const cachedFolder = await prisma.cachedFolder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CachedFolderFindFirstArgs>(args?: SelectSubset<T, CachedFolderFindFirstArgs<ExtArgs>>): Prisma__CachedFolderClient<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedFolder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedFolderFindFirstOrThrowArgs} args - Arguments to find a CachedFolder
     * @example
     * // Get one CachedFolder
     * const cachedFolder = await prisma.cachedFolder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CachedFolderFindFirstOrThrowArgs>(args?: SelectSubset<T, CachedFolderFindFirstOrThrowArgs<ExtArgs>>): Prisma__CachedFolderClient<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CachedFolders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedFolderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CachedFolders
     * const cachedFolders = await prisma.cachedFolder.findMany()
     * 
     * // Get first 10 CachedFolders
     * const cachedFolders = await prisma.cachedFolder.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cachedFolderWithIdOnly = await prisma.cachedFolder.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CachedFolderFindManyArgs>(args?: SelectSubset<T, CachedFolderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CachedFolder.
     * @param {CachedFolderCreateArgs} args - Arguments to create a CachedFolder.
     * @example
     * // Create one CachedFolder
     * const CachedFolder = await prisma.cachedFolder.create({
     *   data: {
     *     // ... data to create a CachedFolder
     *   }
     * })
     * 
     */
    create<T extends CachedFolderCreateArgs>(args: SelectSubset<T, CachedFolderCreateArgs<ExtArgs>>): Prisma__CachedFolderClient<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CachedFolders.
     * @param {CachedFolderCreateManyArgs} args - Arguments to create many CachedFolders.
     * @example
     * // Create many CachedFolders
     * const cachedFolder = await prisma.cachedFolder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CachedFolderCreateManyArgs>(args?: SelectSubset<T, CachedFolderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CachedFolders and returns the data saved in the database.
     * @param {CachedFolderCreateManyAndReturnArgs} args - Arguments to create many CachedFolders.
     * @example
     * // Create many CachedFolders
     * const cachedFolder = await prisma.cachedFolder.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CachedFolders and only return the `id`
     * const cachedFolderWithIdOnly = await prisma.cachedFolder.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CachedFolderCreateManyAndReturnArgs>(args?: SelectSubset<T, CachedFolderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CachedFolder.
     * @param {CachedFolderDeleteArgs} args - Arguments to delete one CachedFolder.
     * @example
     * // Delete one CachedFolder
     * const CachedFolder = await prisma.cachedFolder.delete({
     *   where: {
     *     // ... filter to delete one CachedFolder
     *   }
     * })
     * 
     */
    delete<T extends CachedFolderDeleteArgs>(args: SelectSubset<T, CachedFolderDeleteArgs<ExtArgs>>): Prisma__CachedFolderClient<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CachedFolder.
     * @param {CachedFolderUpdateArgs} args - Arguments to update one CachedFolder.
     * @example
     * // Update one CachedFolder
     * const cachedFolder = await prisma.cachedFolder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CachedFolderUpdateArgs>(args: SelectSubset<T, CachedFolderUpdateArgs<ExtArgs>>): Prisma__CachedFolderClient<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CachedFolders.
     * @param {CachedFolderDeleteManyArgs} args - Arguments to filter CachedFolders to delete.
     * @example
     * // Delete a few CachedFolders
     * const { count } = await prisma.cachedFolder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CachedFolderDeleteManyArgs>(args?: SelectSubset<T, CachedFolderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedFolders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedFolderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CachedFolders
     * const cachedFolder = await prisma.cachedFolder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CachedFolderUpdateManyArgs>(args: SelectSubset<T, CachedFolderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedFolders and returns the data updated in the database.
     * @param {CachedFolderUpdateManyAndReturnArgs} args - Arguments to update many CachedFolders.
     * @example
     * // Update many CachedFolders
     * const cachedFolder = await prisma.cachedFolder.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CachedFolders and only return the `id`
     * const cachedFolderWithIdOnly = await prisma.cachedFolder.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CachedFolderUpdateManyAndReturnArgs>(args: SelectSubset<T, CachedFolderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CachedFolder.
     * @param {CachedFolderUpsertArgs} args - Arguments to update or create a CachedFolder.
     * @example
     * // Update or create a CachedFolder
     * const cachedFolder = await prisma.cachedFolder.upsert({
     *   create: {
     *     // ... data to create a CachedFolder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CachedFolder we want to update
     *   }
     * })
     */
    upsert<T extends CachedFolderUpsertArgs>(args: SelectSubset<T, CachedFolderUpsertArgs<ExtArgs>>): Prisma__CachedFolderClient<$Result.GetResult<Prisma.$CachedFolderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CachedFolders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedFolderCountArgs} args - Arguments to filter CachedFolders to count.
     * @example
     * // Count the number of CachedFolders
     * const count = await prisma.cachedFolder.count({
     *   where: {
     *     // ... the filter for the CachedFolders we want to count
     *   }
     * })
    **/
    count<T extends CachedFolderCountArgs>(
      args?: Subset<T, CachedFolderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CachedFolderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CachedFolder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedFolderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CachedFolderAggregateArgs>(args: Subset<T, CachedFolderAggregateArgs>): Prisma.PrismaPromise<GetCachedFolderAggregateType<T>>

    /**
     * Group by CachedFolder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedFolderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CachedFolderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CachedFolderGroupByArgs['orderBy'] }
        : { orderBy?: CachedFolderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CachedFolderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCachedFolderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CachedFolder model
   */
  readonly fields: CachedFolderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CachedFolder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CachedFolderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CachedFolder model
   */
  interface CachedFolderFieldRefs {
    readonly id: FieldRef<"CachedFolder", 'String'>
    readonly userId: FieldRef<"CachedFolder", 'String'>
    readonly homeAccountId: FieldRef<"CachedFolder", 'String'>
    readonly displayName: FieldRef<"CachedFolder", 'String'>
    readonly parentFolderId: FieldRef<"CachedFolder", 'String'>
    readonly unreadCount: FieldRef<"CachedFolder", 'Int'>
    readonly totalCount: FieldRef<"CachedFolder", 'Int'>
    readonly wellKnownName: FieldRef<"CachedFolder", 'String'>
    readonly syncedAt: FieldRef<"CachedFolder", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CachedFolder findUnique
   */
  export type CachedFolderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    /**
     * Filter, which CachedFolder to fetch.
     */
    where: CachedFolderWhereUniqueInput
  }

  /**
   * CachedFolder findUniqueOrThrow
   */
  export type CachedFolderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    /**
     * Filter, which CachedFolder to fetch.
     */
    where: CachedFolderWhereUniqueInput
  }

  /**
   * CachedFolder findFirst
   */
  export type CachedFolderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    /**
     * Filter, which CachedFolder to fetch.
     */
    where?: CachedFolderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedFolders to fetch.
     */
    orderBy?: CachedFolderOrderByWithRelationInput | CachedFolderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedFolders.
     */
    cursor?: CachedFolderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedFolders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedFolders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedFolders.
     */
    distinct?: CachedFolderScalarFieldEnum | CachedFolderScalarFieldEnum[]
  }

  /**
   * CachedFolder findFirstOrThrow
   */
  export type CachedFolderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    /**
     * Filter, which CachedFolder to fetch.
     */
    where?: CachedFolderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedFolders to fetch.
     */
    orderBy?: CachedFolderOrderByWithRelationInput | CachedFolderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedFolders.
     */
    cursor?: CachedFolderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedFolders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedFolders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedFolders.
     */
    distinct?: CachedFolderScalarFieldEnum | CachedFolderScalarFieldEnum[]
  }

  /**
   * CachedFolder findMany
   */
  export type CachedFolderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    /**
     * Filter, which CachedFolders to fetch.
     */
    where?: CachedFolderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedFolders to fetch.
     */
    orderBy?: CachedFolderOrderByWithRelationInput | CachedFolderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CachedFolders.
     */
    cursor?: CachedFolderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedFolders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedFolders.
     */
    skip?: number
    distinct?: CachedFolderScalarFieldEnum | CachedFolderScalarFieldEnum[]
  }

  /**
   * CachedFolder create
   */
  export type CachedFolderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    /**
     * The data needed to create a CachedFolder.
     */
    data: XOR<CachedFolderCreateInput, CachedFolderUncheckedCreateInput>
  }

  /**
   * CachedFolder createMany
   */
  export type CachedFolderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CachedFolders.
     */
    data: CachedFolderCreateManyInput | CachedFolderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CachedFolder createManyAndReturn
   */
  export type CachedFolderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * The data used to create many CachedFolders.
     */
    data: CachedFolderCreateManyInput | CachedFolderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CachedFolder update
   */
  export type CachedFolderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    /**
     * The data needed to update a CachedFolder.
     */
    data: XOR<CachedFolderUpdateInput, CachedFolderUncheckedUpdateInput>
    /**
     * Choose, which CachedFolder to update.
     */
    where: CachedFolderWhereUniqueInput
  }

  /**
   * CachedFolder updateMany
   */
  export type CachedFolderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CachedFolders.
     */
    data: XOR<CachedFolderUpdateManyMutationInput, CachedFolderUncheckedUpdateManyInput>
    /**
     * Filter which CachedFolders to update
     */
    where?: CachedFolderWhereInput
    /**
     * Limit how many CachedFolders to update.
     */
    limit?: number
  }

  /**
   * CachedFolder updateManyAndReturn
   */
  export type CachedFolderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * The data used to update CachedFolders.
     */
    data: XOR<CachedFolderUpdateManyMutationInput, CachedFolderUncheckedUpdateManyInput>
    /**
     * Filter which CachedFolders to update
     */
    where?: CachedFolderWhereInput
    /**
     * Limit how many CachedFolders to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CachedFolder upsert
   */
  export type CachedFolderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    /**
     * The filter to search for the CachedFolder to update in case it exists.
     */
    where: CachedFolderWhereUniqueInput
    /**
     * In case the CachedFolder found by the `where` argument doesn't exist, create a new CachedFolder with this data.
     */
    create: XOR<CachedFolderCreateInput, CachedFolderUncheckedCreateInput>
    /**
     * In case the CachedFolder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CachedFolderUpdateInput, CachedFolderUncheckedUpdateInput>
  }

  /**
   * CachedFolder delete
   */
  export type CachedFolderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
    /**
     * Filter which CachedFolder to delete.
     */
    where: CachedFolderWhereUniqueInput
  }

  /**
   * CachedFolder deleteMany
   */
  export type CachedFolderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedFolders to delete
     */
    where?: CachedFolderWhereInput
    /**
     * Limit how many CachedFolders to delete.
     */
    limit?: number
  }

  /**
   * CachedFolder without action
   */
  export type CachedFolderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedFolder
     */
    select?: CachedFolderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedFolder
     */
    omit?: CachedFolderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedFolderInclude<ExtArgs> | null
  }


  /**
   * Model CachedEmail
   */

  export type AggregateCachedEmail = {
    _count: CachedEmailCountAggregateOutputType | null
    _min: CachedEmailMinAggregateOutputType | null
    _max: CachedEmailMaxAggregateOutputType | null
  }

  export type CachedEmailMinAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    folderId: string | null
    subject: string | null
    bodyPreview: string | null
    fromName: string | null
    fromAddress: string | null
    receivedDateTime: Date | null
    sentDateTime: Date | null
    isRead: boolean | null
    hasAttachments: boolean | null
    flagStatus: string | null
    syncedAt: Date | null
  }

  export type CachedEmailMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    folderId: string | null
    subject: string | null
    bodyPreview: string | null
    fromName: string | null
    fromAddress: string | null
    receivedDateTime: Date | null
    sentDateTime: Date | null
    isRead: boolean | null
    hasAttachments: boolean | null
    flagStatus: string | null
    syncedAt: Date | null
  }

  export type CachedEmailCountAggregateOutputType = {
    id: number
    userId: number
    homeAccountId: number
    folderId: number
    subject: number
    bodyPreview: number
    fromName: number
    fromAddress: number
    toRecipients: number
    receivedDateTime: number
    sentDateTime: number
    isRead: number
    hasAttachments: number
    flagStatus: number
    categories: number
    syncedAt: number
    _all: number
  }


  export type CachedEmailMinAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    folderId?: true
    subject?: true
    bodyPreview?: true
    fromName?: true
    fromAddress?: true
    receivedDateTime?: true
    sentDateTime?: true
    isRead?: true
    hasAttachments?: true
    flagStatus?: true
    syncedAt?: true
  }

  export type CachedEmailMaxAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    folderId?: true
    subject?: true
    bodyPreview?: true
    fromName?: true
    fromAddress?: true
    receivedDateTime?: true
    sentDateTime?: true
    isRead?: true
    hasAttachments?: true
    flagStatus?: true
    syncedAt?: true
  }

  export type CachedEmailCountAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    folderId?: true
    subject?: true
    bodyPreview?: true
    fromName?: true
    fromAddress?: true
    toRecipients?: true
    receivedDateTime?: true
    sentDateTime?: true
    isRead?: true
    hasAttachments?: true
    flagStatus?: true
    categories?: true
    syncedAt?: true
    _all?: true
  }

  export type CachedEmailAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedEmail to aggregate.
     */
    where?: CachedEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedEmails to fetch.
     */
    orderBy?: CachedEmailOrderByWithRelationInput | CachedEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CachedEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedEmails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CachedEmails
    **/
    _count?: true | CachedEmailCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CachedEmailMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CachedEmailMaxAggregateInputType
  }

  export type GetCachedEmailAggregateType<T extends CachedEmailAggregateArgs> = {
        [P in keyof T & keyof AggregateCachedEmail]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCachedEmail[P]>
      : GetScalarType<T[P], AggregateCachedEmail[P]>
  }




  export type CachedEmailGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedEmailWhereInput
    orderBy?: CachedEmailOrderByWithAggregationInput | CachedEmailOrderByWithAggregationInput[]
    by: CachedEmailScalarFieldEnum[] | CachedEmailScalarFieldEnum
    having?: CachedEmailScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CachedEmailCountAggregateInputType | true
    _min?: CachedEmailMinAggregateInputType
    _max?: CachedEmailMaxAggregateInputType
  }

  export type CachedEmailGroupByOutputType = {
    id: string
    userId: string
    homeAccountId: string
    folderId: string
    subject: string
    bodyPreview: string
    fromName: string
    fromAddress: string
    toRecipients: JsonValue
    receivedDateTime: Date
    sentDateTime: Date | null
    isRead: boolean
    hasAttachments: boolean
    flagStatus: string
    categories: JsonValue
    syncedAt: Date
    _count: CachedEmailCountAggregateOutputType | null
    _min: CachedEmailMinAggregateOutputType | null
    _max: CachedEmailMaxAggregateOutputType | null
  }

  type GetCachedEmailGroupByPayload<T extends CachedEmailGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CachedEmailGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CachedEmailGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CachedEmailGroupByOutputType[P]>
            : GetScalarType<T[P], CachedEmailGroupByOutputType[P]>
        }
      >
    >


  export type CachedEmailSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    folderId?: boolean
    subject?: boolean
    bodyPreview?: boolean
    fromName?: boolean
    fromAddress?: boolean
    toRecipients?: boolean
    receivedDateTime?: boolean
    sentDateTime?: boolean
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: boolean
    categories?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedEmail"]>

  export type CachedEmailSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    folderId?: boolean
    subject?: boolean
    bodyPreview?: boolean
    fromName?: boolean
    fromAddress?: boolean
    toRecipients?: boolean
    receivedDateTime?: boolean
    sentDateTime?: boolean
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: boolean
    categories?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedEmail"]>

  export type CachedEmailSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    folderId?: boolean
    subject?: boolean
    bodyPreview?: boolean
    fromName?: boolean
    fromAddress?: boolean
    toRecipients?: boolean
    receivedDateTime?: boolean
    sentDateTime?: boolean
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: boolean
    categories?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedEmail"]>

  export type CachedEmailSelectScalar = {
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    folderId?: boolean
    subject?: boolean
    bodyPreview?: boolean
    fromName?: boolean
    fromAddress?: boolean
    toRecipients?: boolean
    receivedDateTime?: boolean
    sentDateTime?: boolean
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: boolean
    categories?: boolean
    syncedAt?: boolean
  }

  export type CachedEmailOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "homeAccountId" | "folderId" | "subject" | "bodyPreview" | "fromName" | "fromAddress" | "toRecipients" | "receivedDateTime" | "sentDateTime" | "isRead" | "hasAttachments" | "flagStatus" | "categories" | "syncedAt", ExtArgs["result"]["cachedEmail"]>
  export type CachedEmailInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CachedEmailIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CachedEmailIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CachedEmailPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CachedEmail"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      homeAccountId: string
      folderId: string
      subject: string
      bodyPreview: string
      fromName: string
      fromAddress: string
      toRecipients: Prisma.JsonValue
      receivedDateTime: Date
      sentDateTime: Date | null
      isRead: boolean
      hasAttachments: boolean
      flagStatus: string
      categories: Prisma.JsonValue
      syncedAt: Date
    }, ExtArgs["result"]["cachedEmail"]>
    composites: {}
  }

  type CachedEmailGetPayload<S extends boolean | null | undefined | CachedEmailDefaultArgs> = $Result.GetResult<Prisma.$CachedEmailPayload, S>

  type CachedEmailCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CachedEmailFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CachedEmailCountAggregateInputType | true
    }

  export interface CachedEmailDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CachedEmail'], meta: { name: 'CachedEmail' } }
    /**
     * Find zero or one CachedEmail that matches the filter.
     * @param {CachedEmailFindUniqueArgs} args - Arguments to find a CachedEmail
     * @example
     * // Get one CachedEmail
     * const cachedEmail = await prisma.cachedEmail.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CachedEmailFindUniqueArgs>(args: SelectSubset<T, CachedEmailFindUniqueArgs<ExtArgs>>): Prisma__CachedEmailClient<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CachedEmail that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CachedEmailFindUniqueOrThrowArgs} args - Arguments to find a CachedEmail
     * @example
     * // Get one CachedEmail
     * const cachedEmail = await prisma.cachedEmail.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CachedEmailFindUniqueOrThrowArgs>(args: SelectSubset<T, CachedEmailFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CachedEmailClient<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedEmail that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedEmailFindFirstArgs} args - Arguments to find a CachedEmail
     * @example
     * // Get one CachedEmail
     * const cachedEmail = await prisma.cachedEmail.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CachedEmailFindFirstArgs>(args?: SelectSubset<T, CachedEmailFindFirstArgs<ExtArgs>>): Prisma__CachedEmailClient<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedEmail that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedEmailFindFirstOrThrowArgs} args - Arguments to find a CachedEmail
     * @example
     * // Get one CachedEmail
     * const cachedEmail = await prisma.cachedEmail.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CachedEmailFindFirstOrThrowArgs>(args?: SelectSubset<T, CachedEmailFindFirstOrThrowArgs<ExtArgs>>): Prisma__CachedEmailClient<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CachedEmails that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedEmailFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CachedEmails
     * const cachedEmails = await prisma.cachedEmail.findMany()
     * 
     * // Get first 10 CachedEmails
     * const cachedEmails = await prisma.cachedEmail.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cachedEmailWithIdOnly = await prisma.cachedEmail.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CachedEmailFindManyArgs>(args?: SelectSubset<T, CachedEmailFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CachedEmail.
     * @param {CachedEmailCreateArgs} args - Arguments to create a CachedEmail.
     * @example
     * // Create one CachedEmail
     * const CachedEmail = await prisma.cachedEmail.create({
     *   data: {
     *     // ... data to create a CachedEmail
     *   }
     * })
     * 
     */
    create<T extends CachedEmailCreateArgs>(args: SelectSubset<T, CachedEmailCreateArgs<ExtArgs>>): Prisma__CachedEmailClient<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CachedEmails.
     * @param {CachedEmailCreateManyArgs} args - Arguments to create many CachedEmails.
     * @example
     * // Create many CachedEmails
     * const cachedEmail = await prisma.cachedEmail.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CachedEmailCreateManyArgs>(args?: SelectSubset<T, CachedEmailCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CachedEmails and returns the data saved in the database.
     * @param {CachedEmailCreateManyAndReturnArgs} args - Arguments to create many CachedEmails.
     * @example
     * // Create many CachedEmails
     * const cachedEmail = await prisma.cachedEmail.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CachedEmails and only return the `id`
     * const cachedEmailWithIdOnly = await prisma.cachedEmail.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CachedEmailCreateManyAndReturnArgs>(args?: SelectSubset<T, CachedEmailCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CachedEmail.
     * @param {CachedEmailDeleteArgs} args - Arguments to delete one CachedEmail.
     * @example
     * // Delete one CachedEmail
     * const CachedEmail = await prisma.cachedEmail.delete({
     *   where: {
     *     // ... filter to delete one CachedEmail
     *   }
     * })
     * 
     */
    delete<T extends CachedEmailDeleteArgs>(args: SelectSubset<T, CachedEmailDeleteArgs<ExtArgs>>): Prisma__CachedEmailClient<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CachedEmail.
     * @param {CachedEmailUpdateArgs} args - Arguments to update one CachedEmail.
     * @example
     * // Update one CachedEmail
     * const cachedEmail = await prisma.cachedEmail.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CachedEmailUpdateArgs>(args: SelectSubset<T, CachedEmailUpdateArgs<ExtArgs>>): Prisma__CachedEmailClient<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CachedEmails.
     * @param {CachedEmailDeleteManyArgs} args - Arguments to filter CachedEmails to delete.
     * @example
     * // Delete a few CachedEmails
     * const { count } = await prisma.cachedEmail.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CachedEmailDeleteManyArgs>(args?: SelectSubset<T, CachedEmailDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedEmails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedEmailUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CachedEmails
     * const cachedEmail = await prisma.cachedEmail.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CachedEmailUpdateManyArgs>(args: SelectSubset<T, CachedEmailUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedEmails and returns the data updated in the database.
     * @param {CachedEmailUpdateManyAndReturnArgs} args - Arguments to update many CachedEmails.
     * @example
     * // Update many CachedEmails
     * const cachedEmail = await prisma.cachedEmail.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CachedEmails and only return the `id`
     * const cachedEmailWithIdOnly = await prisma.cachedEmail.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CachedEmailUpdateManyAndReturnArgs>(args: SelectSubset<T, CachedEmailUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CachedEmail.
     * @param {CachedEmailUpsertArgs} args - Arguments to update or create a CachedEmail.
     * @example
     * // Update or create a CachedEmail
     * const cachedEmail = await prisma.cachedEmail.upsert({
     *   create: {
     *     // ... data to create a CachedEmail
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CachedEmail we want to update
     *   }
     * })
     */
    upsert<T extends CachedEmailUpsertArgs>(args: SelectSubset<T, CachedEmailUpsertArgs<ExtArgs>>): Prisma__CachedEmailClient<$Result.GetResult<Prisma.$CachedEmailPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CachedEmails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedEmailCountArgs} args - Arguments to filter CachedEmails to count.
     * @example
     * // Count the number of CachedEmails
     * const count = await prisma.cachedEmail.count({
     *   where: {
     *     // ... the filter for the CachedEmails we want to count
     *   }
     * })
    **/
    count<T extends CachedEmailCountArgs>(
      args?: Subset<T, CachedEmailCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CachedEmailCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CachedEmail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedEmailAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CachedEmailAggregateArgs>(args: Subset<T, CachedEmailAggregateArgs>): Prisma.PrismaPromise<GetCachedEmailAggregateType<T>>

    /**
     * Group by CachedEmail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedEmailGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CachedEmailGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CachedEmailGroupByArgs['orderBy'] }
        : { orderBy?: CachedEmailGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CachedEmailGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCachedEmailGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CachedEmail model
   */
  readonly fields: CachedEmailFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CachedEmail.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CachedEmailClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CachedEmail model
   */
  interface CachedEmailFieldRefs {
    readonly id: FieldRef<"CachedEmail", 'String'>
    readonly userId: FieldRef<"CachedEmail", 'String'>
    readonly homeAccountId: FieldRef<"CachedEmail", 'String'>
    readonly folderId: FieldRef<"CachedEmail", 'String'>
    readonly subject: FieldRef<"CachedEmail", 'String'>
    readonly bodyPreview: FieldRef<"CachedEmail", 'String'>
    readonly fromName: FieldRef<"CachedEmail", 'String'>
    readonly fromAddress: FieldRef<"CachedEmail", 'String'>
    readonly toRecipients: FieldRef<"CachedEmail", 'Json'>
    readonly receivedDateTime: FieldRef<"CachedEmail", 'DateTime'>
    readonly sentDateTime: FieldRef<"CachedEmail", 'DateTime'>
    readonly isRead: FieldRef<"CachedEmail", 'Boolean'>
    readonly hasAttachments: FieldRef<"CachedEmail", 'Boolean'>
    readonly flagStatus: FieldRef<"CachedEmail", 'String'>
    readonly categories: FieldRef<"CachedEmail", 'Json'>
    readonly syncedAt: FieldRef<"CachedEmail", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CachedEmail findUnique
   */
  export type CachedEmailFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    /**
     * Filter, which CachedEmail to fetch.
     */
    where: CachedEmailWhereUniqueInput
  }

  /**
   * CachedEmail findUniqueOrThrow
   */
  export type CachedEmailFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    /**
     * Filter, which CachedEmail to fetch.
     */
    where: CachedEmailWhereUniqueInput
  }

  /**
   * CachedEmail findFirst
   */
  export type CachedEmailFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    /**
     * Filter, which CachedEmail to fetch.
     */
    where?: CachedEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedEmails to fetch.
     */
    orderBy?: CachedEmailOrderByWithRelationInput | CachedEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedEmails.
     */
    cursor?: CachedEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedEmails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedEmails.
     */
    distinct?: CachedEmailScalarFieldEnum | CachedEmailScalarFieldEnum[]
  }

  /**
   * CachedEmail findFirstOrThrow
   */
  export type CachedEmailFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    /**
     * Filter, which CachedEmail to fetch.
     */
    where?: CachedEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedEmails to fetch.
     */
    orderBy?: CachedEmailOrderByWithRelationInput | CachedEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedEmails.
     */
    cursor?: CachedEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedEmails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedEmails.
     */
    distinct?: CachedEmailScalarFieldEnum | CachedEmailScalarFieldEnum[]
  }

  /**
   * CachedEmail findMany
   */
  export type CachedEmailFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    /**
     * Filter, which CachedEmails to fetch.
     */
    where?: CachedEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedEmails to fetch.
     */
    orderBy?: CachedEmailOrderByWithRelationInput | CachedEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CachedEmails.
     */
    cursor?: CachedEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedEmails.
     */
    skip?: number
    distinct?: CachedEmailScalarFieldEnum | CachedEmailScalarFieldEnum[]
  }

  /**
   * CachedEmail create
   */
  export type CachedEmailCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    /**
     * The data needed to create a CachedEmail.
     */
    data: XOR<CachedEmailCreateInput, CachedEmailUncheckedCreateInput>
  }

  /**
   * CachedEmail createMany
   */
  export type CachedEmailCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CachedEmails.
     */
    data: CachedEmailCreateManyInput | CachedEmailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CachedEmail createManyAndReturn
   */
  export type CachedEmailCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * The data used to create many CachedEmails.
     */
    data: CachedEmailCreateManyInput | CachedEmailCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CachedEmail update
   */
  export type CachedEmailUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    /**
     * The data needed to update a CachedEmail.
     */
    data: XOR<CachedEmailUpdateInput, CachedEmailUncheckedUpdateInput>
    /**
     * Choose, which CachedEmail to update.
     */
    where: CachedEmailWhereUniqueInput
  }

  /**
   * CachedEmail updateMany
   */
  export type CachedEmailUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CachedEmails.
     */
    data: XOR<CachedEmailUpdateManyMutationInput, CachedEmailUncheckedUpdateManyInput>
    /**
     * Filter which CachedEmails to update
     */
    where?: CachedEmailWhereInput
    /**
     * Limit how many CachedEmails to update.
     */
    limit?: number
  }

  /**
   * CachedEmail updateManyAndReturn
   */
  export type CachedEmailUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * The data used to update CachedEmails.
     */
    data: XOR<CachedEmailUpdateManyMutationInput, CachedEmailUncheckedUpdateManyInput>
    /**
     * Filter which CachedEmails to update
     */
    where?: CachedEmailWhereInput
    /**
     * Limit how many CachedEmails to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CachedEmail upsert
   */
  export type CachedEmailUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    /**
     * The filter to search for the CachedEmail to update in case it exists.
     */
    where: CachedEmailWhereUniqueInput
    /**
     * In case the CachedEmail found by the `where` argument doesn't exist, create a new CachedEmail with this data.
     */
    create: XOR<CachedEmailCreateInput, CachedEmailUncheckedCreateInput>
    /**
     * In case the CachedEmail was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CachedEmailUpdateInput, CachedEmailUncheckedUpdateInput>
  }

  /**
   * CachedEmail delete
   */
  export type CachedEmailDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
    /**
     * Filter which CachedEmail to delete.
     */
    where: CachedEmailWhereUniqueInput
  }

  /**
   * CachedEmail deleteMany
   */
  export type CachedEmailDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedEmails to delete
     */
    where?: CachedEmailWhereInput
    /**
     * Limit how many CachedEmails to delete.
     */
    limit?: number
  }

  /**
   * CachedEmail without action
   */
  export type CachedEmailDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedEmail
     */
    select?: CachedEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedEmail
     */
    omit?: CachedEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedEmailInclude<ExtArgs> | null
  }


  /**
   * Model CachedCalendarEvent
   */

  export type AggregateCachedCalendarEvent = {
    _count: CachedCalendarEventCountAggregateOutputType | null
    _avg: CachedCalendarEventAvgAggregateOutputType | null
    _sum: CachedCalendarEventSumAggregateOutputType | null
    _min: CachedCalendarEventMinAggregateOutputType | null
    _max: CachedCalendarEventMaxAggregateOutputType | null
  }

  export type CachedCalendarEventAvgAggregateOutputType = {
    reminderMinutes: number | null
  }

  export type CachedCalendarEventSumAggregateOutputType = {
    reminderMinutes: number | null
  }

  export type CachedCalendarEventMinAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    subject: string | null
    bodyPreview: string | null
    startDateTime: Date | null
    endDateTime: Date | null
    isAllDay: boolean | null
    location: string | null
    organizerName: string | null
    organizerEmail: string | null
    responseStatus: string | null
    onlineMeetingUrl: string | null
    isRecurring: boolean | null
    reminderMinutes: number | null
    showAs: string | null
    recurrence: string | null
    syncedAt: Date | null
  }

  export type CachedCalendarEventMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    subject: string | null
    bodyPreview: string | null
    startDateTime: Date | null
    endDateTime: Date | null
    isAllDay: boolean | null
    location: string | null
    organizerName: string | null
    organizerEmail: string | null
    responseStatus: string | null
    onlineMeetingUrl: string | null
    isRecurring: boolean | null
    reminderMinutes: number | null
    showAs: string | null
    recurrence: string | null
    syncedAt: Date | null
  }

  export type CachedCalendarEventCountAggregateOutputType = {
    id: number
    userId: number
    homeAccountId: number
    subject: number
    bodyPreview: number
    startDateTime: number
    endDateTime: number
    isAllDay: number
    location: number
    organizerName: number
    organizerEmail: number
    responseStatus: number
    onlineMeetingUrl: number
    attendees: number
    isRecurring: number
    reminderMinutes: number
    showAs: number
    recurrence: number
    syncedAt: number
    _all: number
  }


  export type CachedCalendarEventAvgAggregateInputType = {
    reminderMinutes?: true
  }

  export type CachedCalendarEventSumAggregateInputType = {
    reminderMinutes?: true
  }

  export type CachedCalendarEventMinAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    subject?: true
    bodyPreview?: true
    startDateTime?: true
    endDateTime?: true
    isAllDay?: true
    location?: true
    organizerName?: true
    organizerEmail?: true
    responseStatus?: true
    onlineMeetingUrl?: true
    isRecurring?: true
    reminderMinutes?: true
    showAs?: true
    recurrence?: true
    syncedAt?: true
  }

  export type CachedCalendarEventMaxAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    subject?: true
    bodyPreview?: true
    startDateTime?: true
    endDateTime?: true
    isAllDay?: true
    location?: true
    organizerName?: true
    organizerEmail?: true
    responseStatus?: true
    onlineMeetingUrl?: true
    isRecurring?: true
    reminderMinutes?: true
    showAs?: true
    recurrence?: true
    syncedAt?: true
  }

  export type CachedCalendarEventCountAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    subject?: true
    bodyPreview?: true
    startDateTime?: true
    endDateTime?: true
    isAllDay?: true
    location?: true
    organizerName?: true
    organizerEmail?: true
    responseStatus?: true
    onlineMeetingUrl?: true
    attendees?: true
    isRecurring?: true
    reminderMinutes?: true
    showAs?: true
    recurrence?: true
    syncedAt?: true
    _all?: true
  }

  export type CachedCalendarEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedCalendarEvent to aggregate.
     */
    where?: CachedCalendarEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedCalendarEvents to fetch.
     */
    orderBy?: CachedCalendarEventOrderByWithRelationInput | CachedCalendarEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CachedCalendarEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedCalendarEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedCalendarEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CachedCalendarEvents
    **/
    _count?: true | CachedCalendarEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CachedCalendarEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CachedCalendarEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CachedCalendarEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CachedCalendarEventMaxAggregateInputType
  }

  export type GetCachedCalendarEventAggregateType<T extends CachedCalendarEventAggregateArgs> = {
        [P in keyof T & keyof AggregateCachedCalendarEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCachedCalendarEvent[P]>
      : GetScalarType<T[P], AggregateCachedCalendarEvent[P]>
  }




  export type CachedCalendarEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedCalendarEventWhereInput
    orderBy?: CachedCalendarEventOrderByWithAggregationInput | CachedCalendarEventOrderByWithAggregationInput[]
    by: CachedCalendarEventScalarFieldEnum[] | CachedCalendarEventScalarFieldEnum
    having?: CachedCalendarEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CachedCalendarEventCountAggregateInputType | true
    _avg?: CachedCalendarEventAvgAggregateInputType
    _sum?: CachedCalendarEventSumAggregateInputType
    _min?: CachedCalendarEventMinAggregateInputType
    _max?: CachedCalendarEventMaxAggregateInputType
  }

  export type CachedCalendarEventGroupByOutputType = {
    id: string
    userId: string
    homeAccountId: string
    subject: string
    bodyPreview: string
    startDateTime: Date
    endDateTime: Date
    isAllDay: boolean
    location: string | null
    organizerName: string | null
    organizerEmail: string | null
    responseStatus: string
    onlineMeetingUrl: string | null
    attendees: JsonValue
    isRecurring: boolean
    reminderMinutes: number | null
    showAs: string
    recurrence: string | null
    syncedAt: Date
    _count: CachedCalendarEventCountAggregateOutputType | null
    _avg: CachedCalendarEventAvgAggregateOutputType | null
    _sum: CachedCalendarEventSumAggregateOutputType | null
    _min: CachedCalendarEventMinAggregateOutputType | null
    _max: CachedCalendarEventMaxAggregateOutputType | null
  }

  type GetCachedCalendarEventGroupByPayload<T extends CachedCalendarEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CachedCalendarEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CachedCalendarEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CachedCalendarEventGroupByOutputType[P]>
            : GetScalarType<T[P], CachedCalendarEventGroupByOutputType[P]>
        }
      >
    >


  export type CachedCalendarEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    subject?: boolean
    bodyPreview?: boolean
    startDateTime?: boolean
    endDateTime?: boolean
    isAllDay?: boolean
    location?: boolean
    organizerName?: boolean
    organizerEmail?: boolean
    responseStatus?: boolean
    onlineMeetingUrl?: boolean
    attendees?: boolean
    isRecurring?: boolean
    reminderMinutes?: boolean
    showAs?: boolean
    recurrence?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedCalendarEvent"]>

  export type CachedCalendarEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    subject?: boolean
    bodyPreview?: boolean
    startDateTime?: boolean
    endDateTime?: boolean
    isAllDay?: boolean
    location?: boolean
    organizerName?: boolean
    organizerEmail?: boolean
    responseStatus?: boolean
    onlineMeetingUrl?: boolean
    attendees?: boolean
    isRecurring?: boolean
    reminderMinutes?: boolean
    showAs?: boolean
    recurrence?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedCalendarEvent"]>

  export type CachedCalendarEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    subject?: boolean
    bodyPreview?: boolean
    startDateTime?: boolean
    endDateTime?: boolean
    isAllDay?: boolean
    location?: boolean
    organizerName?: boolean
    organizerEmail?: boolean
    responseStatus?: boolean
    onlineMeetingUrl?: boolean
    attendees?: boolean
    isRecurring?: boolean
    reminderMinutes?: boolean
    showAs?: boolean
    recurrence?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedCalendarEvent"]>

  export type CachedCalendarEventSelectScalar = {
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    subject?: boolean
    bodyPreview?: boolean
    startDateTime?: boolean
    endDateTime?: boolean
    isAllDay?: boolean
    location?: boolean
    organizerName?: boolean
    organizerEmail?: boolean
    responseStatus?: boolean
    onlineMeetingUrl?: boolean
    attendees?: boolean
    isRecurring?: boolean
    reminderMinutes?: boolean
    showAs?: boolean
    recurrence?: boolean
    syncedAt?: boolean
  }

  export type CachedCalendarEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "homeAccountId" | "subject" | "bodyPreview" | "startDateTime" | "endDateTime" | "isAllDay" | "location" | "organizerName" | "organizerEmail" | "responseStatus" | "onlineMeetingUrl" | "attendees" | "isRecurring" | "reminderMinutes" | "showAs" | "recurrence" | "syncedAt", ExtArgs["result"]["cachedCalendarEvent"]>
  export type CachedCalendarEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CachedCalendarEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CachedCalendarEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CachedCalendarEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CachedCalendarEvent"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      homeAccountId: string
      subject: string
      bodyPreview: string
      startDateTime: Date
      endDateTime: Date
      isAllDay: boolean
      location: string | null
      organizerName: string | null
      organizerEmail: string | null
      responseStatus: string
      onlineMeetingUrl: string | null
      attendees: Prisma.JsonValue
      isRecurring: boolean
      reminderMinutes: number | null
      showAs: string
      recurrence: string | null
      syncedAt: Date
    }, ExtArgs["result"]["cachedCalendarEvent"]>
    composites: {}
  }

  type CachedCalendarEventGetPayload<S extends boolean | null | undefined | CachedCalendarEventDefaultArgs> = $Result.GetResult<Prisma.$CachedCalendarEventPayload, S>

  type CachedCalendarEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CachedCalendarEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CachedCalendarEventCountAggregateInputType | true
    }

  export interface CachedCalendarEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CachedCalendarEvent'], meta: { name: 'CachedCalendarEvent' } }
    /**
     * Find zero or one CachedCalendarEvent that matches the filter.
     * @param {CachedCalendarEventFindUniqueArgs} args - Arguments to find a CachedCalendarEvent
     * @example
     * // Get one CachedCalendarEvent
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CachedCalendarEventFindUniqueArgs>(args: SelectSubset<T, CachedCalendarEventFindUniqueArgs<ExtArgs>>): Prisma__CachedCalendarEventClient<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CachedCalendarEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CachedCalendarEventFindUniqueOrThrowArgs} args - Arguments to find a CachedCalendarEvent
     * @example
     * // Get one CachedCalendarEvent
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CachedCalendarEventFindUniqueOrThrowArgs>(args: SelectSubset<T, CachedCalendarEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CachedCalendarEventClient<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedCalendarEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCalendarEventFindFirstArgs} args - Arguments to find a CachedCalendarEvent
     * @example
     * // Get one CachedCalendarEvent
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CachedCalendarEventFindFirstArgs>(args?: SelectSubset<T, CachedCalendarEventFindFirstArgs<ExtArgs>>): Prisma__CachedCalendarEventClient<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedCalendarEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCalendarEventFindFirstOrThrowArgs} args - Arguments to find a CachedCalendarEvent
     * @example
     * // Get one CachedCalendarEvent
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CachedCalendarEventFindFirstOrThrowArgs>(args?: SelectSubset<T, CachedCalendarEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__CachedCalendarEventClient<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CachedCalendarEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCalendarEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CachedCalendarEvents
     * const cachedCalendarEvents = await prisma.cachedCalendarEvent.findMany()
     * 
     * // Get first 10 CachedCalendarEvents
     * const cachedCalendarEvents = await prisma.cachedCalendarEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cachedCalendarEventWithIdOnly = await prisma.cachedCalendarEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CachedCalendarEventFindManyArgs>(args?: SelectSubset<T, CachedCalendarEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CachedCalendarEvent.
     * @param {CachedCalendarEventCreateArgs} args - Arguments to create a CachedCalendarEvent.
     * @example
     * // Create one CachedCalendarEvent
     * const CachedCalendarEvent = await prisma.cachedCalendarEvent.create({
     *   data: {
     *     // ... data to create a CachedCalendarEvent
     *   }
     * })
     * 
     */
    create<T extends CachedCalendarEventCreateArgs>(args: SelectSubset<T, CachedCalendarEventCreateArgs<ExtArgs>>): Prisma__CachedCalendarEventClient<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CachedCalendarEvents.
     * @param {CachedCalendarEventCreateManyArgs} args - Arguments to create many CachedCalendarEvents.
     * @example
     * // Create many CachedCalendarEvents
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CachedCalendarEventCreateManyArgs>(args?: SelectSubset<T, CachedCalendarEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CachedCalendarEvents and returns the data saved in the database.
     * @param {CachedCalendarEventCreateManyAndReturnArgs} args - Arguments to create many CachedCalendarEvents.
     * @example
     * // Create many CachedCalendarEvents
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CachedCalendarEvents and only return the `id`
     * const cachedCalendarEventWithIdOnly = await prisma.cachedCalendarEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CachedCalendarEventCreateManyAndReturnArgs>(args?: SelectSubset<T, CachedCalendarEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CachedCalendarEvent.
     * @param {CachedCalendarEventDeleteArgs} args - Arguments to delete one CachedCalendarEvent.
     * @example
     * // Delete one CachedCalendarEvent
     * const CachedCalendarEvent = await prisma.cachedCalendarEvent.delete({
     *   where: {
     *     // ... filter to delete one CachedCalendarEvent
     *   }
     * })
     * 
     */
    delete<T extends CachedCalendarEventDeleteArgs>(args: SelectSubset<T, CachedCalendarEventDeleteArgs<ExtArgs>>): Prisma__CachedCalendarEventClient<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CachedCalendarEvent.
     * @param {CachedCalendarEventUpdateArgs} args - Arguments to update one CachedCalendarEvent.
     * @example
     * // Update one CachedCalendarEvent
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CachedCalendarEventUpdateArgs>(args: SelectSubset<T, CachedCalendarEventUpdateArgs<ExtArgs>>): Prisma__CachedCalendarEventClient<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CachedCalendarEvents.
     * @param {CachedCalendarEventDeleteManyArgs} args - Arguments to filter CachedCalendarEvents to delete.
     * @example
     * // Delete a few CachedCalendarEvents
     * const { count } = await prisma.cachedCalendarEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CachedCalendarEventDeleteManyArgs>(args?: SelectSubset<T, CachedCalendarEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedCalendarEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCalendarEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CachedCalendarEvents
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CachedCalendarEventUpdateManyArgs>(args: SelectSubset<T, CachedCalendarEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedCalendarEvents and returns the data updated in the database.
     * @param {CachedCalendarEventUpdateManyAndReturnArgs} args - Arguments to update many CachedCalendarEvents.
     * @example
     * // Update many CachedCalendarEvents
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CachedCalendarEvents and only return the `id`
     * const cachedCalendarEventWithIdOnly = await prisma.cachedCalendarEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CachedCalendarEventUpdateManyAndReturnArgs>(args: SelectSubset<T, CachedCalendarEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CachedCalendarEvent.
     * @param {CachedCalendarEventUpsertArgs} args - Arguments to update or create a CachedCalendarEvent.
     * @example
     * // Update or create a CachedCalendarEvent
     * const cachedCalendarEvent = await prisma.cachedCalendarEvent.upsert({
     *   create: {
     *     // ... data to create a CachedCalendarEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CachedCalendarEvent we want to update
     *   }
     * })
     */
    upsert<T extends CachedCalendarEventUpsertArgs>(args: SelectSubset<T, CachedCalendarEventUpsertArgs<ExtArgs>>): Prisma__CachedCalendarEventClient<$Result.GetResult<Prisma.$CachedCalendarEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CachedCalendarEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCalendarEventCountArgs} args - Arguments to filter CachedCalendarEvents to count.
     * @example
     * // Count the number of CachedCalendarEvents
     * const count = await prisma.cachedCalendarEvent.count({
     *   where: {
     *     // ... the filter for the CachedCalendarEvents we want to count
     *   }
     * })
    **/
    count<T extends CachedCalendarEventCountArgs>(
      args?: Subset<T, CachedCalendarEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CachedCalendarEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CachedCalendarEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCalendarEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CachedCalendarEventAggregateArgs>(args: Subset<T, CachedCalendarEventAggregateArgs>): Prisma.PrismaPromise<GetCachedCalendarEventAggregateType<T>>

    /**
     * Group by CachedCalendarEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCalendarEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CachedCalendarEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CachedCalendarEventGroupByArgs['orderBy'] }
        : { orderBy?: CachedCalendarEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CachedCalendarEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCachedCalendarEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CachedCalendarEvent model
   */
  readonly fields: CachedCalendarEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CachedCalendarEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CachedCalendarEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CachedCalendarEvent model
   */
  interface CachedCalendarEventFieldRefs {
    readonly id: FieldRef<"CachedCalendarEvent", 'String'>
    readonly userId: FieldRef<"CachedCalendarEvent", 'String'>
    readonly homeAccountId: FieldRef<"CachedCalendarEvent", 'String'>
    readonly subject: FieldRef<"CachedCalendarEvent", 'String'>
    readonly bodyPreview: FieldRef<"CachedCalendarEvent", 'String'>
    readonly startDateTime: FieldRef<"CachedCalendarEvent", 'DateTime'>
    readonly endDateTime: FieldRef<"CachedCalendarEvent", 'DateTime'>
    readonly isAllDay: FieldRef<"CachedCalendarEvent", 'Boolean'>
    readonly location: FieldRef<"CachedCalendarEvent", 'String'>
    readonly organizerName: FieldRef<"CachedCalendarEvent", 'String'>
    readonly organizerEmail: FieldRef<"CachedCalendarEvent", 'String'>
    readonly responseStatus: FieldRef<"CachedCalendarEvent", 'String'>
    readonly onlineMeetingUrl: FieldRef<"CachedCalendarEvent", 'String'>
    readonly attendees: FieldRef<"CachedCalendarEvent", 'Json'>
    readonly isRecurring: FieldRef<"CachedCalendarEvent", 'Boolean'>
    readonly reminderMinutes: FieldRef<"CachedCalendarEvent", 'Int'>
    readonly showAs: FieldRef<"CachedCalendarEvent", 'String'>
    readonly recurrence: FieldRef<"CachedCalendarEvent", 'String'>
    readonly syncedAt: FieldRef<"CachedCalendarEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CachedCalendarEvent findUnique
   */
  export type CachedCalendarEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    /**
     * Filter, which CachedCalendarEvent to fetch.
     */
    where: CachedCalendarEventWhereUniqueInput
  }

  /**
   * CachedCalendarEvent findUniqueOrThrow
   */
  export type CachedCalendarEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    /**
     * Filter, which CachedCalendarEvent to fetch.
     */
    where: CachedCalendarEventWhereUniqueInput
  }

  /**
   * CachedCalendarEvent findFirst
   */
  export type CachedCalendarEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    /**
     * Filter, which CachedCalendarEvent to fetch.
     */
    where?: CachedCalendarEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedCalendarEvents to fetch.
     */
    orderBy?: CachedCalendarEventOrderByWithRelationInput | CachedCalendarEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedCalendarEvents.
     */
    cursor?: CachedCalendarEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedCalendarEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedCalendarEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedCalendarEvents.
     */
    distinct?: CachedCalendarEventScalarFieldEnum | CachedCalendarEventScalarFieldEnum[]
  }

  /**
   * CachedCalendarEvent findFirstOrThrow
   */
  export type CachedCalendarEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    /**
     * Filter, which CachedCalendarEvent to fetch.
     */
    where?: CachedCalendarEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedCalendarEvents to fetch.
     */
    orderBy?: CachedCalendarEventOrderByWithRelationInput | CachedCalendarEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedCalendarEvents.
     */
    cursor?: CachedCalendarEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedCalendarEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedCalendarEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedCalendarEvents.
     */
    distinct?: CachedCalendarEventScalarFieldEnum | CachedCalendarEventScalarFieldEnum[]
  }

  /**
   * CachedCalendarEvent findMany
   */
  export type CachedCalendarEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    /**
     * Filter, which CachedCalendarEvents to fetch.
     */
    where?: CachedCalendarEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedCalendarEvents to fetch.
     */
    orderBy?: CachedCalendarEventOrderByWithRelationInput | CachedCalendarEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CachedCalendarEvents.
     */
    cursor?: CachedCalendarEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedCalendarEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedCalendarEvents.
     */
    skip?: number
    distinct?: CachedCalendarEventScalarFieldEnum | CachedCalendarEventScalarFieldEnum[]
  }

  /**
   * CachedCalendarEvent create
   */
  export type CachedCalendarEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    /**
     * The data needed to create a CachedCalendarEvent.
     */
    data: XOR<CachedCalendarEventCreateInput, CachedCalendarEventUncheckedCreateInput>
  }

  /**
   * CachedCalendarEvent createMany
   */
  export type CachedCalendarEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CachedCalendarEvents.
     */
    data: CachedCalendarEventCreateManyInput | CachedCalendarEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CachedCalendarEvent createManyAndReturn
   */
  export type CachedCalendarEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * The data used to create many CachedCalendarEvents.
     */
    data: CachedCalendarEventCreateManyInput | CachedCalendarEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CachedCalendarEvent update
   */
  export type CachedCalendarEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    /**
     * The data needed to update a CachedCalendarEvent.
     */
    data: XOR<CachedCalendarEventUpdateInput, CachedCalendarEventUncheckedUpdateInput>
    /**
     * Choose, which CachedCalendarEvent to update.
     */
    where: CachedCalendarEventWhereUniqueInput
  }

  /**
   * CachedCalendarEvent updateMany
   */
  export type CachedCalendarEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CachedCalendarEvents.
     */
    data: XOR<CachedCalendarEventUpdateManyMutationInput, CachedCalendarEventUncheckedUpdateManyInput>
    /**
     * Filter which CachedCalendarEvents to update
     */
    where?: CachedCalendarEventWhereInput
    /**
     * Limit how many CachedCalendarEvents to update.
     */
    limit?: number
  }

  /**
   * CachedCalendarEvent updateManyAndReturn
   */
  export type CachedCalendarEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * The data used to update CachedCalendarEvents.
     */
    data: XOR<CachedCalendarEventUpdateManyMutationInput, CachedCalendarEventUncheckedUpdateManyInput>
    /**
     * Filter which CachedCalendarEvents to update
     */
    where?: CachedCalendarEventWhereInput
    /**
     * Limit how many CachedCalendarEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CachedCalendarEvent upsert
   */
  export type CachedCalendarEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    /**
     * The filter to search for the CachedCalendarEvent to update in case it exists.
     */
    where: CachedCalendarEventWhereUniqueInput
    /**
     * In case the CachedCalendarEvent found by the `where` argument doesn't exist, create a new CachedCalendarEvent with this data.
     */
    create: XOR<CachedCalendarEventCreateInput, CachedCalendarEventUncheckedCreateInput>
    /**
     * In case the CachedCalendarEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CachedCalendarEventUpdateInput, CachedCalendarEventUncheckedUpdateInput>
  }

  /**
   * CachedCalendarEvent delete
   */
  export type CachedCalendarEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
    /**
     * Filter which CachedCalendarEvent to delete.
     */
    where: CachedCalendarEventWhereUniqueInput
  }

  /**
   * CachedCalendarEvent deleteMany
   */
  export type CachedCalendarEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedCalendarEvents to delete
     */
    where?: CachedCalendarEventWhereInput
    /**
     * Limit how many CachedCalendarEvents to delete.
     */
    limit?: number
  }

  /**
   * CachedCalendarEvent without action
   */
  export type CachedCalendarEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCalendarEvent
     */
    select?: CachedCalendarEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCalendarEvent
     */
    omit?: CachedCalendarEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedCalendarEventInclude<ExtArgs> | null
  }


  /**
   * Model CachedContact
   */

  export type AggregateCachedContact = {
    _count: CachedContactCountAggregateOutputType | null
    _min: CachedContactMinAggregateOutputType | null
    _max: CachedContactMaxAggregateOutputType | null
  }

  export type CachedContactMinAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    displayName: string | null
    emailAddress: string | null
    phone: string | null
    jobTitle: string | null
    company: string | null
    syncedAt: Date | null
  }

  export type CachedContactMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    homeAccountId: string | null
    displayName: string | null
    emailAddress: string | null
    phone: string | null
    jobTitle: string | null
    company: string | null
    syncedAt: Date | null
  }

  export type CachedContactCountAggregateOutputType = {
    id: number
    userId: number
    homeAccountId: number
    displayName: number
    emailAddress: number
    phone: number
    jobTitle: number
    company: number
    syncedAt: number
    _all: number
  }


  export type CachedContactMinAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    displayName?: true
    emailAddress?: true
    phone?: true
    jobTitle?: true
    company?: true
    syncedAt?: true
  }

  export type CachedContactMaxAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    displayName?: true
    emailAddress?: true
    phone?: true
    jobTitle?: true
    company?: true
    syncedAt?: true
  }

  export type CachedContactCountAggregateInputType = {
    id?: true
    userId?: true
    homeAccountId?: true
    displayName?: true
    emailAddress?: true
    phone?: true
    jobTitle?: true
    company?: true
    syncedAt?: true
    _all?: true
  }

  export type CachedContactAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedContact to aggregate.
     */
    where?: CachedContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedContacts to fetch.
     */
    orderBy?: CachedContactOrderByWithRelationInput | CachedContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CachedContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedContacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedContacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CachedContacts
    **/
    _count?: true | CachedContactCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CachedContactMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CachedContactMaxAggregateInputType
  }

  export type GetCachedContactAggregateType<T extends CachedContactAggregateArgs> = {
        [P in keyof T & keyof AggregateCachedContact]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCachedContact[P]>
      : GetScalarType<T[P], AggregateCachedContact[P]>
  }




  export type CachedContactGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedContactWhereInput
    orderBy?: CachedContactOrderByWithAggregationInput | CachedContactOrderByWithAggregationInput[]
    by: CachedContactScalarFieldEnum[] | CachedContactScalarFieldEnum
    having?: CachedContactScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CachedContactCountAggregateInputType | true
    _min?: CachedContactMinAggregateInputType
    _max?: CachedContactMaxAggregateInputType
  }

  export type CachedContactGroupByOutputType = {
    id: string
    userId: string
    homeAccountId: string
    displayName: string
    emailAddress: string
    phone: string
    jobTitle: string
    company: string
    syncedAt: Date
    _count: CachedContactCountAggregateOutputType | null
    _min: CachedContactMinAggregateOutputType | null
    _max: CachedContactMaxAggregateOutputType | null
  }

  type GetCachedContactGroupByPayload<T extends CachedContactGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CachedContactGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CachedContactGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CachedContactGroupByOutputType[P]>
            : GetScalarType<T[P], CachedContactGroupByOutputType[P]>
        }
      >
    >


  export type CachedContactSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    displayName?: boolean
    emailAddress?: boolean
    phone?: boolean
    jobTitle?: boolean
    company?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedContact"]>

  export type CachedContactSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    displayName?: boolean
    emailAddress?: boolean
    phone?: boolean
    jobTitle?: boolean
    company?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedContact"]>

  export type CachedContactSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    displayName?: boolean
    emailAddress?: boolean
    phone?: boolean
    jobTitle?: boolean
    company?: boolean
    syncedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cachedContact"]>

  export type CachedContactSelectScalar = {
    id?: boolean
    userId?: boolean
    homeAccountId?: boolean
    displayName?: boolean
    emailAddress?: boolean
    phone?: boolean
    jobTitle?: boolean
    company?: boolean
    syncedAt?: boolean
  }

  export type CachedContactOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "homeAccountId" | "displayName" | "emailAddress" | "phone" | "jobTitle" | "company" | "syncedAt", ExtArgs["result"]["cachedContact"]>
  export type CachedContactInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CachedContactIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CachedContactIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CachedContactPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CachedContact"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      homeAccountId: string
      displayName: string
      emailAddress: string
      phone: string
      jobTitle: string
      company: string
      syncedAt: Date
    }, ExtArgs["result"]["cachedContact"]>
    composites: {}
  }

  type CachedContactGetPayload<S extends boolean | null | undefined | CachedContactDefaultArgs> = $Result.GetResult<Prisma.$CachedContactPayload, S>

  type CachedContactCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CachedContactFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CachedContactCountAggregateInputType | true
    }

  export interface CachedContactDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CachedContact'], meta: { name: 'CachedContact' } }
    /**
     * Find zero or one CachedContact that matches the filter.
     * @param {CachedContactFindUniqueArgs} args - Arguments to find a CachedContact
     * @example
     * // Get one CachedContact
     * const cachedContact = await prisma.cachedContact.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CachedContactFindUniqueArgs>(args: SelectSubset<T, CachedContactFindUniqueArgs<ExtArgs>>): Prisma__CachedContactClient<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CachedContact that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CachedContactFindUniqueOrThrowArgs} args - Arguments to find a CachedContact
     * @example
     * // Get one CachedContact
     * const cachedContact = await prisma.cachedContact.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CachedContactFindUniqueOrThrowArgs>(args: SelectSubset<T, CachedContactFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CachedContactClient<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedContact that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedContactFindFirstArgs} args - Arguments to find a CachedContact
     * @example
     * // Get one CachedContact
     * const cachedContact = await prisma.cachedContact.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CachedContactFindFirstArgs>(args?: SelectSubset<T, CachedContactFindFirstArgs<ExtArgs>>): Prisma__CachedContactClient<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedContact that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedContactFindFirstOrThrowArgs} args - Arguments to find a CachedContact
     * @example
     * // Get one CachedContact
     * const cachedContact = await prisma.cachedContact.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CachedContactFindFirstOrThrowArgs>(args?: SelectSubset<T, CachedContactFindFirstOrThrowArgs<ExtArgs>>): Prisma__CachedContactClient<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CachedContacts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedContactFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CachedContacts
     * const cachedContacts = await prisma.cachedContact.findMany()
     * 
     * // Get first 10 CachedContacts
     * const cachedContacts = await prisma.cachedContact.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cachedContactWithIdOnly = await prisma.cachedContact.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CachedContactFindManyArgs>(args?: SelectSubset<T, CachedContactFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CachedContact.
     * @param {CachedContactCreateArgs} args - Arguments to create a CachedContact.
     * @example
     * // Create one CachedContact
     * const CachedContact = await prisma.cachedContact.create({
     *   data: {
     *     // ... data to create a CachedContact
     *   }
     * })
     * 
     */
    create<T extends CachedContactCreateArgs>(args: SelectSubset<T, CachedContactCreateArgs<ExtArgs>>): Prisma__CachedContactClient<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CachedContacts.
     * @param {CachedContactCreateManyArgs} args - Arguments to create many CachedContacts.
     * @example
     * // Create many CachedContacts
     * const cachedContact = await prisma.cachedContact.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CachedContactCreateManyArgs>(args?: SelectSubset<T, CachedContactCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CachedContacts and returns the data saved in the database.
     * @param {CachedContactCreateManyAndReturnArgs} args - Arguments to create many CachedContacts.
     * @example
     * // Create many CachedContacts
     * const cachedContact = await prisma.cachedContact.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CachedContacts and only return the `id`
     * const cachedContactWithIdOnly = await prisma.cachedContact.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CachedContactCreateManyAndReturnArgs>(args?: SelectSubset<T, CachedContactCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CachedContact.
     * @param {CachedContactDeleteArgs} args - Arguments to delete one CachedContact.
     * @example
     * // Delete one CachedContact
     * const CachedContact = await prisma.cachedContact.delete({
     *   where: {
     *     // ... filter to delete one CachedContact
     *   }
     * })
     * 
     */
    delete<T extends CachedContactDeleteArgs>(args: SelectSubset<T, CachedContactDeleteArgs<ExtArgs>>): Prisma__CachedContactClient<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CachedContact.
     * @param {CachedContactUpdateArgs} args - Arguments to update one CachedContact.
     * @example
     * // Update one CachedContact
     * const cachedContact = await prisma.cachedContact.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CachedContactUpdateArgs>(args: SelectSubset<T, CachedContactUpdateArgs<ExtArgs>>): Prisma__CachedContactClient<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CachedContacts.
     * @param {CachedContactDeleteManyArgs} args - Arguments to filter CachedContacts to delete.
     * @example
     * // Delete a few CachedContacts
     * const { count } = await prisma.cachedContact.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CachedContactDeleteManyArgs>(args?: SelectSubset<T, CachedContactDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedContacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedContactUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CachedContacts
     * const cachedContact = await prisma.cachedContact.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CachedContactUpdateManyArgs>(args: SelectSubset<T, CachedContactUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedContacts and returns the data updated in the database.
     * @param {CachedContactUpdateManyAndReturnArgs} args - Arguments to update many CachedContacts.
     * @example
     * // Update many CachedContacts
     * const cachedContact = await prisma.cachedContact.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CachedContacts and only return the `id`
     * const cachedContactWithIdOnly = await prisma.cachedContact.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CachedContactUpdateManyAndReturnArgs>(args: SelectSubset<T, CachedContactUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CachedContact.
     * @param {CachedContactUpsertArgs} args - Arguments to update or create a CachedContact.
     * @example
     * // Update or create a CachedContact
     * const cachedContact = await prisma.cachedContact.upsert({
     *   create: {
     *     // ... data to create a CachedContact
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CachedContact we want to update
     *   }
     * })
     */
    upsert<T extends CachedContactUpsertArgs>(args: SelectSubset<T, CachedContactUpsertArgs<ExtArgs>>): Prisma__CachedContactClient<$Result.GetResult<Prisma.$CachedContactPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CachedContacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedContactCountArgs} args - Arguments to filter CachedContacts to count.
     * @example
     * // Count the number of CachedContacts
     * const count = await prisma.cachedContact.count({
     *   where: {
     *     // ... the filter for the CachedContacts we want to count
     *   }
     * })
    **/
    count<T extends CachedContactCountArgs>(
      args?: Subset<T, CachedContactCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CachedContactCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CachedContact.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedContactAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CachedContactAggregateArgs>(args: Subset<T, CachedContactAggregateArgs>): Prisma.PrismaPromise<GetCachedContactAggregateType<T>>

    /**
     * Group by CachedContact.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedContactGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CachedContactGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CachedContactGroupByArgs['orderBy'] }
        : { orderBy?: CachedContactGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CachedContactGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCachedContactGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CachedContact model
   */
  readonly fields: CachedContactFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CachedContact.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CachedContactClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CachedContact model
   */
  interface CachedContactFieldRefs {
    readonly id: FieldRef<"CachedContact", 'String'>
    readonly userId: FieldRef<"CachedContact", 'String'>
    readonly homeAccountId: FieldRef<"CachedContact", 'String'>
    readonly displayName: FieldRef<"CachedContact", 'String'>
    readonly emailAddress: FieldRef<"CachedContact", 'String'>
    readonly phone: FieldRef<"CachedContact", 'String'>
    readonly jobTitle: FieldRef<"CachedContact", 'String'>
    readonly company: FieldRef<"CachedContact", 'String'>
    readonly syncedAt: FieldRef<"CachedContact", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CachedContact findUnique
   */
  export type CachedContactFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    /**
     * Filter, which CachedContact to fetch.
     */
    where: CachedContactWhereUniqueInput
  }

  /**
   * CachedContact findUniqueOrThrow
   */
  export type CachedContactFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    /**
     * Filter, which CachedContact to fetch.
     */
    where: CachedContactWhereUniqueInput
  }

  /**
   * CachedContact findFirst
   */
  export type CachedContactFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    /**
     * Filter, which CachedContact to fetch.
     */
    where?: CachedContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedContacts to fetch.
     */
    orderBy?: CachedContactOrderByWithRelationInput | CachedContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedContacts.
     */
    cursor?: CachedContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedContacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedContacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedContacts.
     */
    distinct?: CachedContactScalarFieldEnum | CachedContactScalarFieldEnum[]
  }

  /**
   * CachedContact findFirstOrThrow
   */
  export type CachedContactFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    /**
     * Filter, which CachedContact to fetch.
     */
    where?: CachedContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedContacts to fetch.
     */
    orderBy?: CachedContactOrderByWithRelationInput | CachedContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedContacts.
     */
    cursor?: CachedContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedContacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedContacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedContacts.
     */
    distinct?: CachedContactScalarFieldEnum | CachedContactScalarFieldEnum[]
  }

  /**
   * CachedContact findMany
   */
  export type CachedContactFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    /**
     * Filter, which CachedContacts to fetch.
     */
    where?: CachedContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedContacts to fetch.
     */
    orderBy?: CachedContactOrderByWithRelationInput | CachedContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CachedContacts.
     */
    cursor?: CachedContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedContacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedContacts.
     */
    skip?: number
    distinct?: CachedContactScalarFieldEnum | CachedContactScalarFieldEnum[]
  }

  /**
   * CachedContact create
   */
  export type CachedContactCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    /**
     * The data needed to create a CachedContact.
     */
    data: XOR<CachedContactCreateInput, CachedContactUncheckedCreateInput>
  }

  /**
   * CachedContact createMany
   */
  export type CachedContactCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CachedContacts.
     */
    data: CachedContactCreateManyInput | CachedContactCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CachedContact createManyAndReturn
   */
  export type CachedContactCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * The data used to create many CachedContacts.
     */
    data: CachedContactCreateManyInput | CachedContactCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CachedContact update
   */
  export type CachedContactUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    /**
     * The data needed to update a CachedContact.
     */
    data: XOR<CachedContactUpdateInput, CachedContactUncheckedUpdateInput>
    /**
     * Choose, which CachedContact to update.
     */
    where: CachedContactWhereUniqueInput
  }

  /**
   * CachedContact updateMany
   */
  export type CachedContactUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CachedContacts.
     */
    data: XOR<CachedContactUpdateManyMutationInput, CachedContactUncheckedUpdateManyInput>
    /**
     * Filter which CachedContacts to update
     */
    where?: CachedContactWhereInput
    /**
     * Limit how many CachedContacts to update.
     */
    limit?: number
  }

  /**
   * CachedContact updateManyAndReturn
   */
  export type CachedContactUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * The data used to update CachedContacts.
     */
    data: XOR<CachedContactUpdateManyMutationInput, CachedContactUncheckedUpdateManyInput>
    /**
     * Filter which CachedContacts to update
     */
    where?: CachedContactWhereInput
    /**
     * Limit how many CachedContacts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CachedContact upsert
   */
  export type CachedContactUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    /**
     * The filter to search for the CachedContact to update in case it exists.
     */
    where: CachedContactWhereUniqueInput
    /**
     * In case the CachedContact found by the `where` argument doesn't exist, create a new CachedContact with this data.
     */
    create: XOR<CachedContactCreateInput, CachedContactUncheckedCreateInput>
    /**
     * In case the CachedContact was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CachedContactUpdateInput, CachedContactUncheckedUpdateInput>
  }

  /**
   * CachedContact delete
   */
  export type CachedContactDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
    /**
     * Filter which CachedContact to delete.
     */
    where: CachedContactWhereUniqueInput
  }

  /**
   * CachedContact deleteMany
   */
  export type CachedContactDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedContacts to delete
     */
    where?: CachedContactWhereInput
    /**
     * Limit how many CachedContacts to delete.
     */
    limit?: number
  }

  /**
   * CachedContact without action
   */
  export type CachedContactDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedContact
     */
    select?: CachedContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedContact
     */
    omit?: CachedContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CachedContactInclude<ExtArgs> | null
  }


  /**
   * Model DeployLog
   */

  export type AggregateDeployLog = {
    _count: DeployLogCountAggregateOutputType | null
    _min: DeployLogMinAggregateOutputType | null
    _max: DeployLogMaxAggregateOutputType | null
  }

  export type DeployLogMinAggregateOutputType = {
    id: string | null
    pusher: string | null
    createdAt: Date | null
    digestSentAt: Date | null
  }

  export type DeployLogMaxAggregateOutputType = {
    id: string | null
    pusher: string | null
    createdAt: Date | null
    digestSentAt: Date | null
  }

  export type DeployLogCountAggregateOutputType = {
    id: number
    pusher: number
    commits: number
    createdAt: number
    digestSentAt: number
    _all: number
  }


  export type DeployLogMinAggregateInputType = {
    id?: true
    pusher?: true
    createdAt?: true
    digestSentAt?: true
  }

  export type DeployLogMaxAggregateInputType = {
    id?: true
    pusher?: true
    createdAt?: true
    digestSentAt?: true
  }

  export type DeployLogCountAggregateInputType = {
    id?: true
    pusher?: true
    commits?: true
    createdAt?: true
    digestSentAt?: true
    _all?: true
  }

  export type DeployLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeployLog to aggregate.
     */
    where?: DeployLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeployLogs to fetch.
     */
    orderBy?: DeployLogOrderByWithRelationInput | DeployLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeployLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeployLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeployLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DeployLogs
    **/
    _count?: true | DeployLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeployLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeployLogMaxAggregateInputType
  }

  export type GetDeployLogAggregateType<T extends DeployLogAggregateArgs> = {
        [P in keyof T & keyof AggregateDeployLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeployLog[P]>
      : GetScalarType<T[P], AggregateDeployLog[P]>
  }




  export type DeployLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeployLogWhereInput
    orderBy?: DeployLogOrderByWithAggregationInput | DeployLogOrderByWithAggregationInput[]
    by: DeployLogScalarFieldEnum[] | DeployLogScalarFieldEnum
    having?: DeployLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeployLogCountAggregateInputType | true
    _min?: DeployLogMinAggregateInputType
    _max?: DeployLogMaxAggregateInputType
  }

  export type DeployLogGroupByOutputType = {
    id: string
    pusher: string
    commits: JsonValue
    createdAt: Date
    digestSentAt: Date | null
    _count: DeployLogCountAggregateOutputType | null
    _min: DeployLogMinAggregateOutputType | null
    _max: DeployLogMaxAggregateOutputType | null
  }

  type GetDeployLogGroupByPayload<T extends DeployLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeployLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeployLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeployLogGroupByOutputType[P]>
            : GetScalarType<T[P], DeployLogGroupByOutputType[P]>
        }
      >
    >


  export type DeployLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pusher?: boolean
    commits?: boolean
    createdAt?: boolean
    digestSentAt?: boolean
  }, ExtArgs["result"]["deployLog"]>

  export type DeployLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pusher?: boolean
    commits?: boolean
    createdAt?: boolean
    digestSentAt?: boolean
  }, ExtArgs["result"]["deployLog"]>

  export type DeployLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pusher?: boolean
    commits?: boolean
    createdAt?: boolean
    digestSentAt?: boolean
  }, ExtArgs["result"]["deployLog"]>

  export type DeployLogSelectScalar = {
    id?: boolean
    pusher?: boolean
    commits?: boolean
    createdAt?: boolean
    digestSentAt?: boolean
  }

  export type DeployLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "pusher" | "commits" | "createdAt" | "digestSentAt", ExtArgs["result"]["deployLog"]>

  export type $DeployLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DeployLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      pusher: string
      commits: Prisma.JsonValue
      createdAt: Date
      digestSentAt: Date | null
    }, ExtArgs["result"]["deployLog"]>
    composites: {}
  }

  type DeployLogGetPayload<S extends boolean | null | undefined | DeployLogDefaultArgs> = $Result.GetResult<Prisma.$DeployLogPayload, S>

  type DeployLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DeployLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DeployLogCountAggregateInputType | true
    }

  export interface DeployLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DeployLog'], meta: { name: 'DeployLog' } }
    /**
     * Find zero or one DeployLog that matches the filter.
     * @param {DeployLogFindUniqueArgs} args - Arguments to find a DeployLog
     * @example
     * // Get one DeployLog
     * const deployLog = await prisma.deployLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeployLogFindUniqueArgs>(args: SelectSubset<T, DeployLogFindUniqueArgs<ExtArgs>>): Prisma__DeployLogClient<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DeployLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DeployLogFindUniqueOrThrowArgs} args - Arguments to find a DeployLog
     * @example
     * // Get one DeployLog
     * const deployLog = await prisma.deployLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeployLogFindUniqueOrThrowArgs>(args: SelectSubset<T, DeployLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeployLogClient<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DeployLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeployLogFindFirstArgs} args - Arguments to find a DeployLog
     * @example
     * // Get one DeployLog
     * const deployLog = await prisma.deployLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeployLogFindFirstArgs>(args?: SelectSubset<T, DeployLogFindFirstArgs<ExtArgs>>): Prisma__DeployLogClient<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DeployLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeployLogFindFirstOrThrowArgs} args - Arguments to find a DeployLog
     * @example
     * // Get one DeployLog
     * const deployLog = await prisma.deployLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeployLogFindFirstOrThrowArgs>(args?: SelectSubset<T, DeployLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeployLogClient<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DeployLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeployLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DeployLogs
     * const deployLogs = await prisma.deployLog.findMany()
     * 
     * // Get first 10 DeployLogs
     * const deployLogs = await prisma.deployLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deployLogWithIdOnly = await prisma.deployLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeployLogFindManyArgs>(args?: SelectSubset<T, DeployLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DeployLog.
     * @param {DeployLogCreateArgs} args - Arguments to create a DeployLog.
     * @example
     * // Create one DeployLog
     * const DeployLog = await prisma.deployLog.create({
     *   data: {
     *     // ... data to create a DeployLog
     *   }
     * })
     * 
     */
    create<T extends DeployLogCreateArgs>(args: SelectSubset<T, DeployLogCreateArgs<ExtArgs>>): Prisma__DeployLogClient<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DeployLogs.
     * @param {DeployLogCreateManyArgs} args - Arguments to create many DeployLogs.
     * @example
     * // Create many DeployLogs
     * const deployLog = await prisma.deployLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeployLogCreateManyArgs>(args?: SelectSubset<T, DeployLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DeployLogs and returns the data saved in the database.
     * @param {DeployLogCreateManyAndReturnArgs} args - Arguments to create many DeployLogs.
     * @example
     * // Create many DeployLogs
     * const deployLog = await prisma.deployLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DeployLogs and only return the `id`
     * const deployLogWithIdOnly = await prisma.deployLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DeployLogCreateManyAndReturnArgs>(args?: SelectSubset<T, DeployLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DeployLog.
     * @param {DeployLogDeleteArgs} args - Arguments to delete one DeployLog.
     * @example
     * // Delete one DeployLog
     * const DeployLog = await prisma.deployLog.delete({
     *   where: {
     *     // ... filter to delete one DeployLog
     *   }
     * })
     * 
     */
    delete<T extends DeployLogDeleteArgs>(args: SelectSubset<T, DeployLogDeleteArgs<ExtArgs>>): Prisma__DeployLogClient<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DeployLog.
     * @param {DeployLogUpdateArgs} args - Arguments to update one DeployLog.
     * @example
     * // Update one DeployLog
     * const deployLog = await prisma.deployLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeployLogUpdateArgs>(args: SelectSubset<T, DeployLogUpdateArgs<ExtArgs>>): Prisma__DeployLogClient<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DeployLogs.
     * @param {DeployLogDeleteManyArgs} args - Arguments to filter DeployLogs to delete.
     * @example
     * // Delete a few DeployLogs
     * const { count } = await prisma.deployLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeployLogDeleteManyArgs>(args?: SelectSubset<T, DeployLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeployLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeployLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DeployLogs
     * const deployLog = await prisma.deployLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeployLogUpdateManyArgs>(args: SelectSubset<T, DeployLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeployLogs and returns the data updated in the database.
     * @param {DeployLogUpdateManyAndReturnArgs} args - Arguments to update many DeployLogs.
     * @example
     * // Update many DeployLogs
     * const deployLog = await prisma.deployLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DeployLogs and only return the `id`
     * const deployLogWithIdOnly = await prisma.deployLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DeployLogUpdateManyAndReturnArgs>(args: SelectSubset<T, DeployLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DeployLog.
     * @param {DeployLogUpsertArgs} args - Arguments to update or create a DeployLog.
     * @example
     * // Update or create a DeployLog
     * const deployLog = await prisma.deployLog.upsert({
     *   create: {
     *     // ... data to create a DeployLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DeployLog we want to update
     *   }
     * })
     */
    upsert<T extends DeployLogUpsertArgs>(args: SelectSubset<T, DeployLogUpsertArgs<ExtArgs>>): Prisma__DeployLogClient<$Result.GetResult<Prisma.$DeployLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DeployLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeployLogCountArgs} args - Arguments to filter DeployLogs to count.
     * @example
     * // Count the number of DeployLogs
     * const count = await prisma.deployLog.count({
     *   where: {
     *     // ... the filter for the DeployLogs we want to count
     *   }
     * })
    **/
    count<T extends DeployLogCountArgs>(
      args?: Subset<T, DeployLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeployLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DeployLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeployLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeployLogAggregateArgs>(args: Subset<T, DeployLogAggregateArgs>): Prisma.PrismaPromise<GetDeployLogAggregateType<T>>

    /**
     * Group by DeployLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeployLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeployLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeployLogGroupByArgs['orderBy'] }
        : { orderBy?: DeployLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeployLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeployLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DeployLog model
   */
  readonly fields: DeployLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DeployLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeployLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DeployLog model
   */
  interface DeployLogFieldRefs {
    readonly id: FieldRef<"DeployLog", 'String'>
    readonly pusher: FieldRef<"DeployLog", 'String'>
    readonly commits: FieldRef<"DeployLog", 'Json'>
    readonly createdAt: FieldRef<"DeployLog", 'DateTime'>
    readonly digestSentAt: FieldRef<"DeployLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DeployLog findUnique
   */
  export type DeployLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * Filter, which DeployLog to fetch.
     */
    where: DeployLogWhereUniqueInput
  }

  /**
   * DeployLog findUniqueOrThrow
   */
  export type DeployLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * Filter, which DeployLog to fetch.
     */
    where: DeployLogWhereUniqueInput
  }

  /**
   * DeployLog findFirst
   */
  export type DeployLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * Filter, which DeployLog to fetch.
     */
    where?: DeployLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeployLogs to fetch.
     */
    orderBy?: DeployLogOrderByWithRelationInput | DeployLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeployLogs.
     */
    cursor?: DeployLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeployLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeployLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeployLogs.
     */
    distinct?: DeployLogScalarFieldEnum | DeployLogScalarFieldEnum[]
  }

  /**
   * DeployLog findFirstOrThrow
   */
  export type DeployLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * Filter, which DeployLog to fetch.
     */
    where?: DeployLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeployLogs to fetch.
     */
    orderBy?: DeployLogOrderByWithRelationInput | DeployLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeployLogs.
     */
    cursor?: DeployLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeployLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeployLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeployLogs.
     */
    distinct?: DeployLogScalarFieldEnum | DeployLogScalarFieldEnum[]
  }

  /**
   * DeployLog findMany
   */
  export type DeployLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * Filter, which DeployLogs to fetch.
     */
    where?: DeployLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeployLogs to fetch.
     */
    orderBy?: DeployLogOrderByWithRelationInput | DeployLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DeployLogs.
     */
    cursor?: DeployLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeployLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeployLogs.
     */
    skip?: number
    distinct?: DeployLogScalarFieldEnum | DeployLogScalarFieldEnum[]
  }

  /**
   * DeployLog create
   */
  export type DeployLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * The data needed to create a DeployLog.
     */
    data: XOR<DeployLogCreateInput, DeployLogUncheckedCreateInput>
  }

  /**
   * DeployLog createMany
   */
  export type DeployLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DeployLogs.
     */
    data: DeployLogCreateManyInput | DeployLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DeployLog createManyAndReturn
   */
  export type DeployLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * The data used to create many DeployLogs.
     */
    data: DeployLogCreateManyInput | DeployLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DeployLog update
   */
  export type DeployLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * The data needed to update a DeployLog.
     */
    data: XOR<DeployLogUpdateInput, DeployLogUncheckedUpdateInput>
    /**
     * Choose, which DeployLog to update.
     */
    where: DeployLogWhereUniqueInput
  }

  /**
   * DeployLog updateMany
   */
  export type DeployLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DeployLogs.
     */
    data: XOR<DeployLogUpdateManyMutationInput, DeployLogUncheckedUpdateManyInput>
    /**
     * Filter which DeployLogs to update
     */
    where?: DeployLogWhereInput
    /**
     * Limit how many DeployLogs to update.
     */
    limit?: number
  }

  /**
   * DeployLog updateManyAndReturn
   */
  export type DeployLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * The data used to update DeployLogs.
     */
    data: XOR<DeployLogUpdateManyMutationInput, DeployLogUncheckedUpdateManyInput>
    /**
     * Filter which DeployLogs to update
     */
    where?: DeployLogWhereInput
    /**
     * Limit how many DeployLogs to update.
     */
    limit?: number
  }

  /**
   * DeployLog upsert
   */
  export type DeployLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * The filter to search for the DeployLog to update in case it exists.
     */
    where: DeployLogWhereUniqueInput
    /**
     * In case the DeployLog found by the `where` argument doesn't exist, create a new DeployLog with this data.
     */
    create: XOR<DeployLogCreateInput, DeployLogUncheckedCreateInput>
    /**
     * In case the DeployLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeployLogUpdateInput, DeployLogUncheckedUpdateInput>
  }

  /**
   * DeployLog delete
   */
  export type DeployLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
    /**
     * Filter which DeployLog to delete.
     */
    where: DeployLogWhereUniqueInput
  }

  /**
   * DeployLog deleteMany
   */
  export type DeployLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeployLogs to delete
     */
    where?: DeployLogWhereInput
    /**
     * Limit how many DeployLogs to delete.
     */
    limit?: number
  }

  /**
   * DeployLog without action
   */
  export type DeployLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeployLog
     */
    select?: DeployLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeployLog
     */
    omit?: DeployLogOmit<ExtArgs> | null
  }


  /**
   * Model EmailRule
   */

  export type AggregateEmailRule = {
    _count: EmailRuleCountAggregateOutputType | null
    _avg: EmailRuleAvgAggregateOutputType | null
    _sum: EmailRuleSumAggregateOutputType | null
    _min: EmailRuleMinAggregateOutputType | null
    _max: EmailRuleMaxAggregateOutputType | null
  }

  export type EmailRuleAvgAggregateOutputType = {
    priority: number | null
    emailCount: number | null
  }

  export type EmailRuleSumAggregateOutputType = {
    priority: number | null
    emailCount: number | null
  }

  export type EmailRuleMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    priority: number | null
    active: boolean | null
    emailCount: number | null
    stopProcessing: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EmailRuleMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    priority: number | null
    active: boolean | null
    emailCount: number | null
    stopProcessing: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EmailRuleCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    priority: number
    active: number
    conditions: number
    actions: number
    emailCount: number
    stopProcessing: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EmailRuleAvgAggregateInputType = {
    priority?: true
    emailCount?: true
  }

  export type EmailRuleSumAggregateInputType = {
    priority?: true
    emailCount?: true
  }

  export type EmailRuleMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    priority?: true
    active?: true
    emailCount?: true
    stopProcessing?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EmailRuleMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    priority?: true
    active?: true
    emailCount?: true
    stopProcessing?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EmailRuleCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    priority?: true
    active?: true
    conditions?: true
    actions?: true
    emailCount?: true
    stopProcessing?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EmailRuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailRule to aggregate.
     */
    where?: EmailRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailRules to fetch.
     */
    orderBy?: EmailRuleOrderByWithRelationInput | EmailRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmailRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmailRules
    **/
    _count?: true | EmailRuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmailRuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmailRuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmailRuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmailRuleMaxAggregateInputType
  }

  export type GetEmailRuleAggregateType<T extends EmailRuleAggregateArgs> = {
        [P in keyof T & keyof AggregateEmailRule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmailRule[P]>
      : GetScalarType<T[P], AggregateEmailRule[P]>
  }




  export type EmailRuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailRuleWhereInput
    orderBy?: EmailRuleOrderByWithAggregationInput | EmailRuleOrderByWithAggregationInput[]
    by: EmailRuleScalarFieldEnum[] | EmailRuleScalarFieldEnum
    having?: EmailRuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmailRuleCountAggregateInputType | true
    _avg?: EmailRuleAvgAggregateInputType
    _sum?: EmailRuleSumAggregateInputType
    _min?: EmailRuleMinAggregateInputType
    _max?: EmailRuleMaxAggregateInputType
  }

  export type EmailRuleGroupByOutputType = {
    id: string
    userId: string
    name: string
    priority: number
    active: boolean
    conditions: JsonValue
    actions: JsonValue
    emailCount: number
    stopProcessing: boolean
    createdAt: Date
    updatedAt: Date
    _count: EmailRuleCountAggregateOutputType | null
    _avg: EmailRuleAvgAggregateOutputType | null
    _sum: EmailRuleSumAggregateOutputType | null
    _min: EmailRuleMinAggregateOutputType | null
    _max: EmailRuleMaxAggregateOutputType | null
  }

  type GetEmailRuleGroupByPayload<T extends EmailRuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmailRuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmailRuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmailRuleGroupByOutputType[P]>
            : GetScalarType<T[P], EmailRuleGroupByOutputType[P]>
        }
      >
    >


  export type EmailRuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    priority?: boolean
    active?: boolean
    conditions?: boolean
    actions?: boolean
    emailCount?: boolean
    stopProcessing?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailRule"]>

  export type EmailRuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    priority?: boolean
    active?: boolean
    conditions?: boolean
    actions?: boolean
    emailCount?: boolean
    stopProcessing?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailRule"]>

  export type EmailRuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    priority?: boolean
    active?: boolean
    conditions?: boolean
    actions?: boolean
    emailCount?: boolean
    stopProcessing?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailRule"]>

  export type EmailRuleSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    priority?: boolean
    active?: boolean
    conditions?: boolean
    actions?: boolean
    emailCount?: boolean
    stopProcessing?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EmailRuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "priority" | "active" | "conditions" | "actions" | "emailCount" | "stopProcessing" | "createdAt" | "updatedAt", ExtArgs["result"]["emailRule"]>
  export type EmailRuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type EmailRuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type EmailRuleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $EmailRulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmailRule"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      priority: number
      active: boolean
      conditions: Prisma.JsonValue
      actions: Prisma.JsonValue
      emailCount: number
      stopProcessing: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["emailRule"]>
    composites: {}
  }

  type EmailRuleGetPayload<S extends boolean | null | undefined | EmailRuleDefaultArgs> = $Result.GetResult<Prisma.$EmailRulePayload, S>

  type EmailRuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmailRuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmailRuleCountAggregateInputType | true
    }

  export interface EmailRuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmailRule'], meta: { name: 'EmailRule' } }
    /**
     * Find zero or one EmailRule that matches the filter.
     * @param {EmailRuleFindUniqueArgs} args - Arguments to find a EmailRule
     * @example
     * // Get one EmailRule
     * const emailRule = await prisma.emailRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmailRuleFindUniqueArgs>(args: SelectSubset<T, EmailRuleFindUniqueArgs<ExtArgs>>): Prisma__EmailRuleClient<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EmailRule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmailRuleFindUniqueOrThrowArgs} args - Arguments to find a EmailRule
     * @example
     * // Get one EmailRule
     * const emailRule = await prisma.emailRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmailRuleFindUniqueOrThrowArgs>(args: SelectSubset<T, EmailRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmailRuleClient<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmailRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailRuleFindFirstArgs} args - Arguments to find a EmailRule
     * @example
     * // Get one EmailRule
     * const emailRule = await prisma.emailRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmailRuleFindFirstArgs>(args?: SelectSubset<T, EmailRuleFindFirstArgs<ExtArgs>>): Prisma__EmailRuleClient<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmailRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailRuleFindFirstOrThrowArgs} args - Arguments to find a EmailRule
     * @example
     * // Get one EmailRule
     * const emailRule = await prisma.emailRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmailRuleFindFirstOrThrowArgs>(args?: SelectSubset<T, EmailRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmailRuleClient<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EmailRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmailRules
     * const emailRules = await prisma.emailRule.findMany()
     * 
     * // Get first 10 EmailRules
     * const emailRules = await prisma.emailRule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const emailRuleWithIdOnly = await prisma.emailRule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmailRuleFindManyArgs>(args?: SelectSubset<T, EmailRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EmailRule.
     * @param {EmailRuleCreateArgs} args - Arguments to create a EmailRule.
     * @example
     * // Create one EmailRule
     * const EmailRule = await prisma.emailRule.create({
     *   data: {
     *     // ... data to create a EmailRule
     *   }
     * })
     * 
     */
    create<T extends EmailRuleCreateArgs>(args: SelectSubset<T, EmailRuleCreateArgs<ExtArgs>>): Prisma__EmailRuleClient<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EmailRules.
     * @param {EmailRuleCreateManyArgs} args - Arguments to create many EmailRules.
     * @example
     * // Create many EmailRules
     * const emailRule = await prisma.emailRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmailRuleCreateManyArgs>(args?: SelectSubset<T, EmailRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EmailRules and returns the data saved in the database.
     * @param {EmailRuleCreateManyAndReturnArgs} args - Arguments to create many EmailRules.
     * @example
     * // Create many EmailRules
     * const emailRule = await prisma.emailRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EmailRules and only return the `id`
     * const emailRuleWithIdOnly = await prisma.emailRule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmailRuleCreateManyAndReturnArgs>(args?: SelectSubset<T, EmailRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EmailRule.
     * @param {EmailRuleDeleteArgs} args - Arguments to delete one EmailRule.
     * @example
     * // Delete one EmailRule
     * const EmailRule = await prisma.emailRule.delete({
     *   where: {
     *     // ... filter to delete one EmailRule
     *   }
     * })
     * 
     */
    delete<T extends EmailRuleDeleteArgs>(args: SelectSubset<T, EmailRuleDeleteArgs<ExtArgs>>): Prisma__EmailRuleClient<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EmailRule.
     * @param {EmailRuleUpdateArgs} args - Arguments to update one EmailRule.
     * @example
     * // Update one EmailRule
     * const emailRule = await prisma.emailRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmailRuleUpdateArgs>(args: SelectSubset<T, EmailRuleUpdateArgs<ExtArgs>>): Prisma__EmailRuleClient<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EmailRules.
     * @param {EmailRuleDeleteManyArgs} args - Arguments to filter EmailRules to delete.
     * @example
     * // Delete a few EmailRules
     * const { count } = await prisma.emailRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmailRuleDeleteManyArgs>(args?: SelectSubset<T, EmailRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmailRules
     * const emailRule = await prisma.emailRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmailRuleUpdateManyArgs>(args: SelectSubset<T, EmailRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailRules and returns the data updated in the database.
     * @param {EmailRuleUpdateManyAndReturnArgs} args - Arguments to update many EmailRules.
     * @example
     * // Update many EmailRules
     * const emailRule = await prisma.emailRule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EmailRules and only return the `id`
     * const emailRuleWithIdOnly = await prisma.emailRule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EmailRuleUpdateManyAndReturnArgs>(args: SelectSubset<T, EmailRuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EmailRule.
     * @param {EmailRuleUpsertArgs} args - Arguments to update or create a EmailRule.
     * @example
     * // Update or create a EmailRule
     * const emailRule = await prisma.emailRule.upsert({
     *   create: {
     *     // ... data to create a EmailRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmailRule we want to update
     *   }
     * })
     */
    upsert<T extends EmailRuleUpsertArgs>(args: SelectSubset<T, EmailRuleUpsertArgs<ExtArgs>>): Prisma__EmailRuleClient<$Result.GetResult<Prisma.$EmailRulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EmailRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailRuleCountArgs} args - Arguments to filter EmailRules to count.
     * @example
     * // Count the number of EmailRules
     * const count = await prisma.emailRule.count({
     *   where: {
     *     // ... the filter for the EmailRules we want to count
     *   }
     * })
    **/
    count<T extends EmailRuleCountArgs>(
      args?: Subset<T, EmailRuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmailRuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmailRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmailRuleAggregateArgs>(args: Subset<T, EmailRuleAggregateArgs>): Prisma.PrismaPromise<GetEmailRuleAggregateType<T>>

    /**
     * Group by EmailRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailRuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmailRuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmailRuleGroupByArgs['orderBy'] }
        : { orderBy?: EmailRuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmailRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmailRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmailRule model
   */
  readonly fields: EmailRuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmailRule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmailRuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmailRule model
   */
  interface EmailRuleFieldRefs {
    readonly id: FieldRef<"EmailRule", 'String'>
    readonly userId: FieldRef<"EmailRule", 'String'>
    readonly name: FieldRef<"EmailRule", 'String'>
    readonly priority: FieldRef<"EmailRule", 'Int'>
    readonly active: FieldRef<"EmailRule", 'Boolean'>
    readonly conditions: FieldRef<"EmailRule", 'Json'>
    readonly actions: FieldRef<"EmailRule", 'Json'>
    readonly emailCount: FieldRef<"EmailRule", 'Int'>
    readonly stopProcessing: FieldRef<"EmailRule", 'Boolean'>
    readonly createdAt: FieldRef<"EmailRule", 'DateTime'>
    readonly updatedAt: FieldRef<"EmailRule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EmailRule findUnique
   */
  export type EmailRuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    /**
     * Filter, which EmailRule to fetch.
     */
    where: EmailRuleWhereUniqueInput
  }

  /**
   * EmailRule findUniqueOrThrow
   */
  export type EmailRuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    /**
     * Filter, which EmailRule to fetch.
     */
    where: EmailRuleWhereUniqueInput
  }

  /**
   * EmailRule findFirst
   */
  export type EmailRuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    /**
     * Filter, which EmailRule to fetch.
     */
    where?: EmailRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailRules to fetch.
     */
    orderBy?: EmailRuleOrderByWithRelationInput | EmailRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailRules.
     */
    cursor?: EmailRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailRules.
     */
    distinct?: EmailRuleScalarFieldEnum | EmailRuleScalarFieldEnum[]
  }

  /**
   * EmailRule findFirstOrThrow
   */
  export type EmailRuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    /**
     * Filter, which EmailRule to fetch.
     */
    where?: EmailRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailRules to fetch.
     */
    orderBy?: EmailRuleOrderByWithRelationInput | EmailRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailRules.
     */
    cursor?: EmailRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailRules.
     */
    distinct?: EmailRuleScalarFieldEnum | EmailRuleScalarFieldEnum[]
  }

  /**
   * EmailRule findMany
   */
  export type EmailRuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    /**
     * Filter, which EmailRules to fetch.
     */
    where?: EmailRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailRules to fetch.
     */
    orderBy?: EmailRuleOrderByWithRelationInput | EmailRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmailRules.
     */
    cursor?: EmailRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailRules.
     */
    skip?: number
    distinct?: EmailRuleScalarFieldEnum | EmailRuleScalarFieldEnum[]
  }

  /**
   * EmailRule create
   */
  export type EmailRuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    /**
     * The data needed to create a EmailRule.
     */
    data: XOR<EmailRuleCreateInput, EmailRuleUncheckedCreateInput>
  }

  /**
   * EmailRule createMany
   */
  export type EmailRuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmailRules.
     */
    data: EmailRuleCreateManyInput | EmailRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmailRule createManyAndReturn
   */
  export type EmailRuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * The data used to create many EmailRules.
     */
    data: EmailRuleCreateManyInput | EmailRuleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmailRule update
   */
  export type EmailRuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    /**
     * The data needed to update a EmailRule.
     */
    data: XOR<EmailRuleUpdateInput, EmailRuleUncheckedUpdateInput>
    /**
     * Choose, which EmailRule to update.
     */
    where: EmailRuleWhereUniqueInput
  }

  /**
   * EmailRule updateMany
   */
  export type EmailRuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmailRules.
     */
    data: XOR<EmailRuleUpdateManyMutationInput, EmailRuleUncheckedUpdateManyInput>
    /**
     * Filter which EmailRules to update
     */
    where?: EmailRuleWhereInput
    /**
     * Limit how many EmailRules to update.
     */
    limit?: number
  }

  /**
   * EmailRule updateManyAndReturn
   */
  export type EmailRuleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * The data used to update EmailRules.
     */
    data: XOR<EmailRuleUpdateManyMutationInput, EmailRuleUncheckedUpdateManyInput>
    /**
     * Filter which EmailRules to update
     */
    where?: EmailRuleWhereInput
    /**
     * Limit how many EmailRules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmailRule upsert
   */
  export type EmailRuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    /**
     * The filter to search for the EmailRule to update in case it exists.
     */
    where: EmailRuleWhereUniqueInput
    /**
     * In case the EmailRule found by the `where` argument doesn't exist, create a new EmailRule with this data.
     */
    create: XOR<EmailRuleCreateInput, EmailRuleUncheckedCreateInput>
    /**
     * In case the EmailRule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmailRuleUpdateInput, EmailRuleUncheckedUpdateInput>
  }

  /**
   * EmailRule delete
   */
  export type EmailRuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
    /**
     * Filter which EmailRule to delete.
     */
    where: EmailRuleWhereUniqueInput
  }

  /**
   * EmailRule deleteMany
   */
  export type EmailRuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailRules to delete
     */
    where?: EmailRuleWhereInput
    /**
     * Limit how many EmailRules to delete.
     */
    limit?: number
  }

  /**
   * EmailRule without action
   */
  export type EmailRuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailRule
     */
    select?: EmailRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailRule
     */
    omit?: EmailRuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailRuleInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const OrganizationScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrganizationScalarFieldEnum = (typeof OrganizationScalarFieldEnum)[keyof typeof OrganizationScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    avatarUrl: 'avatarUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    orgId: 'orgId'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const MsConnectedAccountScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    homeAccountId: 'homeAccountId',
    msEmail: 'msEmail',
    displayName: 'displayName',
    tenantId: 'tenantId',
    isDefault: 'isDefault',
    connectedAt: 'connectedAt',
    updatedAt: 'updatedAt'
  };

  export type MsConnectedAccountScalarFieldEnum = (typeof MsConnectedAccountScalarFieldEnum)[keyof typeof MsConnectedAccountScalarFieldEnum]


  export const MsalTokenCacheScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    cacheJson: 'cacheJson',
    updatedAt: 'updatedAt'
  };

  export type MsalTokenCacheScalarFieldEnum = (typeof MsalTokenCacheScalarFieldEnum)[keyof typeof MsalTokenCacheScalarFieldEnum]


  export const EmailDeltaLinkScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    homeAccountId: 'homeAccountId',
    folderId: 'folderId',
    deltaToken: 'deltaToken',
    updatedAt: 'updatedAt'
  };

  export type EmailDeltaLinkScalarFieldEnum = (typeof EmailDeltaLinkScalarFieldEnum)[keyof typeof EmailDeltaLinkScalarFieldEnum]


  export const WebhookSubscriptionScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    homeAccountId: 'homeAccountId',
    subscriptionId: 'subscriptionId',
    resource: 'resource',
    expiresAt: 'expiresAt',
    clientState: 'clientState',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WebhookSubscriptionScalarFieldEnum = (typeof WebhookSubscriptionScalarFieldEnum)[keyof typeof WebhookSubscriptionScalarFieldEnum]


  export const DraftScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    homeAccountId: 'homeAccountId',
    graphDraftId: 'graphDraftId',
    toRecipients: 'toRecipients',
    ccRecipients: 'ccRecipients',
    bccRecipients: 'bccRecipients',
    subject: 'subject',
    bodyHtml: 'bodyHtml',
    attachments: 'attachments',
    importance: 'importance',
    requestReadReceipt: 'requestReadReceipt',
    draftType: 'draftType',
    inReplyToMessageId: 'inReplyToMessageId',
    forwardedMessageId: 'forwardedMessageId',
    scheduledAt: 'scheduledAt',
    scheduledSent: 'scheduledSent',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DraftScalarFieldEnum = (typeof DraftScalarFieldEnum)[keyof typeof DraftScalarFieldEnum]


  export const SignatureScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    html: 'html',
    title: 'title',
    company: 'company',
    phone: 'phone',
    defaultNew: 'defaultNew',
    defaultReplies: 'defaultReplies',
    account: 'account',
    isDefault: 'isDefault',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SignatureScalarFieldEnum = (typeof SignatureScalarFieldEnum)[keyof typeof SignatureScalarFieldEnum]


  export const CachedFolderScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    homeAccountId: 'homeAccountId',
    displayName: 'displayName',
    parentFolderId: 'parentFolderId',
    unreadCount: 'unreadCount',
    totalCount: 'totalCount',
    wellKnownName: 'wellKnownName',
    syncedAt: 'syncedAt'
  };

  export type CachedFolderScalarFieldEnum = (typeof CachedFolderScalarFieldEnum)[keyof typeof CachedFolderScalarFieldEnum]


  export const CachedEmailScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    homeAccountId: 'homeAccountId',
    folderId: 'folderId',
    subject: 'subject',
    bodyPreview: 'bodyPreview',
    fromName: 'fromName',
    fromAddress: 'fromAddress',
    toRecipients: 'toRecipients',
    receivedDateTime: 'receivedDateTime',
    sentDateTime: 'sentDateTime',
    isRead: 'isRead',
    hasAttachments: 'hasAttachments',
    flagStatus: 'flagStatus',
    categories: 'categories',
    syncedAt: 'syncedAt'
  };

  export type CachedEmailScalarFieldEnum = (typeof CachedEmailScalarFieldEnum)[keyof typeof CachedEmailScalarFieldEnum]


  export const CachedCalendarEventScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    homeAccountId: 'homeAccountId',
    subject: 'subject',
    bodyPreview: 'bodyPreview',
    startDateTime: 'startDateTime',
    endDateTime: 'endDateTime',
    isAllDay: 'isAllDay',
    location: 'location',
    organizerName: 'organizerName',
    organizerEmail: 'organizerEmail',
    responseStatus: 'responseStatus',
    onlineMeetingUrl: 'onlineMeetingUrl',
    attendees: 'attendees',
    isRecurring: 'isRecurring',
    reminderMinutes: 'reminderMinutes',
    showAs: 'showAs',
    recurrence: 'recurrence',
    syncedAt: 'syncedAt'
  };

  export type CachedCalendarEventScalarFieldEnum = (typeof CachedCalendarEventScalarFieldEnum)[keyof typeof CachedCalendarEventScalarFieldEnum]


  export const CachedContactScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    homeAccountId: 'homeAccountId',
    displayName: 'displayName',
    emailAddress: 'emailAddress',
    phone: 'phone',
    jobTitle: 'jobTitle',
    company: 'company',
    syncedAt: 'syncedAt'
  };

  export type CachedContactScalarFieldEnum = (typeof CachedContactScalarFieldEnum)[keyof typeof CachedContactScalarFieldEnum]


  export const DeployLogScalarFieldEnum: {
    id: 'id',
    pusher: 'pusher',
    commits: 'commits',
    createdAt: 'createdAt',
    digestSentAt: 'digestSentAt'
  };

  export type DeployLogScalarFieldEnum = (typeof DeployLogScalarFieldEnum)[keyof typeof DeployLogScalarFieldEnum]


  export const EmailRuleScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    priority: 'priority',
    active: 'active',
    conditions: 'conditions',
    actions: 'actions',
    emailCount: 'emailCount',
    stopProcessing: 'stopProcessing',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type EmailRuleScalarFieldEnum = (typeof EmailRuleScalarFieldEnum)[keyof typeof EmailRuleScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type OrganizationWhereInput = {
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    id?: StringFilter<"Organization"> | string
    name?: StringFilter<"Organization"> | string
    slug?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    users?: UserListRelationFilter
  }

  export type OrganizationOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    users?: UserOrderByRelationAggregateInput
  }

  export type OrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    name?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    users?: UserListRelationFilter
  }, "id" | "slug">

  export type OrganizationOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrganizationCountOrderByAggregateInput
    _max?: OrganizationMaxOrderByAggregateInput
    _min?: OrganizationMinOrderByAggregateInput
  }

  export type OrganizationScalarWhereWithAggregatesInput = {
    AND?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    OR?: OrganizationScalarWhereWithAggregatesInput[]
    NOT?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Organization"> | string
    name?: StringWithAggregatesFilter<"Organization"> | string
    slug?: StringWithAggregatesFilter<"Organization"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    avatarUrl?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    orgId?: StringFilter<"User"> | string
    org?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    msAccounts?: MsConnectedAccountListRelationFilter
    msalCache?: XOR<MsalTokenCacheNullableScalarRelationFilter, MsalTokenCacheWhereInput> | null
    deltaLinks?: EmailDeltaLinkListRelationFilter
    webhookSubs?: WebhookSubscriptionListRelationFilter
    drafts?: DraftListRelationFilter
    emailRules?: EmailRuleListRelationFilter
    signatures?: SignatureListRelationFilter
    cachedFolders?: CachedFolderListRelationFilter
    cachedEmails?: CachedEmailListRelationFilter
    cachedCalEvents?: CachedCalendarEventListRelationFilter
    cachedContacts?: CachedContactListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orgId?: SortOrder
    org?: OrganizationOrderByWithRelationInput
    msAccounts?: MsConnectedAccountOrderByRelationAggregateInput
    msalCache?: MsalTokenCacheOrderByWithRelationInput
    deltaLinks?: EmailDeltaLinkOrderByRelationAggregateInput
    webhookSubs?: WebhookSubscriptionOrderByRelationAggregateInput
    drafts?: DraftOrderByRelationAggregateInput
    emailRules?: EmailRuleOrderByRelationAggregateInput
    signatures?: SignatureOrderByRelationAggregateInput
    cachedFolders?: CachedFolderOrderByRelationAggregateInput
    cachedEmails?: CachedEmailOrderByRelationAggregateInput
    cachedCalEvents?: CachedCalendarEventOrderByRelationAggregateInput
    cachedContacts?: CachedContactOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    avatarUrl?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    orgId?: StringFilter<"User"> | string
    org?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    msAccounts?: MsConnectedAccountListRelationFilter
    msalCache?: XOR<MsalTokenCacheNullableScalarRelationFilter, MsalTokenCacheWhereInput> | null
    deltaLinks?: EmailDeltaLinkListRelationFilter
    webhookSubs?: WebhookSubscriptionListRelationFilter
    drafts?: DraftListRelationFilter
    emailRules?: EmailRuleListRelationFilter
    signatures?: SignatureListRelationFilter
    cachedFolders?: CachedFolderListRelationFilter
    cachedEmails?: CachedEmailListRelationFilter
    cachedCalEvents?: CachedCalendarEventListRelationFilter
    cachedContacts?: CachedContactListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orgId?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    avatarUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    orgId?: StringWithAggregatesFilter<"User"> | string
  }

  export type MsConnectedAccountWhereInput = {
    AND?: MsConnectedAccountWhereInput | MsConnectedAccountWhereInput[]
    OR?: MsConnectedAccountWhereInput[]
    NOT?: MsConnectedAccountWhereInput | MsConnectedAccountWhereInput[]
    id?: StringFilter<"MsConnectedAccount"> | string
    userId?: StringFilter<"MsConnectedAccount"> | string
    homeAccountId?: StringFilter<"MsConnectedAccount"> | string
    msEmail?: StringFilter<"MsConnectedAccount"> | string
    displayName?: StringNullableFilter<"MsConnectedAccount"> | string | null
    tenantId?: StringNullableFilter<"MsConnectedAccount"> | string | null
    isDefault?: BoolFilter<"MsConnectedAccount"> | boolean
    connectedAt?: DateTimeFilter<"MsConnectedAccount"> | Date | string
    updatedAt?: DateTimeFilter<"MsConnectedAccount"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type MsConnectedAccountOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    msEmail?: SortOrder
    displayName?: SortOrderInput | SortOrder
    tenantId?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    connectedAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type MsConnectedAccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_homeAccountId?: MsConnectedAccountUserIdHomeAccountIdCompoundUniqueInput
    AND?: MsConnectedAccountWhereInput | MsConnectedAccountWhereInput[]
    OR?: MsConnectedAccountWhereInput[]
    NOT?: MsConnectedAccountWhereInput | MsConnectedAccountWhereInput[]
    userId?: StringFilter<"MsConnectedAccount"> | string
    homeAccountId?: StringFilter<"MsConnectedAccount"> | string
    msEmail?: StringFilter<"MsConnectedAccount"> | string
    displayName?: StringNullableFilter<"MsConnectedAccount"> | string | null
    tenantId?: StringNullableFilter<"MsConnectedAccount"> | string | null
    isDefault?: BoolFilter<"MsConnectedAccount"> | boolean
    connectedAt?: DateTimeFilter<"MsConnectedAccount"> | Date | string
    updatedAt?: DateTimeFilter<"MsConnectedAccount"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_homeAccountId">

  export type MsConnectedAccountOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    msEmail?: SortOrder
    displayName?: SortOrderInput | SortOrder
    tenantId?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    connectedAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MsConnectedAccountCountOrderByAggregateInput
    _max?: MsConnectedAccountMaxOrderByAggregateInput
    _min?: MsConnectedAccountMinOrderByAggregateInput
  }

  export type MsConnectedAccountScalarWhereWithAggregatesInput = {
    AND?: MsConnectedAccountScalarWhereWithAggregatesInput | MsConnectedAccountScalarWhereWithAggregatesInput[]
    OR?: MsConnectedAccountScalarWhereWithAggregatesInput[]
    NOT?: MsConnectedAccountScalarWhereWithAggregatesInput | MsConnectedAccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MsConnectedAccount"> | string
    userId?: StringWithAggregatesFilter<"MsConnectedAccount"> | string
    homeAccountId?: StringWithAggregatesFilter<"MsConnectedAccount"> | string
    msEmail?: StringWithAggregatesFilter<"MsConnectedAccount"> | string
    displayName?: StringNullableWithAggregatesFilter<"MsConnectedAccount"> | string | null
    tenantId?: StringNullableWithAggregatesFilter<"MsConnectedAccount"> | string | null
    isDefault?: BoolWithAggregatesFilter<"MsConnectedAccount"> | boolean
    connectedAt?: DateTimeWithAggregatesFilter<"MsConnectedAccount"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MsConnectedAccount"> | Date | string
  }

  export type MsalTokenCacheWhereInput = {
    AND?: MsalTokenCacheWhereInput | MsalTokenCacheWhereInput[]
    OR?: MsalTokenCacheWhereInput[]
    NOT?: MsalTokenCacheWhereInput | MsalTokenCacheWhereInput[]
    id?: StringFilter<"MsalTokenCache"> | string
    userId?: StringFilter<"MsalTokenCache"> | string
    cacheJson?: StringFilter<"MsalTokenCache"> | string
    updatedAt?: DateTimeFilter<"MsalTokenCache"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type MsalTokenCacheOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    cacheJson?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type MsalTokenCacheWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: MsalTokenCacheWhereInput | MsalTokenCacheWhereInput[]
    OR?: MsalTokenCacheWhereInput[]
    NOT?: MsalTokenCacheWhereInput | MsalTokenCacheWhereInput[]
    cacheJson?: StringFilter<"MsalTokenCache"> | string
    updatedAt?: DateTimeFilter<"MsalTokenCache"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type MsalTokenCacheOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    cacheJson?: SortOrder
    updatedAt?: SortOrder
    _count?: MsalTokenCacheCountOrderByAggregateInput
    _max?: MsalTokenCacheMaxOrderByAggregateInput
    _min?: MsalTokenCacheMinOrderByAggregateInput
  }

  export type MsalTokenCacheScalarWhereWithAggregatesInput = {
    AND?: MsalTokenCacheScalarWhereWithAggregatesInput | MsalTokenCacheScalarWhereWithAggregatesInput[]
    OR?: MsalTokenCacheScalarWhereWithAggregatesInput[]
    NOT?: MsalTokenCacheScalarWhereWithAggregatesInput | MsalTokenCacheScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MsalTokenCache"> | string
    userId?: StringWithAggregatesFilter<"MsalTokenCache"> | string
    cacheJson?: StringWithAggregatesFilter<"MsalTokenCache"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"MsalTokenCache"> | Date | string
  }

  export type EmailDeltaLinkWhereInput = {
    AND?: EmailDeltaLinkWhereInput | EmailDeltaLinkWhereInput[]
    OR?: EmailDeltaLinkWhereInput[]
    NOT?: EmailDeltaLinkWhereInput | EmailDeltaLinkWhereInput[]
    id?: StringFilter<"EmailDeltaLink"> | string
    userId?: StringFilter<"EmailDeltaLink"> | string
    homeAccountId?: StringFilter<"EmailDeltaLink"> | string
    folderId?: StringFilter<"EmailDeltaLink"> | string
    deltaToken?: StringFilter<"EmailDeltaLink"> | string
    updatedAt?: DateTimeFilter<"EmailDeltaLink"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type EmailDeltaLinkOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    deltaToken?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type EmailDeltaLinkWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_homeAccountId_folderId?: EmailDeltaLinkUserIdHomeAccountIdFolderIdCompoundUniqueInput
    AND?: EmailDeltaLinkWhereInput | EmailDeltaLinkWhereInput[]
    OR?: EmailDeltaLinkWhereInput[]
    NOT?: EmailDeltaLinkWhereInput | EmailDeltaLinkWhereInput[]
    userId?: StringFilter<"EmailDeltaLink"> | string
    homeAccountId?: StringFilter<"EmailDeltaLink"> | string
    folderId?: StringFilter<"EmailDeltaLink"> | string
    deltaToken?: StringFilter<"EmailDeltaLink"> | string
    updatedAt?: DateTimeFilter<"EmailDeltaLink"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_homeAccountId_folderId">

  export type EmailDeltaLinkOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    deltaToken?: SortOrder
    updatedAt?: SortOrder
    _count?: EmailDeltaLinkCountOrderByAggregateInput
    _max?: EmailDeltaLinkMaxOrderByAggregateInput
    _min?: EmailDeltaLinkMinOrderByAggregateInput
  }

  export type EmailDeltaLinkScalarWhereWithAggregatesInput = {
    AND?: EmailDeltaLinkScalarWhereWithAggregatesInput | EmailDeltaLinkScalarWhereWithAggregatesInput[]
    OR?: EmailDeltaLinkScalarWhereWithAggregatesInput[]
    NOT?: EmailDeltaLinkScalarWhereWithAggregatesInput | EmailDeltaLinkScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EmailDeltaLink"> | string
    userId?: StringWithAggregatesFilter<"EmailDeltaLink"> | string
    homeAccountId?: StringWithAggregatesFilter<"EmailDeltaLink"> | string
    folderId?: StringWithAggregatesFilter<"EmailDeltaLink"> | string
    deltaToken?: StringWithAggregatesFilter<"EmailDeltaLink"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"EmailDeltaLink"> | Date | string
  }

  export type WebhookSubscriptionWhereInput = {
    AND?: WebhookSubscriptionWhereInput | WebhookSubscriptionWhereInput[]
    OR?: WebhookSubscriptionWhereInput[]
    NOT?: WebhookSubscriptionWhereInput | WebhookSubscriptionWhereInput[]
    id?: StringFilter<"WebhookSubscription"> | string
    userId?: StringFilter<"WebhookSubscription"> | string
    homeAccountId?: StringFilter<"WebhookSubscription"> | string
    subscriptionId?: StringFilter<"WebhookSubscription"> | string
    resource?: StringFilter<"WebhookSubscription"> | string
    expiresAt?: DateTimeFilter<"WebhookSubscription"> | Date | string
    clientState?: StringFilter<"WebhookSubscription"> | string
    createdAt?: DateTimeFilter<"WebhookSubscription"> | Date | string
    updatedAt?: DateTimeFilter<"WebhookSubscription"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type WebhookSubscriptionOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subscriptionId?: SortOrder
    resource?: SortOrder
    expiresAt?: SortOrder
    clientState?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type WebhookSubscriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    subscriptionId?: string
    AND?: WebhookSubscriptionWhereInput | WebhookSubscriptionWhereInput[]
    OR?: WebhookSubscriptionWhereInput[]
    NOT?: WebhookSubscriptionWhereInput | WebhookSubscriptionWhereInput[]
    userId?: StringFilter<"WebhookSubscription"> | string
    homeAccountId?: StringFilter<"WebhookSubscription"> | string
    resource?: StringFilter<"WebhookSubscription"> | string
    expiresAt?: DateTimeFilter<"WebhookSubscription"> | Date | string
    clientState?: StringFilter<"WebhookSubscription"> | string
    createdAt?: DateTimeFilter<"WebhookSubscription"> | Date | string
    updatedAt?: DateTimeFilter<"WebhookSubscription"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "subscriptionId">

  export type WebhookSubscriptionOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subscriptionId?: SortOrder
    resource?: SortOrder
    expiresAt?: SortOrder
    clientState?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WebhookSubscriptionCountOrderByAggregateInput
    _max?: WebhookSubscriptionMaxOrderByAggregateInput
    _min?: WebhookSubscriptionMinOrderByAggregateInput
  }

  export type WebhookSubscriptionScalarWhereWithAggregatesInput = {
    AND?: WebhookSubscriptionScalarWhereWithAggregatesInput | WebhookSubscriptionScalarWhereWithAggregatesInput[]
    OR?: WebhookSubscriptionScalarWhereWithAggregatesInput[]
    NOT?: WebhookSubscriptionScalarWhereWithAggregatesInput | WebhookSubscriptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WebhookSubscription"> | string
    userId?: StringWithAggregatesFilter<"WebhookSubscription"> | string
    homeAccountId?: StringWithAggregatesFilter<"WebhookSubscription"> | string
    subscriptionId?: StringWithAggregatesFilter<"WebhookSubscription"> | string
    resource?: StringWithAggregatesFilter<"WebhookSubscription"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"WebhookSubscription"> | Date | string
    clientState?: StringWithAggregatesFilter<"WebhookSubscription"> | string
    createdAt?: DateTimeWithAggregatesFilter<"WebhookSubscription"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WebhookSubscription"> | Date | string
  }

  export type DraftWhereInput = {
    AND?: DraftWhereInput | DraftWhereInput[]
    OR?: DraftWhereInput[]
    NOT?: DraftWhereInput | DraftWhereInput[]
    id?: StringFilter<"Draft"> | string
    userId?: StringFilter<"Draft"> | string
    homeAccountId?: StringNullableFilter<"Draft"> | string | null
    graphDraftId?: StringNullableFilter<"Draft"> | string | null
    toRecipients?: JsonFilter<"Draft">
    ccRecipients?: JsonFilter<"Draft">
    bccRecipients?: JsonFilter<"Draft">
    subject?: StringNullableFilter<"Draft"> | string | null
    bodyHtml?: StringNullableFilter<"Draft"> | string | null
    attachments?: JsonFilter<"Draft">
    importance?: StringFilter<"Draft"> | string
    requestReadReceipt?: BoolFilter<"Draft"> | boolean
    draftType?: StringFilter<"Draft"> | string
    inReplyToMessageId?: StringNullableFilter<"Draft"> | string | null
    forwardedMessageId?: StringNullableFilter<"Draft"> | string | null
    scheduledAt?: DateTimeNullableFilter<"Draft"> | Date | string | null
    scheduledSent?: BoolFilter<"Draft"> | boolean
    createdAt?: DateTimeFilter<"Draft"> | Date | string
    updatedAt?: DateTimeFilter<"Draft"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type DraftOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrderInput | SortOrder
    graphDraftId?: SortOrderInput | SortOrder
    toRecipients?: SortOrder
    ccRecipients?: SortOrder
    bccRecipients?: SortOrder
    subject?: SortOrderInput | SortOrder
    bodyHtml?: SortOrderInput | SortOrder
    attachments?: SortOrder
    importance?: SortOrder
    requestReadReceipt?: SortOrder
    draftType?: SortOrder
    inReplyToMessageId?: SortOrderInput | SortOrder
    forwardedMessageId?: SortOrderInput | SortOrder
    scheduledAt?: SortOrderInput | SortOrder
    scheduledSent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type DraftWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DraftWhereInput | DraftWhereInput[]
    OR?: DraftWhereInput[]
    NOT?: DraftWhereInput | DraftWhereInput[]
    userId?: StringFilter<"Draft"> | string
    homeAccountId?: StringNullableFilter<"Draft"> | string | null
    graphDraftId?: StringNullableFilter<"Draft"> | string | null
    toRecipients?: JsonFilter<"Draft">
    ccRecipients?: JsonFilter<"Draft">
    bccRecipients?: JsonFilter<"Draft">
    subject?: StringNullableFilter<"Draft"> | string | null
    bodyHtml?: StringNullableFilter<"Draft"> | string | null
    attachments?: JsonFilter<"Draft">
    importance?: StringFilter<"Draft"> | string
    requestReadReceipt?: BoolFilter<"Draft"> | boolean
    draftType?: StringFilter<"Draft"> | string
    inReplyToMessageId?: StringNullableFilter<"Draft"> | string | null
    forwardedMessageId?: StringNullableFilter<"Draft"> | string | null
    scheduledAt?: DateTimeNullableFilter<"Draft"> | Date | string | null
    scheduledSent?: BoolFilter<"Draft"> | boolean
    createdAt?: DateTimeFilter<"Draft"> | Date | string
    updatedAt?: DateTimeFilter<"Draft"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type DraftOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrderInput | SortOrder
    graphDraftId?: SortOrderInput | SortOrder
    toRecipients?: SortOrder
    ccRecipients?: SortOrder
    bccRecipients?: SortOrder
    subject?: SortOrderInput | SortOrder
    bodyHtml?: SortOrderInput | SortOrder
    attachments?: SortOrder
    importance?: SortOrder
    requestReadReceipt?: SortOrder
    draftType?: SortOrder
    inReplyToMessageId?: SortOrderInput | SortOrder
    forwardedMessageId?: SortOrderInput | SortOrder
    scheduledAt?: SortOrderInput | SortOrder
    scheduledSent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DraftCountOrderByAggregateInput
    _max?: DraftMaxOrderByAggregateInput
    _min?: DraftMinOrderByAggregateInput
  }

  export type DraftScalarWhereWithAggregatesInput = {
    AND?: DraftScalarWhereWithAggregatesInput | DraftScalarWhereWithAggregatesInput[]
    OR?: DraftScalarWhereWithAggregatesInput[]
    NOT?: DraftScalarWhereWithAggregatesInput | DraftScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Draft"> | string
    userId?: StringWithAggregatesFilter<"Draft"> | string
    homeAccountId?: StringNullableWithAggregatesFilter<"Draft"> | string | null
    graphDraftId?: StringNullableWithAggregatesFilter<"Draft"> | string | null
    toRecipients?: JsonWithAggregatesFilter<"Draft">
    ccRecipients?: JsonWithAggregatesFilter<"Draft">
    bccRecipients?: JsonWithAggregatesFilter<"Draft">
    subject?: StringNullableWithAggregatesFilter<"Draft"> | string | null
    bodyHtml?: StringNullableWithAggregatesFilter<"Draft"> | string | null
    attachments?: JsonWithAggregatesFilter<"Draft">
    importance?: StringWithAggregatesFilter<"Draft"> | string
    requestReadReceipt?: BoolWithAggregatesFilter<"Draft"> | boolean
    draftType?: StringWithAggregatesFilter<"Draft"> | string
    inReplyToMessageId?: StringNullableWithAggregatesFilter<"Draft"> | string | null
    forwardedMessageId?: StringNullableWithAggregatesFilter<"Draft"> | string | null
    scheduledAt?: DateTimeNullableWithAggregatesFilter<"Draft"> | Date | string | null
    scheduledSent?: BoolWithAggregatesFilter<"Draft"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Draft"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Draft"> | Date | string
  }

  export type SignatureWhereInput = {
    AND?: SignatureWhereInput | SignatureWhereInput[]
    OR?: SignatureWhereInput[]
    NOT?: SignatureWhereInput | SignatureWhereInput[]
    id?: StringFilter<"Signature"> | string
    userId?: StringFilter<"Signature"> | string
    name?: StringFilter<"Signature"> | string
    html?: StringFilter<"Signature"> | string
    title?: StringNullableFilter<"Signature"> | string | null
    company?: StringNullableFilter<"Signature"> | string | null
    phone?: StringNullableFilter<"Signature"> | string | null
    defaultNew?: BoolFilter<"Signature"> | boolean
    defaultReplies?: BoolFilter<"Signature"> | boolean
    account?: StringFilter<"Signature"> | string
    isDefault?: BoolFilter<"Signature"> | boolean
    createdAt?: DateTimeFilter<"Signature"> | Date | string
    updatedAt?: DateTimeFilter<"Signature"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SignatureOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    html?: SortOrder
    title?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    defaultNew?: SortOrder
    defaultReplies?: SortOrder
    account?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SignatureWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SignatureWhereInput | SignatureWhereInput[]
    OR?: SignatureWhereInput[]
    NOT?: SignatureWhereInput | SignatureWhereInput[]
    userId?: StringFilter<"Signature"> | string
    name?: StringFilter<"Signature"> | string
    html?: StringFilter<"Signature"> | string
    title?: StringNullableFilter<"Signature"> | string | null
    company?: StringNullableFilter<"Signature"> | string | null
    phone?: StringNullableFilter<"Signature"> | string | null
    defaultNew?: BoolFilter<"Signature"> | boolean
    defaultReplies?: BoolFilter<"Signature"> | boolean
    account?: StringFilter<"Signature"> | string
    isDefault?: BoolFilter<"Signature"> | boolean
    createdAt?: DateTimeFilter<"Signature"> | Date | string
    updatedAt?: DateTimeFilter<"Signature"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type SignatureOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    html?: SortOrder
    title?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    defaultNew?: SortOrder
    defaultReplies?: SortOrder
    account?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SignatureCountOrderByAggregateInput
    _max?: SignatureMaxOrderByAggregateInput
    _min?: SignatureMinOrderByAggregateInput
  }

  export type SignatureScalarWhereWithAggregatesInput = {
    AND?: SignatureScalarWhereWithAggregatesInput | SignatureScalarWhereWithAggregatesInput[]
    OR?: SignatureScalarWhereWithAggregatesInput[]
    NOT?: SignatureScalarWhereWithAggregatesInput | SignatureScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Signature"> | string
    userId?: StringWithAggregatesFilter<"Signature"> | string
    name?: StringWithAggregatesFilter<"Signature"> | string
    html?: StringWithAggregatesFilter<"Signature"> | string
    title?: StringNullableWithAggregatesFilter<"Signature"> | string | null
    company?: StringNullableWithAggregatesFilter<"Signature"> | string | null
    phone?: StringNullableWithAggregatesFilter<"Signature"> | string | null
    defaultNew?: BoolWithAggregatesFilter<"Signature"> | boolean
    defaultReplies?: BoolWithAggregatesFilter<"Signature"> | boolean
    account?: StringWithAggregatesFilter<"Signature"> | string
    isDefault?: BoolWithAggregatesFilter<"Signature"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Signature"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Signature"> | Date | string
  }

  export type CachedFolderWhereInput = {
    AND?: CachedFolderWhereInput | CachedFolderWhereInput[]
    OR?: CachedFolderWhereInput[]
    NOT?: CachedFolderWhereInput | CachedFolderWhereInput[]
    id?: StringFilter<"CachedFolder"> | string
    userId?: StringFilter<"CachedFolder"> | string
    homeAccountId?: StringFilter<"CachedFolder"> | string
    displayName?: StringFilter<"CachedFolder"> | string
    parentFolderId?: StringNullableFilter<"CachedFolder"> | string | null
    unreadCount?: IntFilter<"CachedFolder"> | number
    totalCount?: IntFilter<"CachedFolder"> | number
    wellKnownName?: StringNullableFilter<"CachedFolder"> | string | null
    syncedAt?: DateTimeFilter<"CachedFolder"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type CachedFolderOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    parentFolderId?: SortOrderInput | SortOrder
    unreadCount?: SortOrder
    totalCount?: SortOrder
    wellKnownName?: SortOrderInput | SortOrder
    syncedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type CachedFolderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CachedFolderWhereInput | CachedFolderWhereInput[]
    OR?: CachedFolderWhereInput[]
    NOT?: CachedFolderWhereInput | CachedFolderWhereInput[]
    userId?: StringFilter<"CachedFolder"> | string
    homeAccountId?: StringFilter<"CachedFolder"> | string
    displayName?: StringFilter<"CachedFolder"> | string
    parentFolderId?: StringNullableFilter<"CachedFolder"> | string | null
    unreadCount?: IntFilter<"CachedFolder"> | number
    totalCount?: IntFilter<"CachedFolder"> | number
    wellKnownName?: StringNullableFilter<"CachedFolder"> | string | null
    syncedAt?: DateTimeFilter<"CachedFolder"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type CachedFolderOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    parentFolderId?: SortOrderInput | SortOrder
    unreadCount?: SortOrder
    totalCount?: SortOrder
    wellKnownName?: SortOrderInput | SortOrder
    syncedAt?: SortOrder
    _count?: CachedFolderCountOrderByAggregateInput
    _avg?: CachedFolderAvgOrderByAggregateInput
    _max?: CachedFolderMaxOrderByAggregateInput
    _min?: CachedFolderMinOrderByAggregateInput
    _sum?: CachedFolderSumOrderByAggregateInput
  }

  export type CachedFolderScalarWhereWithAggregatesInput = {
    AND?: CachedFolderScalarWhereWithAggregatesInput | CachedFolderScalarWhereWithAggregatesInput[]
    OR?: CachedFolderScalarWhereWithAggregatesInput[]
    NOT?: CachedFolderScalarWhereWithAggregatesInput | CachedFolderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CachedFolder"> | string
    userId?: StringWithAggregatesFilter<"CachedFolder"> | string
    homeAccountId?: StringWithAggregatesFilter<"CachedFolder"> | string
    displayName?: StringWithAggregatesFilter<"CachedFolder"> | string
    parentFolderId?: StringNullableWithAggregatesFilter<"CachedFolder"> | string | null
    unreadCount?: IntWithAggregatesFilter<"CachedFolder"> | number
    totalCount?: IntWithAggregatesFilter<"CachedFolder"> | number
    wellKnownName?: StringNullableWithAggregatesFilter<"CachedFolder"> | string | null
    syncedAt?: DateTimeWithAggregatesFilter<"CachedFolder"> | Date | string
  }

  export type CachedEmailWhereInput = {
    AND?: CachedEmailWhereInput | CachedEmailWhereInput[]
    OR?: CachedEmailWhereInput[]
    NOT?: CachedEmailWhereInput | CachedEmailWhereInput[]
    id?: StringFilter<"CachedEmail"> | string
    userId?: StringFilter<"CachedEmail"> | string
    homeAccountId?: StringFilter<"CachedEmail"> | string
    folderId?: StringFilter<"CachedEmail"> | string
    subject?: StringFilter<"CachedEmail"> | string
    bodyPreview?: StringFilter<"CachedEmail"> | string
    fromName?: StringFilter<"CachedEmail"> | string
    fromAddress?: StringFilter<"CachedEmail"> | string
    toRecipients?: JsonFilter<"CachedEmail">
    receivedDateTime?: DateTimeFilter<"CachedEmail"> | Date | string
    sentDateTime?: DateTimeNullableFilter<"CachedEmail"> | Date | string | null
    isRead?: BoolFilter<"CachedEmail"> | boolean
    hasAttachments?: BoolFilter<"CachedEmail"> | boolean
    flagStatus?: StringFilter<"CachedEmail"> | string
    categories?: JsonFilter<"CachedEmail">
    syncedAt?: DateTimeFilter<"CachedEmail"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type CachedEmailOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    fromName?: SortOrder
    fromAddress?: SortOrder
    toRecipients?: SortOrder
    receivedDateTime?: SortOrder
    sentDateTime?: SortOrderInput | SortOrder
    isRead?: SortOrder
    hasAttachments?: SortOrder
    flagStatus?: SortOrder
    categories?: SortOrder
    syncedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type CachedEmailWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CachedEmailWhereInput | CachedEmailWhereInput[]
    OR?: CachedEmailWhereInput[]
    NOT?: CachedEmailWhereInput | CachedEmailWhereInput[]
    userId?: StringFilter<"CachedEmail"> | string
    homeAccountId?: StringFilter<"CachedEmail"> | string
    folderId?: StringFilter<"CachedEmail"> | string
    subject?: StringFilter<"CachedEmail"> | string
    bodyPreview?: StringFilter<"CachedEmail"> | string
    fromName?: StringFilter<"CachedEmail"> | string
    fromAddress?: StringFilter<"CachedEmail"> | string
    toRecipients?: JsonFilter<"CachedEmail">
    receivedDateTime?: DateTimeFilter<"CachedEmail"> | Date | string
    sentDateTime?: DateTimeNullableFilter<"CachedEmail"> | Date | string | null
    isRead?: BoolFilter<"CachedEmail"> | boolean
    hasAttachments?: BoolFilter<"CachedEmail"> | boolean
    flagStatus?: StringFilter<"CachedEmail"> | string
    categories?: JsonFilter<"CachedEmail">
    syncedAt?: DateTimeFilter<"CachedEmail"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type CachedEmailOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    fromName?: SortOrder
    fromAddress?: SortOrder
    toRecipients?: SortOrder
    receivedDateTime?: SortOrder
    sentDateTime?: SortOrderInput | SortOrder
    isRead?: SortOrder
    hasAttachments?: SortOrder
    flagStatus?: SortOrder
    categories?: SortOrder
    syncedAt?: SortOrder
    _count?: CachedEmailCountOrderByAggregateInput
    _max?: CachedEmailMaxOrderByAggregateInput
    _min?: CachedEmailMinOrderByAggregateInput
  }

  export type CachedEmailScalarWhereWithAggregatesInput = {
    AND?: CachedEmailScalarWhereWithAggregatesInput | CachedEmailScalarWhereWithAggregatesInput[]
    OR?: CachedEmailScalarWhereWithAggregatesInput[]
    NOT?: CachedEmailScalarWhereWithAggregatesInput | CachedEmailScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CachedEmail"> | string
    userId?: StringWithAggregatesFilter<"CachedEmail"> | string
    homeAccountId?: StringWithAggregatesFilter<"CachedEmail"> | string
    folderId?: StringWithAggregatesFilter<"CachedEmail"> | string
    subject?: StringWithAggregatesFilter<"CachedEmail"> | string
    bodyPreview?: StringWithAggregatesFilter<"CachedEmail"> | string
    fromName?: StringWithAggregatesFilter<"CachedEmail"> | string
    fromAddress?: StringWithAggregatesFilter<"CachedEmail"> | string
    toRecipients?: JsonWithAggregatesFilter<"CachedEmail">
    receivedDateTime?: DateTimeWithAggregatesFilter<"CachedEmail"> | Date | string
    sentDateTime?: DateTimeNullableWithAggregatesFilter<"CachedEmail"> | Date | string | null
    isRead?: BoolWithAggregatesFilter<"CachedEmail"> | boolean
    hasAttachments?: BoolWithAggregatesFilter<"CachedEmail"> | boolean
    flagStatus?: StringWithAggregatesFilter<"CachedEmail"> | string
    categories?: JsonWithAggregatesFilter<"CachedEmail">
    syncedAt?: DateTimeWithAggregatesFilter<"CachedEmail"> | Date | string
  }

  export type CachedCalendarEventWhereInput = {
    AND?: CachedCalendarEventWhereInput | CachedCalendarEventWhereInput[]
    OR?: CachedCalendarEventWhereInput[]
    NOT?: CachedCalendarEventWhereInput | CachedCalendarEventWhereInput[]
    id?: StringFilter<"CachedCalendarEvent"> | string
    userId?: StringFilter<"CachedCalendarEvent"> | string
    homeAccountId?: StringFilter<"CachedCalendarEvent"> | string
    subject?: StringFilter<"CachedCalendarEvent"> | string
    bodyPreview?: StringFilter<"CachedCalendarEvent"> | string
    startDateTime?: DateTimeFilter<"CachedCalendarEvent"> | Date | string
    endDateTime?: DateTimeFilter<"CachedCalendarEvent"> | Date | string
    isAllDay?: BoolFilter<"CachedCalendarEvent"> | boolean
    location?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    organizerName?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    organizerEmail?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    responseStatus?: StringFilter<"CachedCalendarEvent"> | string
    onlineMeetingUrl?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    attendees?: JsonFilter<"CachedCalendarEvent">
    isRecurring?: BoolFilter<"CachedCalendarEvent"> | boolean
    reminderMinutes?: IntNullableFilter<"CachedCalendarEvent"> | number | null
    showAs?: StringFilter<"CachedCalendarEvent"> | string
    recurrence?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    syncedAt?: DateTimeFilter<"CachedCalendarEvent"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type CachedCalendarEventOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    startDateTime?: SortOrder
    endDateTime?: SortOrder
    isAllDay?: SortOrder
    location?: SortOrderInput | SortOrder
    organizerName?: SortOrderInput | SortOrder
    organizerEmail?: SortOrderInput | SortOrder
    responseStatus?: SortOrder
    onlineMeetingUrl?: SortOrderInput | SortOrder
    attendees?: SortOrder
    isRecurring?: SortOrder
    reminderMinutes?: SortOrderInput | SortOrder
    showAs?: SortOrder
    recurrence?: SortOrderInput | SortOrder
    syncedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type CachedCalendarEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CachedCalendarEventWhereInput | CachedCalendarEventWhereInput[]
    OR?: CachedCalendarEventWhereInput[]
    NOT?: CachedCalendarEventWhereInput | CachedCalendarEventWhereInput[]
    userId?: StringFilter<"CachedCalendarEvent"> | string
    homeAccountId?: StringFilter<"CachedCalendarEvent"> | string
    subject?: StringFilter<"CachedCalendarEvent"> | string
    bodyPreview?: StringFilter<"CachedCalendarEvent"> | string
    startDateTime?: DateTimeFilter<"CachedCalendarEvent"> | Date | string
    endDateTime?: DateTimeFilter<"CachedCalendarEvent"> | Date | string
    isAllDay?: BoolFilter<"CachedCalendarEvent"> | boolean
    location?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    organizerName?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    organizerEmail?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    responseStatus?: StringFilter<"CachedCalendarEvent"> | string
    onlineMeetingUrl?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    attendees?: JsonFilter<"CachedCalendarEvent">
    isRecurring?: BoolFilter<"CachedCalendarEvent"> | boolean
    reminderMinutes?: IntNullableFilter<"CachedCalendarEvent"> | number | null
    showAs?: StringFilter<"CachedCalendarEvent"> | string
    recurrence?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    syncedAt?: DateTimeFilter<"CachedCalendarEvent"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type CachedCalendarEventOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    startDateTime?: SortOrder
    endDateTime?: SortOrder
    isAllDay?: SortOrder
    location?: SortOrderInput | SortOrder
    organizerName?: SortOrderInput | SortOrder
    organizerEmail?: SortOrderInput | SortOrder
    responseStatus?: SortOrder
    onlineMeetingUrl?: SortOrderInput | SortOrder
    attendees?: SortOrder
    isRecurring?: SortOrder
    reminderMinutes?: SortOrderInput | SortOrder
    showAs?: SortOrder
    recurrence?: SortOrderInput | SortOrder
    syncedAt?: SortOrder
    _count?: CachedCalendarEventCountOrderByAggregateInput
    _avg?: CachedCalendarEventAvgOrderByAggregateInput
    _max?: CachedCalendarEventMaxOrderByAggregateInput
    _min?: CachedCalendarEventMinOrderByAggregateInput
    _sum?: CachedCalendarEventSumOrderByAggregateInput
  }

  export type CachedCalendarEventScalarWhereWithAggregatesInput = {
    AND?: CachedCalendarEventScalarWhereWithAggregatesInput | CachedCalendarEventScalarWhereWithAggregatesInput[]
    OR?: CachedCalendarEventScalarWhereWithAggregatesInput[]
    NOT?: CachedCalendarEventScalarWhereWithAggregatesInput | CachedCalendarEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CachedCalendarEvent"> | string
    userId?: StringWithAggregatesFilter<"CachedCalendarEvent"> | string
    homeAccountId?: StringWithAggregatesFilter<"CachedCalendarEvent"> | string
    subject?: StringWithAggregatesFilter<"CachedCalendarEvent"> | string
    bodyPreview?: StringWithAggregatesFilter<"CachedCalendarEvent"> | string
    startDateTime?: DateTimeWithAggregatesFilter<"CachedCalendarEvent"> | Date | string
    endDateTime?: DateTimeWithAggregatesFilter<"CachedCalendarEvent"> | Date | string
    isAllDay?: BoolWithAggregatesFilter<"CachedCalendarEvent"> | boolean
    location?: StringNullableWithAggregatesFilter<"CachedCalendarEvent"> | string | null
    organizerName?: StringNullableWithAggregatesFilter<"CachedCalendarEvent"> | string | null
    organizerEmail?: StringNullableWithAggregatesFilter<"CachedCalendarEvent"> | string | null
    responseStatus?: StringWithAggregatesFilter<"CachedCalendarEvent"> | string
    onlineMeetingUrl?: StringNullableWithAggregatesFilter<"CachedCalendarEvent"> | string | null
    attendees?: JsonWithAggregatesFilter<"CachedCalendarEvent">
    isRecurring?: BoolWithAggregatesFilter<"CachedCalendarEvent"> | boolean
    reminderMinutes?: IntNullableWithAggregatesFilter<"CachedCalendarEvent"> | number | null
    showAs?: StringWithAggregatesFilter<"CachedCalendarEvent"> | string
    recurrence?: StringNullableWithAggregatesFilter<"CachedCalendarEvent"> | string | null
    syncedAt?: DateTimeWithAggregatesFilter<"CachedCalendarEvent"> | Date | string
  }

  export type CachedContactWhereInput = {
    AND?: CachedContactWhereInput | CachedContactWhereInput[]
    OR?: CachedContactWhereInput[]
    NOT?: CachedContactWhereInput | CachedContactWhereInput[]
    id?: StringFilter<"CachedContact"> | string
    userId?: StringFilter<"CachedContact"> | string
    homeAccountId?: StringFilter<"CachedContact"> | string
    displayName?: StringFilter<"CachedContact"> | string
    emailAddress?: StringFilter<"CachedContact"> | string
    phone?: StringFilter<"CachedContact"> | string
    jobTitle?: StringFilter<"CachedContact"> | string
    company?: StringFilter<"CachedContact"> | string
    syncedAt?: DateTimeFilter<"CachedContact"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type CachedContactOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    emailAddress?: SortOrder
    phone?: SortOrder
    jobTitle?: SortOrder
    company?: SortOrder
    syncedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type CachedContactWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CachedContactWhereInput | CachedContactWhereInput[]
    OR?: CachedContactWhereInput[]
    NOT?: CachedContactWhereInput | CachedContactWhereInput[]
    userId?: StringFilter<"CachedContact"> | string
    homeAccountId?: StringFilter<"CachedContact"> | string
    displayName?: StringFilter<"CachedContact"> | string
    emailAddress?: StringFilter<"CachedContact"> | string
    phone?: StringFilter<"CachedContact"> | string
    jobTitle?: StringFilter<"CachedContact"> | string
    company?: StringFilter<"CachedContact"> | string
    syncedAt?: DateTimeFilter<"CachedContact"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type CachedContactOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    emailAddress?: SortOrder
    phone?: SortOrder
    jobTitle?: SortOrder
    company?: SortOrder
    syncedAt?: SortOrder
    _count?: CachedContactCountOrderByAggregateInput
    _max?: CachedContactMaxOrderByAggregateInput
    _min?: CachedContactMinOrderByAggregateInput
  }

  export type CachedContactScalarWhereWithAggregatesInput = {
    AND?: CachedContactScalarWhereWithAggregatesInput | CachedContactScalarWhereWithAggregatesInput[]
    OR?: CachedContactScalarWhereWithAggregatesInput[]
    NOT?: CachedContactScalarWhereWithAggregatesInput | CachedContactScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CachedContact"> | string
    userId?: StringWithAggregatesFilter<"CachedContact"> | string
    homeAccountId?: StringWithAggregatesFilter<"CachedContact"> | string
    displayName?: StringWithAggregatesFilter<"CachedContact"> | string
    emailAddress?: StringWithAggregatesFilter<"CachedContact"> | string
    phone?: StringWithAggregatesFilter<"CachedContact"> | string
    jobTitle?: StringWithAggregatesFilter<"CachedContact"> | string
    company?: StringWithAggregatesFilter<"CachedContact"> | string
    syncedAt?: DateTimeWithAggregatesFilter<"CachedContact"> | Date | string
  }

  export type DeployLogWhereInput = {
    AND?: DeployLogWhereInput | DeployLogWhereInput[]
    OR?: DeployLogWhereInput[]
    NOT?: DeployLogWhereInput | DeployLogWhereInput[]
    id?: StringFilter<"DeployLog"> | string
    pusher?: StringFilter<"DeployLog"> | string
    commits?: JsonFilter<"DeployLog">
    createdAt?: DateTimeFilter<"DeployLog"> | Date | string
    digestSentAt?: DateTimeNullableFilter<"DeployLog"> | Date | string | null
  }

  export type DeployLogOrderByWithRelationInput = {
    id?: SortOrder
    pusher?: SortOrder
    commits?: SortOrder
    createdAt?: SortOrder
    digestSentAt?: SortOrderInput | SortOrder
  }

  export type DeployLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DeployLogWhereInput | DeployLogWhereInput[]
    OR?: DeployLogWhereInput[]
    NOT?: DeployLogWhereInput | DeployLogWhereInput[]
    pusher?: StringFilter<"DeployLog"> | string
    commits?: JsonFilter<"DeployLog">
    createdAt?: DateTimeFilter<"DeployLog"> | Date | string
    digestSentAt?: DateTimeNullableFilter<"DeployLog"> | Date | string | null
  }, "id">

  export type DeployLogOrderByWithAggregationInput = {
    id?: SortOrder
    pusher?: SortOrder
    commits?: SortOrder
    createdAt?: SortOrder
    digestSentAt?: SortOrderInput | SortOrder
    _count?: DeployLogCountOrderByAggregateInput
    _max?: DeployLogMaxOrderByAggregateInput
    _min?: DeployLogMinOrderByAggregateInput
  }

  export type DeployLogScalarWhereWithAggregatesInput = {
    AND?: DeployLogScalarWhereWithAggregatesInput | DeployLogScalarWhereWithAggregatesInput[]
    OR?: DeployLogScalarWhereWithAggregatesInput[]
    NOT?: DeployLogScalarWhereWithAggregatesInput | DeployLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DeployLog"> | string
    pusher?: StringWithAggregatesFilter<"DeployLog"> | string
    commits?: JsonWithAggregatesFilter<"DeployLog">
    createdAt?: DateTimeWithAggregatesFilter<"DeployLog"> | Date | string
    digestSentAt?: DateTimeNullableWithAggregatesFilter<"DeployLog"> | Date | string | null
  }

  export type EmailRuleWhereInput = {
    AND?: EmailRuleWhereInput | EmailRuleWhereInput[]
    OR?: EmailRuleWhereInput[]
    NOT?: EmailRuleWhereInput | EmailRuleWhereInput[]
    id?: StringFilter<"EmailRule"> | string
    userId?: StringFilter<"EmailRule"> | string
    name?: StringFilter<"EmailRule"> | string
    priority?: IntFilter<"EmailRule"> | number
    active?: BoolFilter<"EmailRule"> | boolean
    conditions?: JsonFilter<"EmailRule">
    actions?: JsonFilter<"EmailRule">
    emailCount?: IntFilter<"EmailRule"> | number
    stopProcessing?: BoolFilter<"EmailRule"> | boolean
    createdAt?: DateTimeFilter<"EmailRule"> | Date | string
    updatedAt?: DateTimeFilter<"EmailRule"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type EmailRuleOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    priority?: SortOrder
    active?: SortOrder
    conditions?: SortOrder
    actions?: SortOrder
    emailCount?: SortOrder
    stopProcessing?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type EmailRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EmailRuleWhereInput | EmailRuleWhereInput[]
    OR?: EmailRuleWhereInput[]
    NOT?: EmailRuleWhereInput | EmailRuleWhereInput[]
    userId?: StringFilter<"EmailRule"> | string
    name?: StringFilter<"EmailRule"> | string
    priority?: IntFilter<"EmailRule"> | number
    active?: BoolFilter<"EmailRule"> | boolean
    conditions?: JsonFilter<"EmailRule">
    actions?: JsonFilter<"EmailRule">
    emailCount?: IntFilter<"EmailRule"> | number
    stopProcessing?: BoolFilter<"EmailRule"> | boolean
    createdAt?: DateTimeFilter<"EmailRule"> | Date | string
    updatedAt?: DateTimeFilter<"EmailRule"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type EmailRuleOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    priority?: SortOrder
    active?: SortOrder
    conditions?: SortOrder
    actions?: SortOrder
    emailCount?: SortOrder
    stopProcessing?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EmailRuleCountOrderByAggregateInput
    _avg?: EmailRuleAvgOrderByAggregateInput
    _max?: EmailRuleMaxOrderByAggregateInput
    _min?: EmailRuleMinOrderByAggregateInput
    _sum?: EmailRuleSumOrderByAggregateInput
  }

  export type EmailRuleScalarWhereWithAggregatesInput = {
    AND?: EmailRuleScalarWhereWithAggregatesInput | EmailRuleScalarWhereWithAggregatesInput[]
    OR?: EmailRuleScalarWhereWithAggregatesInput[]
    NOT?: EmailRuleScalarWhereWithAggregatesInput | EmailRuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EmailRule"> | string
    userId?: StringWithAggregatesFilter<"EmailRule"> | string
    name?: StringWithAggregatesFilter<"EmailRule"> | string
    priority?: IntWithAggregatesFilter<"EmailRule"> | number
    active?: BoolWithAggregatesFilter<"EmailRule"> | boolean
    conditions?: JsonWithAggregatesFilter<"EmailRule">
    actions?: JsonWithAggregatesFilter<"EmailRule">
    emailCount?: IntWithAggregatesFilter<"EmailRule"> | number
    stopProcessing?: BoolWithAggregatesFilter<"EmailRule"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"EmailRule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"EmailRule"> | Date | string
  }

  export type OrganizationCreateInput = {
    id?: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutOrgInput
  }

  export type OrganizationUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutOrgInput
  }

  export type OrganizationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutOrgNestedInput
  }

  export type OrganizationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutOrgNestedInput
  }

  export type OrganizationCreateManyInput = {
    id?: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
  }

  export type MsConnectedAccountCreateInput = {
    id?: string
    homeAccountId: string
    msEmail: string
    displayName?: string | null
    tenantId?: string | null
    isDefault?: boolean
    connectedAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMsAccountsInput
  }

  export type MsConnectedAccountUncheckedCreateInput = {
    id?: string
    userId: string
    homeAccountId: string
    msEmail: string
    displayName?: string | null
    tenantId?: string | null
    isDefault?: boolean
    connectedAt?: Date | string
    updatedAt?: Date | string
  }

  export type MsConnectedAccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    msEmail?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    connectedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMsAccountsNestedInput
  }

  export type MsConnectedAccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    msEmail?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    connectedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsConnectedAccountCreateManyInput = {
    id?: string
    userId: string
    homeAccountId: string
    msEmail: string
    displayName?: string | null
    tenantId?: string | null
    isDefault?: boolean
    connectedAt?: Date | string
    updatedAt?: Date | string
  }

  export type MsConnectedAccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    msEmail?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    connectedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsConnectedAccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    msEmail?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    connectedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsalTokenCacheCreateInput = {
    id?: string
    cacheJson: string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMsalCacheInput
  }

  export type MsalTokenCacheUncheckedCreateInput = {
    id?: string
    userId: string
    cacheJson: string
    updatedAt?: Date | string
  }

  export type MsalTokenCacheUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cacheJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMsalCacheNestedInput
  }

  export type MsalTokenCacheUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    cacheJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsalTokenCacheCreateManyInput = {
    id?: string
    userId: string
    cacheJson: string
    updatedAt?: Date | string
  }

  export type MsalTokenCacheUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    cacheJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsalTokenCacheUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    cacheJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailDeltaLinkCreateInput = {
    id?: string
    homeAccountId: string
    folderId: string
    deltaToken: string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDeltaLinksInput
  }

  export type EmailDeltaLinkUncheckedCreateInput = {
    id?: string
    userId: string
    homeAccountId: string
    folderId: string
    deltaToken: string
    updatedAt?: Date | string
  }

  export type EmailDeltaLinkUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    deltaToken?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDeltaLinksNestedInput
  }

  export type EmailDeltaLinkUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    deltaToken?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailDeltaLinkCreateManyInput = {
    id?: string
    userId: string
    homeAccountId: string
    folderId: string
    deltaToken: string
    updatedAt?: Date | string
  }

  export type EmailDeltaLinkUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    deltaToken?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailDeltaLinkUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    deltaToken?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookSubscriptionCreateInput = {
    id?: string
    homeAccountId: string
    subscriptionId: string
    resource: string
    expiresAt: Date | string
    clientState: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutWebhookSubsInput
  }

  export type WebhookSubscriptionUncheckedCreateInput = {
    id?: string
    userId: string
    homeAccountId: string
    subscriptionId: string
    resource: string
    expiresAt: Date | string
    clientState: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WebhookSubscriptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientState?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutWebhookSubsNestedInput
  }

  export type WebhookSubscriptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientState?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookSubscriptionCreateManyInput = {
    id?: string
    userId: string
    homeAccountId: string
    subscriptionId: string
    resource: string
    expiresAt: Date | string
    clientState: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WebhookSubscriptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientState?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookSubscriptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientState?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftCreateInput = {
    id?: string
    homeAccountId?: string | null
    graphDraftId?: string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: string | null
    bodyHtml?: string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: string
    requestReadReceipt?: boolean
    draftType?: string
    inReplyToMessageId?: string | null
    forwardedMessageId?: string | null
    scheduledAt?: Date | string | null
    scheduledSent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDraftsInput
  }

  export type DraftUncheckedCreateInput = {
    id?: string
    userId: string
    homeAccountId?: string | null
    graphDraftId?: string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: string | null
    bodyHtml?: string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: string
    requestReadReceipt?: boolean
    draftType?: string
    inReplyToMessageId?: string | null
    forwardedMessageId?: string | null
    scheduledAt?: Date | string | null
    scheduledSent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DraftUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    graphDraftId?: NullableStringFieldUpdateOperationsInput | string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    bodyHtml?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: StringFieldUpdateOperationsInput | string
    requestReadReceipt?: BoolFieldUpdateOperationsInput | boolean
    draftType?: StringFieldUpdateOperationsInput | string
    inReplyToMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    forwardedMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledSent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDraftsNestedInput
  }

  export type DraftUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    graphDraftId?: NullableStringFieldUpdateOperationsInput | string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    bodyHtml?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: StringFieldUpdateOperationsInput | string
    requestReadReceipt?: BoolFieldUpdateOperationsInput | boolean
    draftType?: StringFieldUpdateOperationsInput | string
    inReplyToMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    forwardedMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledSent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftCreateManyInput = {
    id?: string
    userId: string
    homeAccountId?: string | null
    graphDraftId?: string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: string | null
    bodyHtml?: string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: string
    requestReadReceipt?: boolean
    draftType?: string
    inReplyToMessageId?: string | null
    forwardedMessageId?: string | null
    scheduledAt?: Date | string | null
    scheduledSent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DraftUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    graphDraftId?: NullableStringFieldUpdateOperationsInput | string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    bodyHtml?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: StringFieldUpdateOperationsInput | string
    requestReadReceipt?: BoolFieldUpdateOperationsInput | boolean
    draftType?: StringFieldUpdateOperationsInput | string
    inReplyToMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    forwardedMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledSent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    graphDraftId?: NullableStringFieldUpdateOperationsInput | string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    bodyHtml?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: StringFieldUpdateOperationsInput | string
    requestReadReceipt?: BoolFieldUpdateOperationsInput | boolean
    draftType?: StringFieldUpdateOperationsInput | string
    inReplyToMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    forwardedMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledSent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignatureCreateInput = {
    id?: string
    name: string
    html?: string
    title?: string | null
    company?: string | null
    phone?: string | null
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: string
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutSignaturesInput
  }

  export type SignatureUncheckedCreateInput = {
    id?: string
    userId: string
    name: string
    html?: string
    title?: string | null
    company?: string | null
    phone?: string | null
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: string
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignatureUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    html?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    defaultNew?: BoolFieldUpdateOperationsInput | boolean
    defaultReplies?: BoolFieldUpdateOperationsInput | boolean
    account?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSignaturesNestedInput
  }

  export type SignatureUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    html?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    defaultNew?: BoolFieldUpdateOperationsInput | boolean
    defaultReplies?: BoolFieldUpdateOperationsInput | boolean
    account?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignatureCreateManyInput = {
    id?: string
    userId: string
    name: string
    html?: string
    title?: string | null
    company?: string | null
    phone?: string | null
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: string
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignatureUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    html?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    defaultNew?: BoolFieldUpdateOperationsInput | boolean
    defaultReplies?: BoolFieldUpdateOperationsInput | boolean
    account?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignatureUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    html?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    defaultNew?: BoolFieldUpdateOperationsInput | boolean
    defaultReplies?: BoolFieldUpdateOperationsInput | boolean
    account?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedFolderCreateInput = {
    id: string
    homeAccountId: string
    displayName: string
    parentFolderId?: string | null
    unreadCount?: number
    totalCount?: number
    wellKnownName?: string | null
    syncedAt?: Date | string
    user: UserCreateNestedOneWithoutCachedFoldersInput
  }

  export type CachedFolderUncheckedCreateInput = {
    id: string
    userId: string
    homeAccountId: string
    displayName: string
    parentFolderId?: string | null
    unreadCount?: number
    totalCount?: number
    wellKnownName?: string | null
    syncedAt?: Date | string
  }

  export type CachedFolderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    parentFolderId?: NullableStringFieldUpdateOperationsInput | string | null
    unreadCount?: IntFieldUpdateOperationsInput | number
    totalCount?: IntFieldUpdateOperationsInput | number
    wellKnownName?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCachedFoldersNestedInput
  }

  export type CachedFolderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    parentFolderId?: NullableStringFieldUpdateOperationsInput | string | null
    unreadCount?: IntFieldUpdateOperationsInput | number
    totalCount?: IntFieldUpdateOperationsInput | number
    wellKnownName?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedFolderCreateManyInput = {
    id: string
    userId: string
    homeAccountId: string
    displayName: string
    parentFolderId?: string | null
    unreadCount?: number
    totalCount?: number
    wellKnownName?: string | null
    syncedAt?: Date | string
  }

  export type CachedFolderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    parentFolderId?: NullableStringFieldUpdateOperationsInput | string | null
    unreadCount?: IntFieldUpdateOperationsInput | number
    totalCount?: IntFieldUpdateOperationsInput | number
    wellKnownName?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedFolderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    parentFolderId?: NullableStringFieldUpdateOperationsInput | string | null
    unreadCount?: IntFieldUpdateOperationsInput | number
    totalCount?: IntFieldUpdateOperationsInput | number
    wellKnownName?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedEmailCreateInput = {
    id: string
    homeAccountId: string
    folderId: string
    subject?: string
    bodyPreview?: string
    fromName?: string
    fromAddress?: string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime: Date | string
    sentDateTime?: Date | string | null
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: Date | string
    user: UserCreateNestedOneWithoutCachedEmailsInput
  }

  export type CachedEmailUncheckedCreateInput = {
    id: string
    userId: string
    homeAccountId: string
    folderId: string
    subject?: string
    bodyPreview?: string
    fromName?: string
    fromAddress?: string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime: Date | string
    sentDateTime?: Date | string | null
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: Date | string
  }

  export type CachedEmailUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    fromName?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    sentDateTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hasAttachments?: BoolFieldUpdateOperationsInput | boolean
    flagStatus?: StringFieldUpdateOperationsInput | string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCachedEmailsNestedInput
  }

  export type CachedEmailUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    fromName?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    sentDateTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hasAttachments?: BoolFieldUpdateOperationsInput | boolean
    flagStatus?: StringFieldUpdateOperationsInput | string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedEmailCreateManyInput = {
    id: string
    userId: string
    homeAccountId: string
    folderId: string
    subject?: string
    bodyPreview?: string
    fromName?: string
    fromAddress?: string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime: Date | string
    sentDateTime?: Date | string | null
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: Date | string
  }

  export type CachedEmailUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    fromName?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    sentDateTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hasAttachments?: BoolFieldUpdateOperationsInput | boolean
    flagStatus?: StringFieldUpdateOperationsInput | string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedEmailUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    fromName?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    sentDateTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hasAttachments?: BoolFieldUpdateOperationsInput | boolean
    flagStatus?: StringFieldUpdateOperationsInput | string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCalendarEventCreateInput = {
    id: string
    homeAccountId: string
    subject?: string
    bodyPreview?: string
    startDateTime: Date | string
    endDateTime: Date | string
    isAllDay?: boolean
    location?: string | null
    organizerName?: string | null
    organizerEmail?: string | null
    responseStatus?: string
    onlineMeetingUrl?: string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: boolean
    reminderMinutes?: number | null
    showAs?: string
    recurrence?: string | null
    syncedAt?: Date | string
    user: UserCreateNestedOneWithoutCachedCalEventsInput
  }

  export type CachedCalendarEventUncheckedCreateInput = {
    id: string
    userId: string
    homeAccountId: string
    subject?: string
    bodyPreview?: string
    startDateTime: Date | string
    endDateTime: Date | string
    isAllDay?: boolean
    location?: string | null
    organizerName?: string | null
    organizerEmail?: string | null
    responseStatus?: string
    onlineMeetingUrl?: string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: boolean
    reminderMinutes?: number | null
    showAs?: string
    recurrence?: string | null
    syncedAt?: Date | string
  }

  export type CachedCalendarEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    startDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isAllDay?: BoolFieldUpdateOperationsInput | boolean
    location?: NullableStringFieldUpdateOperationsInput | string | null
    organizerName?: NullableStringFieldUpdateOperationsInput | string | null
    organizerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    responseStatus?: StringFieldUpdateOperationsInput | string
    onlineMeetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: BoolFieldUpdateOperationsInput | boolean
    reminderMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    showAs?: StringFieldUpdateOperationsInput | string
    recurrence?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCachedCalEventsNestedInput
  }

  export type CachedCalendarEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    startDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isAllDay?: BoolFieldUpdateOperationsInput | boolean
    location?: NullableStringFieldUpdateOperationsInput | string | null
    organizerName?: NullableStringFieldUpdateOperationsInput | string | null
    organizerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    responseStatus?: StringFieldUpdateOperationsInput | string
    onlineMeetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: BoolFieldUpdateOperationsInput | boolean
    reminderMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    showAs?: StringFieldUpdateOperationsInput | string
    recurrence?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCalendarEventCreateManyInput = {
    id: string
    userId: string
    homeAccountId: string
    subject?: string
    bodyPreview?: string
    startDateTime: Date | string
    endDateTime: Date | string
    isAllDay?: boolean
    location?: string | null
    organizerName?: string | null
    organizerEmail?: string | null
    responseStatus?: string
    onlineMeetingUrl?: string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: boolean
    reminderMinutes?: number | null
    showAs?: string
    recurrence?: string | null
    syncedAt?: Date | string
  }

  export type CachedCalendarEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    startDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isAllDay?: BoolFieldUpdateOperationsInput | boolean
    location?: NullableStringFieldUpdateOperationsInput | string | null
    organizerName?: NullableStringFieldUpdateOperationsInput | string | null
    organizerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    responseStatus?: StringFieldUpdateOperationsInput | string
    onlineMeetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: BoolFieldUpdateOperationsInput | boolean
    reminderMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    showAs?: StringFieldUpdateOperationsInput | string
    recurrence?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCalendarEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    startDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isAllDay?: BoolFieldUpdateOperationsInput | boolean
    location?: NullableStringFieldUpdateOperationsInput | string | null
    organizerName?: NullableStringFieldUpdateOperationsInput | string | null
    organizerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    responseStatus?: StringFieldUpdateOperationsInput | string
    onlineMeetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: BoolFieldUpdateOperationsInput | boolean
    reminderMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    showAs?: StringFieldUpdateOperationsInput | string
    recurrence?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedContactCreateInput = {
    id: string
    homeAccountId: string
    displayName?: string
    emailAddress?: string
    phone?: string
    jobTitle?: string
    company?: string
    syncedAt?: Date | string
    user: UserCreateNestedOneWithoutCachedContactsInput
  }

  export type CachedContactUncheckedCreateInput = {
    id: string
    userId: string
    homeAccountId: string
    displayName?: string
    emailAddress?: string
    phone?: string
    jobTitle?: string
    company?: string
    syncedAt?: Date | string
  }

  export type CachedContactUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCachedContactsNestedInput
  }

  export type CachedContactUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedContactCreateManyInput = {
    id: string
    userId: string
    homeAccountId: string
    displayName?: string
    emailAddress?: string
    phone?: string
    jobTitle?: string
    company?: string
    syncedAt?: Date | string
  }

  export type CachedContactUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedContactUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeployLogCreateInput = {
    id?: string
    pusher: string
    commits: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    digestSentAt?: Date | string | null
  }

  export type DeployLogUncheckedCreateInput = {
    id?: string
    pusher: string
    commits: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    digestSentAt?: Date | string | null
  }

  export type DeployLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pusher?: StringFieldUpdateOperationsInput | string
    commits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    digestSentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DeployLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pusher?: StringFieldUpdateOperationsInput | string
    commits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    digestSentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DeployLogCreateManyInput = {
    id?: string
    pusher: string
    commits: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    digestSentAt?: Date | string | null
  }

  export type DeployLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    pusher?: StringFieldUpdateOperationsInput | string
    commits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    digestSentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DeployLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    pusher?: StringFieldUpdateOperationsInput | string
    commits?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    digestSentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EmailRuleCreateInput = {
    id?: string
    name: string
    priority: number
    active?: boolean
    conditions: JsonNullValueInput | InputJsonValue
    actions: JsonNullValueInput | InputJsonValue
    emailCount?: number
    stopProcessing?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutEmailRulesInput
  }

  export type EmailRuleUncheckedCreateInput = {
    id?: string
    userId: string
    name: string
    priority: number
    active?: boolean
    conditions: JsonNullValueInput | InputJsonValue
    actions: JsonNullValueInput | InputJsonValue
    emailCount?: number
    stopProcessing?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmailRuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    conditions?: JsonNullValueInput | InputJsonValue
    actions?: JsonNullValueInput | InputJsonValue
    emailCount?: IntFieldUpdateOperationsInput | number
    stopProcessing?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutEmailRulesNestedInput
  }

  export type EmailRuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    conditions?: JsonNullValueInput | InputJsonValue
    actions?: JsonNullValueInput | InputJsonValue
    emailCount?: IntFieldUpdateOperationsInput | number
    stopProcessing?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailRuleCreateManyInput = {
    id?: string
    userId: string
    name: string
    priority: number
    active?: boolean
    conditions: JsonNullValueInput | InputJsonValue
    actions: JsonNullValueInput | InputJsonValue
    emailCount?: number
    stopProcessing?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmailRuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    conditions?: JsonNullValueInput | InputJsonValue
    actions?: JsonNullValueInput | InputJsonValue
    emailCount?: IntFieldUpdateOperationsInput | number
    stopProcessing?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailRuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    conditions?: JsonNullValueInput | InputJsonValue
    actions?: JsonNullValueInput | InputJsonValue
    emailCount?: IntFieldUpdateOperationsInput | number
    stopProcessing?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrganizationCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type OrganizationScalarRelationFilter = {
    is?: OrganizationWhereInput
    isNot?: OrganizationWhereInput
  }

  export type MsConnectedAccountListRelationFilter = {
    every?: MsConnectedAccountWhereInput
    some?: MsConnectedAccountWhereInput
    none?: MsConnectedAccountWhereInput
  }

  export type MsalTokenCacheNullableScalarRelationFilter = {
    is?: MsalTokenCacheWhereInput | null
    isNot?: MsalTokenCacheWhereInput | null
  }

  export type EmailDeltaLinkListRelationFilter = {
    every?: EmailDeltaLinkWhereInput
    some?: EmailDeltaLinkWhereInput
    none?: EmailDeltaLinkWhereInput
  }

  export type WebhookSubscriptionListRelationFilter = {
    every?: WebhookSubscriptionWhereInput
    some?: WebhookSubscriptionWhereInput
    none?: WebhookSubscriptionWhereInput
  }

  export type DraftListRelationFilter = {
    every?: DraftWhereInput
    some?: DraftWhereInput
    none?: DraftWhereInput
  }

  export type EmailRuleListRelationFilter = {
    every?: EmailRuleWhereInput
    some?: EmailRuleWhereInput
    none?: EmailRuleWhereInput
  }

  export type SignatureListRelationFilter = {
    every?: SignatureWhereInput
    some?: SignatureWhereInput
    none?: SignatureWhereInput
  }

  export type CachedFolderListRelationFilter = {
    every?: CachedFolderWhereInput
    some?: CachedFolderWhereInput
    none?: CachedFolderWhereInput
  }

  export type CachedEmailListRelationFilter = {
    every?: CachedEmailWhereInput
    some?: CachedEmailWhereInput
    none?: CachedEmailWhereInput
  }

  export type CachedCalendarEventListRelationFilter = {
    every?: CachedCalendarEventWhereInput
    some?: CachedCalendarEventWhereInput
    none?: CachedCalendarEventWhereInput
  }

  export type CachedContactListRelationFilter = {
    every?: CachedContactWhereInput
    some?: CachedContactWhereInput
    none?: CachedContactWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MsConnectedAccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmailDeltaLinkOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WebhookSubscriptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DraftOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmailRuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SignatureOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CachedFolderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CachedEmailOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CachedCalendarEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CachedContactOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    avatarUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orgId?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    avatarUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orgId?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    avatarUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orgId?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type MsConnectedAccountUserIdHomeAccountIdCompoundUniqueInput = {
    userId: string
    homeAccountId: string
  }

  export type MsConnectedAccountCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    msEmail?: SortOrder
    displayName?: SortOrder
    tenantId?: SortOrder
    isDefault?: SortOrder
    connectedAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MsConnectedAccountMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    msEmail?: SortOrder
    displayName?: SortOrder
    tenantId?: SortOrder
    isDefault?: SortOrder
    connectedAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MsConnectedAccountMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    msEmail?: SortOrder
    displayName?: SortOrder
    tenantId?: SortOrder
    isDefault?: SortOrder
    connectedAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type MsalTokenCacheCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    cacheJson?: SortOrder
    updatedAt?: SortOrder
  }

  export type MsalTokenCacheMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    cacheJson?: SortOrder
    updatedAt?: SortOrder
  }

  export type MsalTokenCacheMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    cacheJson?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmailDeltaLinkUserIdHomeAccountIdFolderIdCompoundUniqueInput = {
    userId: string
    homeAccountId: string
    folderId: string
  }

  export type EmailDeltaLinkCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    deltaToken?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmailDeltaLinkMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    deltaToken?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmailDeltaLinkMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    deltaToken?: SortOrder
    updatedAt?: SortOrder
  }

  export type WebhookSubscriptionCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subscriptionId?: SortOrder
    resource?: SortOrder
    expiresAt?: SortOrder
    clientState?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WebhookSubscriptionMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subscriptionId?: SortOrder
    resource?: SortOrder
    expiresAt?: SortOrder
    clientState?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WebhookSubscriptionMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subscriptionId?: SortOrder
    resource?: SortOrder
    expiresAt?: SortOrder
    clientState?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DraftCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    graphDraftId?: SortOrder
    toRecipients?: SortOrder
    ccRecipients?: SortOrder
    bccRecipients?: SortOrder
    subject?: SortOrder
    bodyHtml?: SortOrder
    attachments?: SortOrder
    importance?: SortOrder
    requestReadReceipt?: SortOrder
    draftType?: SortOrder
    inReplyToMessageId?: SortOrder
    forwardedMessageId?: SortOrder
    scheduledAt?: SortOrder
    scheduledSent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DraftMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    graphDraftId?: SortOrder
    subject?: SortOrder
    bodyHtml?: SortOrder
    importance?: SortOrder
    requestReadReceipt?: SortOrder
    draftType?: SortOrder
    inReplyToMessageId?: SortOrder
    forwardedMessageId?: SortOrder
    scheduledAt?: SortOrder
    scheduledSent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DraftMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    graphDraftId?: SortOrder
    subject?: SortOrder
    bodyHtml?: SortOrder
    importance?: SortOrder
    requestReadReceipt?: SortOrder
    draftType?: SortOrder
    inReplyToMessageId?: SortOrder
    forwardedMessageId?: SortOrder
    scheduledAt?: SortOrder
    scheduledSent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type SignatureCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    html?: SortOrder
    title?: SortOrder
    company?: SortOrder
    phone?: SortOrder
    defaultNew?: SortOrder
    defaultReplies?: SortOrder
    account?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignatureMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    html?: SortOrder
    title?: SortOrder
    company?: SortOrder
    phone?: SortOrder
    defaultNew?: SortOrder
    defaultReplies?: SortOrder
    account?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignatureMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    html?: SortOrder
    title?: SortOrder
    company?: SortOrder
    phone?: SortOrder
    defaultNew?: SortOrder
    defaultReplies?: SortOrder
    account?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type CachedFolderCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    parentFolderId?: SortOrder
    unreadCount?: SortOrder
    totalCount?: SortOrder
    wellKnownName?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedFolderAvgOrderByAggregateInput = {
    unreadCount?: SortOrder
    totalCount?: SortOrder
  }

  export type CachedFolderMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    parentFolderId?: SortOrder
    unreadCount?: SortOrder
    totalCount?: SortOrder
    wellKnownName?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedFolderMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    parentFolderId?: SortOrder
    unreadCount?: SortOrder
    totalCount?: SortOrder
    wellKnownName?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedFolderSumOrderByAggregateInput = {
    unreadCount?: SortOrder
    totalCount?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type CachedEmailCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    fromName?: SortOrder
    fromAddress?: SortOrder
    toRecipients?: SortOrder
    receivedDateTime?: SortOrder
    sentDateTime?: SortOrder
    isRead?: SortOrder
    hasAttachments?: SortOrder
    flagStatus?: SortOrder
    categories?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedEmailMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    fromName?: SortOrder
    fromAddress?: SortOrder
    receivedDateTime?: SortOrder
    sentDateTime?: SortOrder
    isRead?: SortOrder
    hasAttachments?: SortOrder
    flagStatus?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedEmailMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    folderId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    fromName?: SortOrder
    fromAddress?: SortOrder
    receivedDateTime?: SortOrder
    sentDateTime?: SortOrder
    isRead?: SortOrder
    hasAttachments?: SortOrder
    flagStatus?: SortOrder
    syncedAt?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type CachedCalendarEventCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    startDateTime?: SortOrder
    endDateTime?: SortOrder
    isAllDay?: SortOrder
    location?: SortOrder
    organizerName?: SortOrder
    organizerEmail?: SortOrder
    responseStatus?: SortOrder
    onlineMeetingUrl?: SortOrder
    attendees?: SortOrder
    isRecurring?: SortOrder
    reminderMinutes?: SortOrder
    showAs?: SortOrder
    recurrence?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedCalendarEventAvgOrderByAggregateInput = {
    reminderMinutes?: SortOrder
  }

  export type CachedCalendarEventMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    startDateTime?: SortOrder
    endDateTime?: SortOrder
    isAllDay?: SortOrder
    location?: SortOrder
    organizerName?: SortOrder
    organizerEmail?: SortOrder
    responseStatus?: SortOrder
    onlineMeetingUrl?: SortOrder
    isRecurring?: SortOrder
    reminderMinutes?: SortOrder
    showAs?: SortOrder
    recurrence?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedCalendarEventMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    subject?: SortOrder
    bodyPreview?: SortOrder
    startDateTime?: SortOrder
    endDateTime?: SortOrder
    isAllDay?: SortOrder
    location?: SortOrder
    organizerName?: SortOrder
    organizerEmail?: SortOrder
    responseStatus?: SortOrder
    onlineMeetingUrl?: SortOrder
    isRecurring?: SortOrder
    reminderMinutes?: SortOrder
    showAs?: SortOrder
    recurrence?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedCalendarEventSumOrderByAggregateInput = {
    reminderMinutes?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type CachedContactCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    emailAddress?: SortOrder
    phone?: SortOrder
    jobTitle?: SortOrder
    company?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedContactMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    emailAddress?: SortOrder
    phone?: SortOrder
    jobTitle?: SortOrder
    company?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedContactMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    homeAccountId?: SortOrder
    displayName?: SortOrder
    emailAddress?: SortOrder
    phone?: SortOrder
    jobTitle?: SortOrder
    company?: SortOrder
    syncedAt?: SortOrder
  }

  export type DeployLogCountOrderByAggregateInput = {
    id?: SortOrder
    pusher?: SortOrder
    commits?: SortOrder
    createdAt?: SortOrder
    digestSentAt?: SortOrder
  }

  export type DeployLogMaxOrderByAggregateInput = {
    id?: SortOrder
    pusher?: SortOrder
    createdAt?: SortOrder
    digestSentAt?: SortOrder
  }

  export type DeployLogMinOrderByAggregateInput = {
    id?: SortOrder
    pusher?: SortOrder
    createdAt?: SortOrder
    digestSentAt?: SortOrder
  }

  export type EmailRuleCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    priority?: SortOrder
    active?: SortOrder
    conditions?: SortOrder
    actions?: SortOrder
    emailCount?: SortOrder
    stopProcessing?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmailRuleAvgOrderByAggregateInput = {
    priority?: SortOrder
    emailCount?: SortOrder
  }

  export type EmailRuleMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    priority?: SortOrder
    active?: SortOrder
    emailCount?: SortOrder
    stopProcessing?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmailRuleMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    priority?: SortOrder
    active?: SortOrder
    emailCount?: SortOrder
    stopProcessing?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmailRuleSumOrderByAggregateInput = {
    priority?: SortOrder
    emailCount?: SortOrder
  }

  export type UserCreateNestedManyWithoutOrgInput = {
    create?: XOR<UserCreateWithoutOrgInput, UserUncheckedCreateWithoutOrgInput> | UserCreateWithoutOrgInput[] | UserUncheckedCreateWithoutOrgInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOrgInput | UserCreateOrConnectWithoutOrgInput[]
    createMany?: UserCreateManyOrgInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutOrgInput = {
    create?: XOR<UserCreateWithoutOrgInput, UserUncheckedCreateWithoutOrgInput> | UserCreateWithoutOrgInput[] | UserUncheckedCreateWithoutOrgInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOrgInput | UserCreateOrConnectWithoutOrgInput[]
    createMany?: UserCreateManyOrgInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateManyWithoutOrgNestedInput = {
    create?: XOR<UserCreateWithoutOrgInput, UserUncheckedCreateWithoutOrgInput> | UserCreateWithoutOrgInput[] | UserUncheckedCreateWithoutOrgInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOrgInput | UserCreateOrConnectWithoutOrgInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutOrgInput | UserUpsertWithWhereUniqueWithoutOrgInput[]
    createMany?: UserCreateManyOrgInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutOrgInput | UserUpdateWithWhereUniqueWithoutOrgInput[]
    updateMany?: UserUpdateManyWithWhereWithoutOrgInput | UserUpdateManyWithWhereWithoutOrgInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutOrgNestedInput = {
    create?: XOR<UserCreateWithoutOrgInput, UserUncheckedCreateWithoutOrgInput> | UserCreateWithoutOrgInput[] | UserUncheckedCreateWithoutOrgInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOrgInput | UserCreateOrConnectWithoutOrgInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutOrgInput | UserUpsertWithWhereUniqueWithoutOrgInput[]
    createMany?: UserCreateManyOrgInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutOrgInput | UserUpdateWithWhereUniqueWithoutOrgInput[]
    updateMany?: UserUpdateManyWithWhereWithoutOrgInput | UserUpdateManyWithWhereWithoutOrgInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutUsersInput = {
    create?: XOR<OrganizationCreateWithoutUsersInput, OrganizationUncheckedCreateWithoutUsersInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutUsersInput
    connect?: OrganizationWhereUniqueInput
  }

  export type MsConnectedAccountCreateNestedManyWithoutUserInput = {
    create?: XOR<MsConnectedAccountCreateWithoutUserInput, MsConnectedAccountUncheckedCreateWithoutUserInput> | MsConnectedAccountCreateWithoutUserInput[] | MsConnectedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MsConnectedAccountCreateOrConnectWithoutUserInput | MsConnectedAccountCreateOrConnectWithoutUserInput[]
    createMany?: MsConnectedAccountCreateManyUserInputEnvelope
    connect?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
  }

  export type MsalTokenCacheCreateNestedOneWithoutUserInput = {
    create?: XOR<MsalTokenCacheCreateWithoutUserInput, MsalTokenCacheUncheckedCreateWithoutUserInput>
    connectOrCreate?: MsalTokenCacheCreateOrConnectWithoutUserInput
    connect?: MsalTokenCacheWhereUniqueInput
  }

  export type EmailDeltaLinkCreateNestedManyWithoutUserInput = {
    create?: XOR<EmailDeltaLinkCreateWithoutUserInput, EmailDeltaLinkUncheckedCreateWithoutUserInput> | EmailDeltaLinkCreateWithoutUserInput[] | EmailDeltaLinkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailDeltaLinkCreateOrConnectWithoutUserInput | EmailDeltaLinkCreateOrConnectWithoutUserInput[]
    createMany?: EmailDeltaLinkCreateManyUserInputEnvelope
    connect?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
  }

  export type WebhookSubscriptionCreateNestedManyWithoutUserInput = {
    create?: XOR<WebhookSubscriptionCreateWithoutUserInput, WebhookSubscriptionUncheckedCreateWithoutUserInput> | WebhookSubscriptionCreateWithoutUserInput[] | WebhookSubscriptionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WebhookSubscriptionCreateOrConnectWithoutUserInput | WebhookSubscriptionCreateOrConnectWithoutUserInput[]
    createMany?: WebhookSubscriptionCreateManyUserInputEnvelope
    connect?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
  }

  export type DraftCreateNestedManyWithoutUserInput = {
    create?: XOR<DraftCreateWithoutUserInput, DraftUncheckedCreateWithoutUserInput> | DraftCreateWithoutUserInput[] | DraftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DraftCreateOrConnectWithoutUserInput | DraftCreateOrConnectWithoutUserInput[]
    createMany?: DraftCreateManyUserInputEnvelope
    connect?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
  }

  export type EmailRuleCreateNestedManyWithoutUserInput = {
    create?: XOR<EmailRuleCreateWithoutUserInput, EmailRuleUncheckedCreateWithoutUserInput> | EmailRuleCreateWithoutUserInput[] | EmailRuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailRuleCreateOrConnectWithoutUserInput | EmailRuleCreateOrConnectWithoutUserInput[]
    createMany?: EmailRuleCreateManyUserInputEnvelope
    connect?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
  }

  export type SignatureCreateNestedManyWithoutUserInput = {
    create?: XOR<SignatureCreateWithoutUserInput, SignatureUncheckedCreateWithoutUserInput> | SignatureCreateWithoutUserInput[] | SignatureUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SignatureCreateOrConnectWithoutUserInput | SignatureCreateOrConnectWithoutUserInput[]
    createMany?: SignatureCreateManyUserInputEnvelope
    connect?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
  }

  export type CachedFolderCreateNestedManyWithoutUserInput = {
    create?: XOR<CachedFolderCreateWithoutUserInput, CachedFolderUncheckedCreateWithoutUserInput> | CachedFolderCreateWithoutUserInput[] | CachedFolderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedFolderCreateOrConnectWithoutUserInput | CachedFolderCreateOrConnectWithoutUserInput[]
    createMany?: CachedFolderCreateManyUserInputEnvelope
    connect?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
  }

  export type CachedEmailCreateNestedManyWithoutUserInput = {
    create?: XOR<CachedEmailCreateWithoutUserInput, CachedEmailUncheckedCreateWithoutUserInput> | CachedEmailCreateWithoutUserInput[] | CachedEmailUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedEmailCreateOrConnectWithoutUserInput | CachedEmailCreateOrConnectWithoutUserInput[]
    createMany?: CachedEmailCreateManyUserInputEnvelope
    connect?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
  }

  export type CachedCalendarEventCreateNestedManyWithoutUserInput = {
    create?: XOR<CachedCalendarEventCreateWithoutUserInput, CachedCalendarEventUncheckedCreateWithoutUserInput> | CachedCalendarEventCreateWithoutUserInput[] | CachedCalendarEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedCalendarEventCreateOrConnectWithoutUserInput | CachedCalendarEventCreateOrConnectWithoutUserInput[]
    createMany?: CachedCalendarEventCreateManyUserInputEnvelope
    connect?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
  }

  export type CachedContactCreateNestedManyWithoutUserInput = {
    create?: XOR<CachedContactCreateWithoutUserInput, CachedContactUncheckedCreateWithoutUserInput> | CachedContactCreateWithoutUserInput[] | CachedContactUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedContactCreateOrConnectWithoutUserInput | CachedContactCreateOrConnectWithoutUserInput[]
    createMany?: CachedContactCreateManyUserInputEnvelope
    connect?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
  }

  export type MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MsConnectedAccountCreateWithoutUserInput, MsConnectedAccountUncheckedCreateWithoutUserInput> | MsConnectedAccountCreateWithoutUserInput[] | MsConnectedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MsConnectedAccountCreateOrConnectWithoutUserInput | MsConnectedAccountCreateOrConnectWithoutUserInput[]
    createMany?: MsConnectedAccountCreateManyUserInputEnvelope
    connect?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
  }

  export type MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<MsalTokenCacheCreateWithoutUserInput, MsalTokenCacheUncheckedCreateWithoutUserInput>
    connectOrCreate?: MsalTokenCacheCreateOrConnectWithoutUserInput
    connect?: MsalTokenCacheWhereUniqueInput
  }

  export type EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<EmailDeltaLinkCreateWithoutUserInput, EmailDeltaLinkUncheckedCreateWithoutUserInput> | EmailDeltaLinkCreateWithoutUserInput[] | EmailDeltaLinkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailDeltaLinkCreateOrConnectWithoutUserInput | EmailDeltaLinkCreateOrConnectWithoutUserInput[]
    createMany?: EmailDeltaLinkCreateManyUserInputEnvelope
    connect?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
  }

  export type WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<WebhookSubscriptionCreateWithoutUserInput, WebhookSubscriptionUncheckedCreateWithoutUserInput> | WebhookSubscriptionCreateWithoutUserInput[] | WebhookSubscriptionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WebhookSubscriptionCreateOrConnectWithoutUserInput | WebhookSubscriptionCreateOrConnectWithoutUserInput[]
    createMany?: WebhookSubscriptionCreateManyUserInputEnvelope
    connect?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
  }

  export type DraftUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<DraftCreateWithoutUserInput, DraftUncheckedCreateWithoutUserInput> | DraftCreateWithoutUserInput[] | DraftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DraftCreateOrConnectWithoutUserInput | DraftCreateOrConnectWithoutUserInput[]
    createMany?: DraftCreateManyUserInputEnvelope
    connect?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
  }

  export type EmailRuleUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<EmailRuleCreateWithoutUserInput, EmailRuleUncheckedCreateWithoutUserInput> | EmailRuleCreateWithoutUserInput[] | EmailRuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailRuleCreateOrConnectWithoutUserInput | EmailRuleCreateOrConnectWithoutUserInput[]
    createMany?: EmailRuleCreateManyUserInputEnvelope
    connect?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
  }

  export type SignatureUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SignatureCreateWithoutUserInput, SignatureUncheckedCreateWithoutUserInput> | SignatureCreateWithoutUserInput[] | SignatureUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SignatureCreateOrConnectWithoutUserInput | SignatureCreateOrConnectWithoutUserInput[]
    createMany?: SignatureCreateManyUserInputEnvelope
    connect?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
  }

  export type CachedFolderUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<CachedFolderCreateWithoutUserInput, CachedFolderUncheckedCreateWithoutUserInput> | CachedFolderCreateWithoutUserInput[] | CachedFolderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedFolderCreateOrConnectWithoutUserInput | CachedFolderCreateOrConnectWithoutUserInput[]
    createMany?: CachedFolderCreateManyUserInputEnvelope
    connect?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
  }

  export type CachedEmailUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<CachedEmailCreateWithoutUserInput, CachedEmailUncheckedCreateWithoutUserInput> | CachedEmailCreateWithoutUserInput[] | CachedEmailUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedEmailCreateOrConnectWithoutUserInput | CachedEmailCreateOrConnectWithoutUserInput[]
    createMany?: CachedEmailCreateManyUserInputEnvelope
    connect?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
  }

  export type CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<CachedCalendarEventCreateWithoutUserInput, CachedCalendarEventUncheckedCreateWithoutUserInput> | CachedCalendarEventCreateWithoutUserInput[] | CachedCalendarEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedCalendarEventCreateOrConnectWithoutUserInput | CachedCalendarEventCreateOrConnectWithoutUserInput[]
    createMany?: CachedCalendarEventCreateManyUserInputEnvelope
    connect?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
  }

  export type CachedContactUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<CachedContactCreateWithoutUserInput, CachedContactUncheckedCreateWithoutUserInput> | CachedContactCreateWithoutUserInput[] | CachedContactUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedContactCreateOrConnectWithoutUserInput | CachedContactCreateOrConnectWithoutUserInput[]
    createMany?: CachedContactCreateManyUserInputEnvelope
    connect?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type OrganizationUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<OrganizationCreateWithoutUsersInput, OrganizationUncheckedCreateWithoutUsersInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutUsersInput
    upsert?: OrganizationUpsertWithoutUsersInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutUsersInput, OrganizationUpdateWithoutUsersInput>, OrganizationUncheckedUpdateWithoutUsersInput>
  }

  export type MsConnectedAccountUpdateManyWithoutUserNestedInput = {
    create?: XOR<MsConnectedAccountCreateWithoutUserInput, MsConnectedAccountUncheckedCreateWithoutUserInput> | MsConnectedAccountCreateWithoutUserInput[] | MsConnectedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MsConnectedAccountCreateOrConnectWithoutUserInput | MsConnectedAccountCreateOrConnectWithoutUserInput[]
    upsert?: MsConnectedAccountUpsertWithWhereUniqueWithoutUserInput | MsConnectedAccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MsConnectedAccountCreateManyUserInputEnvelope
    set?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
    disconnect?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
    delete?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
    connect?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
    update?: MsConnectedAccountUpdateWithWhereUniqueWithoutUserInput | MsConnectedAccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MsConnectedAccountUpdateManyWithWhereWithoutUserInput | MsConnectedAccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MsConnectedAccountScalarWhereInput | MsConnectedAccountScalarWhereInput[]
  }

  export type MsalTokenCacheUpdateOneWithoutUserNestedInput = {
    create?: XOR<MsalTokenCacheCreateWithoutUserInput, MsalTokenCacheUncheckedCreateWithoutUserInput>
    connectOrCreate?: MsalTokenCacheCreateOrConnectWithoutUserInput
    upsert?: MsalTokenCacheUpsertWithoutUserInput
    disconnect?: MsalTokenCacheWhereInput | boolean
    delete?: MsalTokenCacheWhereInput | boolean
    connect?: MsalTokenCacheWhereUniqueInput
    update?: XOR<XOR<MsalTokenCacheUpdateToOneWithWhereWithoutUserInput, MsalTokenCacheUpdateWithoutUserInput>, MsalTokenCacheUncheckedUpdateWithoutUserInput>
  }

  export type EmailDeltaLinkUpdateManyWithoutUserNestedInput = {
    create?: XOR<EmailDeltaLinkCreateWithoutUserInput, EmailDeltaLinkUncheckedCreateWithoutUserInput> | EmailDeltaLinkCreateWithoutUserInput[] | EmailDeltaLinkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailDeltaLinkCreateOrConnectWithoutUserInput | EmailDeltaLinkCreateOrConnectWithoutUserInput[]
    upsert?: EmailDeltaLinkUpsertWithWhereUniqueWithoutUserInput | EmailDeltaLinkUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: EmailDeltaLinkCreateManyUserInputEnvelope
    set?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
    disconnect?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
    delete?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
    connect?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
    update?: EmailDeltaLinkUpdateWithWhereUniqueWithoutUserInput | EmailDeltaLinkUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: EmailDeltaLinkUpdateManyWithWhereWithoutUserInput | EmailDeltaLinkUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: EmailDeltaLinkScalarWhereInput | EmailDeltaLinkScalarWhereInput[]
  }

  export type WebhookSubscriptionUpdateManyWithoutUserNestedInput = {
    create?: XOR<WebhookSubscriptionCreateWithoutUserInput, WebhookSubscriptionUncheckedCreateWithoutUserInput> | WebhookSubscriptionCreateWithoutUserInput[] | WebhookSubscriptionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WebhookSubscriptionCreateOrConnectWithoutUserInput | WebhookSubscriptionCreateOrConnectWithoutUserInput[]
    upsert?: WebhookSubscriptionUpsertWithWhereUniqueWithoutUserInput | WebhookSubscriptionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WebhookSubscriptionCreateManyUserInputEnvelope
    set?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
    disconnect?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
    delete?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
    connect?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
    update?: WebhookSubscriptionUpdateWithWhereUniqueWithoutUserInput | WebhookSubscriptionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WebhookSubscriptionUpdateManyWithWhereWithoutUserInput | WebhookSubscriptionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WebhookSubscriptionScalarWhereInput | WebhookSubscriptionScalarWhereInput[]
  }

  export type DraftUpdateManyWithoutUserNestedInput = {
    create?: XOR<DraftCreateWithoutUserInput, DraftUncheckedCreateWithoutUserInput> | DraftCreateWithoutUserInput[] | DraftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DraftCreateOrConnectWithoutUserInput | DraftCreateOrConnectWithoutUserInput[]
    upsert?: DraftUpsertWithWhereUniqueWithoutUserInput | DraftUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DraftCreateManyUserInputEnvelope
    set?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
    disconnect?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
    delete?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
    connect?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
    update?: DraftUpdateWithWhereUniqueWithoutUserInput | DraftUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DraftUpdateManyWithWhereWithoutUserInput | DraftUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DraftScalarWhereInput | DraftScalarWhereInput[]
  }

  export type EmailRuleUpdateManyWithoutUserNestedInput = {
    create?: XOR<EmailRuleCreateWithoutUserInput, EmailRuleUncheckedCreateWithoutUserInput> | EmailRuleCreateWithoutUserInput[] | EmailRuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailRuleCreateOrConnectWithoutUserInput | EmailRuleCreateOrConnectWithoutUserInput[]
    upsert?: EmailRuleUpsertWithWhereUniqueWithoutUserInput | EmailRuleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: EmailRuleCreateManyUserInputEnvelope
    set?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
    disconnect?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
    delete?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
    connect?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
    update?: EmailRuleUpdateWithWhereUniqueWithoutUserInput | EmailRuleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: EmailRuleUpdateManyWithWhereWithoutUserInput | EmailRuleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: EmailRuleScalarWhereInput | EmailRuleScalarWhereInput[]
  }

  export type SignatureUpdateManyWithoutUserNestedInput = {
    create?: XOR<SignatureCreateWithoutUserInput, SignatureUncheckedCreateWithoutUserInput> | SignatureCreateWithoutUserInput[] | SignatureUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SignatureCreateOrConnectWithoutUserInput | SignatureCreateOrConnectWithoutUserInput[]
    upsert?: SignatureUpsertWithWhereUniqueWithoutUserInput | SignatureUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SignatureCreateManyUserInputEnvelope
    set?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
    disconnect?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
    delete?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
    connect?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
    update?: SignatureUpdateWithWhereUniqueWithoutUserInput | SignatureUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SignatureUpdateManyWithWhereWithoutUserInput | SignatureUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SignatureScalarWhereInput | SignatureScalarWhereInput[]
  }

  export type CachedFolderUpdateManyWithoutUserNestedInput = {
    create?: XOR<CachedFolderCreateWithoutUserInput, CachedFolderUncheckedCreateWithoutUserInput> | CachedFolderCreateWithoutUserInput[] | CachedFolderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedFolderCreateOrConnectWithoutUserInput | CachedFolderCreateOrConnectWithoutUserInput[]
    upsert?: CachedFolderUpsertWithWhereUniqueWithoutUserInput | CachedFolderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CachedFolderCreateManyUserInputEnvelope
    set?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
    disconnect?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
    delete?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
    connect?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
    update?: CachedFolderUpdateWithWhereUniqueWithoutUserInput | CachedFolderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CachedFolderUpdateManyWithWhereWithoutUserInput | CachedFolderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CachedFolderScalarWhereInput | CachedFolderScalarWhereInput[]
  }

  export type CachedEmailUpdateManyWithoutUserNestedInput = {
    create?: XOR<CachedEmailCreateWithoutUserInput, CachedEmailUncheckedCreateWithoutUserInput> | CachedEmailCreateWithoutUserInput[] | CachedEmailUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedEmailCreateOrConnectWithoutUserInput | CachedEmailCreateOrConnectWithoutUserInput[]
    upsert?: CachedEmailUpsertWithWhereUniqueWithoutUserInput | CachedEmailUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CachedEmailCreateManyUserInputEnvelope
    set?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
    disconnect?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
    delete?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
    connect?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
    update?: CachedEmailUpdateWithWhereUniqueWithoutUserInput | CachedEmailUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CachedEmailUpdateManyWithWhereWithoutUserInput | CachedEmailUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CachedEmailScalarWhereInput | CachedEmailScalarWhereInput[]
  }

  export type CachedCalendarEventUpdateManyWithoutUserNestedInput = {
    create?: XOR<CachedCalendarEventCreateWithoutUserInput, CachedCalendarEventUncheckedCreateWithoutUserInput> | CachedCalendarEventCreateWithoutUserInput[] | CachedCalendarEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedCalendarEventCreateOrConnectWithoutUserInput | CachedCalendarEventCreateOrConnectWithoutUserInput[]
    upsert?: CachedCalendarEventUpsertWithWhereUniqueWithoutUserInput | CachedCalendarEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CachedCalendarEventCreateManyUserInputEnvelope
    set?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
    disconnect?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
    delete?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
    connect?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
    update?: CachedCalendarEventUpdateWithWhereUniqueWithoutUserInput | CachedCalendarEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CachedCalendarEventUpdateManyWithWhereWithoutUserInput | CachedCalendarEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CachedCalendarEventScalarWhereInput | CachedCalendarEventScalarWhereInput[]
  }

  export type CachedContactUpdateManyWithoutUserNestedInput = {
    create?: XOR<CachedContactCreateWithoutUserInput, CachedContactUncheckedCreateWithoutUserInput> | CachedContactCreateWithoutUserInput[] | CachedContactUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedContactCreateOrConnectWithoutUserInput | CachedContactCreateOrConnectWithoutUserInput[]
    upsert?: CachedContactUpsertWithWhereUniqueWithoutUserInput | CachedContactUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CachedContactCreateManyUserInputEnvelope
    set?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
    disconnect?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
    delete?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
    connect?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
    update?: CachedContactUpdateWithWhereUniqueWithoutUserInput | CachedContactUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CachedContactUpdateManyWithWhereWithoutUserInput | CachedContactUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CachedContactScalarWhereInput | CachedContactScalarWhereInput[]
  }

  export type MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MsConnectedAccountCreateWithoutUserInput, MsConnectedAccountUncheckedCreateWithoutUserInput> | MsConnectedAccountCreateWithoutUserInput[] | MsConnectedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MsConnectedAccountCreateOrConnectWithoutUserInput | MsConnectedAccountCreateOrConnectWithoutUserInput[]
    upsert?: MsConnectedAccountUpsertWithWhereUniqueWithoutUserInput | MsConnectedAccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MsConnectedAccountCreateManyUserInputEnvelope
    set?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
    disconnect?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
    delete?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
    connect?: MsConnectedAccountWhereUniqueInput | MsConnectedAccountWhereUniqueInput[]
    update?: MsConnectedAccountUpdateWithWhereUniqueWithoutUserInput | MsConnectedAccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MsConnectedAccountUpdateManyWithWhereWithoutUserInput | MsConnectedAccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MsConnectedAccountScalarWhereInput | MsConnectedAccountScalarWhereInput[]
  }

  export type MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<MsalTokenCacheCreateWithoutUserInput, MsalTokenCacheUncheckedCreateWithoutUserInput>
    connectOrCreate?: MsalTokenCacheCreateOrConnectWithoutUserInput
    upsert?: MsalTokenCacheUpsertWithoutUserInput
    disconnect?: MsalTokenCacheWhereInput | boolean
    delete?: MsalTokenCacheWhereInput | boolean
    connect?: MsalTokenCacheWhereUniqueInput
    update?: XOR<XOR<MsalTokenCacheUpdateToOneWithWhereWithoutUserInput, MsalTokenCacheUpdateWithoutUserInput>, MsalTokenCacheUncheckedUpdateWithoutUserInput>
  }

  export type EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<EmailDeltaLinkCreateWithoutUserInput, EmailDeltaLinkUncheckedCreateWithoutUserInput> | EmailDeltaLinkCreateWithoutUserInput[] | EmailDeltaLinkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailDeltaLinkCreateOrConnectWithoutUserInput | EmailDeltaLinkCreateOrConnectWithoutUserInput[]
    upsert?: EmailDeltaLinkUpsertWithWhereUniqueWithoutUserInput | EmailDeltaLinkUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: EmailDeltaLinkCreateManyUserInputEnvelope
    set?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
    disconnect?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
    delete?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
    connect?: EmailDeltaLinkWhereUniqueInput | EmailDeltaLinkWhereUniqueInput[]
    update?: EmailDeltaLinkUpdateWithWhereUniqueWithoutUserInput | EmailDeltaLinkUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: EmailDeltaLinkUpdateManyWithWhereWithoutUserInput | EmailDeltaLinkUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: EmailDeltaLinkScalarWhereInput | EmailDeltaLinkScalarWhereInput[]
  }

  export type WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<WebhookSubscriptionCreateWithoutUserInput, WebhookSubscriptionUncheckedCreateWithoutUserInput> | WebhookSubscriptionCreateWithoutUserInput[] | WebhookSubscriptionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WebhookSubscriptionCreateOrConnectWithoutUserInput | WebhookSubscriptionCreateOrConnectWithoutUserInput[]
    upsert?: WebhookSubscriptionUpsertWithWhereUniqueWithoutUserInput | WebhookSubscriptionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WebhookSubscriptionCreateManyUserInputEnvelope
    set?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
    disconnect?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
    delete?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
    connect?: WebhookSubscriptionWhereUniqueInput | WebhookSubscriptionWhereUniqueInput[]
    update?: WebhookSubscriptionUpdateWithWhereUniqueWithoutUserInput | WebhookSubscriptionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WebhookSubscriptionUpdateManyWithWhereWithoutUserInput | WebhookSubscriptionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WebhookSubscriptionScalarWhereInput | WebhookSubscriptionScalarWhereInput[]
  }

  export type DraftUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<DraftCreateWithoutUserInput, DraftUncheckedCreateWithoutUserInput> | DraftCreateWithoutUserInput[] | DraftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DraftCreateOrConnectWithoutUserInput | DraftCreateOrConnectWithoutUserInput[]
    upsert?: DraftUpsertWithWhereUniqueWithoutUserInput | DraftUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DraftCreateManyUserInputEnvelope
    set?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
    disconnect?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
    delete?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
    connect?: DraftWhereUniqueInput | DraftWhereUniqueInput[]
    update?: DraftUpdateWithWhereUniqueWithoutUserInput | DraftUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DraftUpdateManyWithWhereWithoutUserInput | DraftUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DraftScalarWhereInput | DraftScalarWhereInput[]
  }

  export type EmailRuleUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<EmailRuleCreateWithoutUserInput, EmailRuleUncheckedCreateWithoutUserInput> | EmailRuleCreateWithoutUserInput[] | EmailRuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailRuleCreateOrConnectWithoutUserInput | EmailRuleCreateOrConnectWithoutUserInput[]
    upsert?: EmailRuleUpsertWithWhereUniqueWithoutUserInput | EmailRuleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: EmailRuleCreateManyUserInputEnvelope
    set?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
    disconnect?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
    delete?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
    connect?: EmailRuleWhereUniqueInput | EmailRuleWhereUniqueInput[]
    update?: EmailRuleUpdateWithWhereUniqueWithoutUserInput | EmailRuleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: EmailRuleUpdateManyWithWhereWithoutUserInput | EmailRuleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: EmailRuleScalarWhereInput | EmailRuleScalarWhereInput[]
  }

  export type SignatureUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SignatureCreateWithoutUserInput, SignatureUncheckedCreateWithoutUserInput> | SignatureCreateWithoutUserInput[] | SignatureUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SignatureCreateOrConnectWithoutUserInput | SignatureCreateOrConnectWithoutUserInput[]
    upsert?: SignatureUpsertWithWhereUniqueWithoutUserInput | SignatureUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SignatureCreateManyUserInputEnvelope
    set?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
    disconnect?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
    delete?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
    connect?: SignatureWhereUniqueInput | SignatureWhereUniqueInput[]
    update?: SignatureUpdateWithWhereUniqueWithoutUserInput | SignatureUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SignatureUpdateManyWithWhereWithoutUserInput | SignatureUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SignatureScalarWhereInput | SignatureScalarWhereInput[]
  }

  export type CachedFolderUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<CachedFolderCreateWithoutUserInput, CachedFolderUncheckedCreateWithoutUserInput> | CachedFolderCreateWithoutUserInput[] | CachedFolderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedFolderCreateOrConnectWithoutUserInput | CachedFolderCreateOrConnectWithoutUserInput[]
    upsert?: CachedFolderUpsertWithWhereUniqueWithoutUserInput | CachedFolderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CachedFolderCreateManyUserInputEnvelope
    set?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
    disconnect?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
    delete?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
    connect?: CachedFolderWhereUniqueInput | CachedFolderWhereUniqueInput[]
    update?: CachedFolderUpdateWithWhereUniqueWithoutUserInput | CachedFolderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CachedFolderUpdateManyWithWhereWithoutUserInput | CachedFolderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CachedFolderScalarWhereInput | CachedFolderScalarWhereInput[]
  }

  export type CachedEmailUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<CachedEmailCreateWithoutUserInput, CachedEmailUncheckedCreateWithoutUserInput> | CachedEmailCreateWithoutUserInput[] | CachedEmailUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedEmailCreateOrConnectWithoutUserInput | CachedEmailCreateOrConnectWithoutUserInput[]
    upsert?: CachedEmailUpsertWithWhereUniqueWithoutUserInput | CachedEmailUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CachedEmailCreateManyUserInputEnvelope
    set?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
    disconnect?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
    delete?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
    connect?: CachedEmailWhereUniqueInput | CachedEmailWhereUniqueInput[]
    update?: CachedEmailUpdateWithWhereUniqueWithoutUserInput | CachedEmailUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CachedEmailUpdateManyWithWhereWithoutUserInput | CachedEmailUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CachedEmailScalarWhereInput | CachedEmailScalarWhereInput[]
  }

  export type CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<CachedCalendarEventCreateWithoutUserInput, CachedCalendarEventUncheckedCreateWithoutUserInput> | CachedCalendarEventCreateWithoutUserInput[] | CachedCalendarEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedCalendarEventCreateOrConnectWithoutUserInput | CachedCalendarEventCreateOrConnectWithoutUserInput[]
    upsert?: CachedCalendarEventUpsertWithWhereUniqueWithoutUserInput | CachedCalendarEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CachedCalendarEventCreateManyUserInputEnvelope
    set?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
    disconnect?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
    delete?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
    connect?: CachedCalendarEventWhereUniqueInput | CachedCalendarEventWhereUniqueInput[]
    update?: CachedCalendarEventUpdateWithWhereUniqueWithoutUserInput | CachedCalendarEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CachedCalendarEventUpdateManyWithWhereWithoutUserInput | CachedCalendarEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CachedCalendarEventScalarWhereInput | CachedCalendarEventScalarWhereInput[]
  }

  export type CachedContactUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<CachedContactCreateWithoutUserInput, CachedContactUncheckedCreateWithoutUserInput> | CachedContactCreateWithoutUserInput[] | CachedContactUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CachedContactCreateOrConnectWithoutUserInput | CachedContactCreateOrConnectWithoutUserInput[]
    upsert?: CachedContactUpsertWithWhereUniqueWithoutUserInput | CachedContactUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CachedContactCreateManyUserInputEnvelope
    set?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
    disconnect?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
    delete?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
    connect?: CachedContactWhereUniqueInput | CachedContactWhereUniqueInput[]
    update?: CachedContactUpdateWithWhereUniqueWithoutUserInput | CachedContactUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CachedContactUpdateManyWithWhereWithoutUserInput | CachedContactUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CachedContactScalarWhereInput | CachedContactScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutMsAccountsInput = {
    create?: XOR<UserCreateWithoutMsAccountsInput, UserUncheckedCreateWithoutMsAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMsAccountsInput
    connect?: UserWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutMsAccountsNestedInput = {
    create?: XOR<UserCreateWithoutMsAccountsInput, UserUncheckedCreateWithoutMsAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMsAccountsInput
    upsert?: UserUpsertWithoutMsAccountsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMsAccountsInput, UserUpdateWithoutMsAccountsInput>, UserUncheckedUpdateWithoutMsAccountsInput>
  }

  export type UserCreateNestedOneWithoutMsalCacheInput = {
    create?: XOR<UserCreateWithoutMsalCacheInput, UserUncheckedCreateWithoutMsalCacheInput>
    connectOrCreate?: UserCreateOrConnectWithoutMsalCacheInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutMsalCacheNestedInput = {
    create?: XOR<UserCreateWithoutMsalCacheInput, UserUncheckedCreateWithoutMsalCacheInput>
    connectOrCreate?: UserCreateOrConnectWithoutMsalCacheInput
    upsert?: UserUpsertWithoutMsalCacheInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMsalCacheInput, UserUpdateWithoutMsalCacheInput>, UserUncheckedUpdateWithoutMsalCacheInput>
  }

  export type UserCreateNestedOneWithoutDeltaLinksInput = {
    create?: XOR<UserCreateWithoutDeltaLinksInput, UserUncheckedCreateWithoutDeltaLinksInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeltaLinksInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutDeltaLinksNestedInput = {
    create?: XOR<UserCreateWithoutDeltaLinksInput, UserUncheckedCreateWithoutDeltaLinksInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeltaLinksInput
    upsert?: UserUpsertWithoutDeltaLinksInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDeltaLinksInput, UserUpdateWithoutDeltaLinksInput>, UserUncheckedUpdateWithoutDeltaLinksInput>
  }

  export type UserCreateNestedOneWithoutWebhookSubsInput = {
    create?: XOR<UserCreateWithoutWebhookSubsInput, UserUncheckedCreateWithoutWebhookSubsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWebhookSubsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutWebhookSubsNestedInput = {
    create?: XOR<UserCreateWithoutWebhookSubsInput, UserUncheckedCreateWithoutWebhookSubsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWebhookSubsInput
    upsert?: UserUpsertWithoutWebhookSubsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutWebhookSubsInput, UserUpdateWithoutWebhookSubsInput>, UserUncheckedUpdateWithoutWebhookSubsInput>
  }

  export type UserCreateNestedOneWithoutDraftsInput = {
    create?: XOR<UserCreateWithoutDraftsInput, UserUncheckedCreateWithoutDraftsInput>
    connectOrCreate?: UserCreateOrConnectWithoutDraftsInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutDraftsNestedInput = {
    create?: XOR<UserCreateWithoutDraftsInput, UserUncheckedCreateWithoutDraftsInput>
    connectOrCreate?: UserCreateOrConnectWithoutDraftsInput
    upsert?: UserUpsertWithoutDraftsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDraftsInput, UserUpdateWithoutDraftsInput>, UserUncheckedUpdateWithoutDraftsInput>
  }

  export type UserCreateNestedOneWithoutSignaturesInput = {
    create?: XOR<UserCreateWithoutSignaturesInput, UserUncheckedCreateWithoutSignaturesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSignaturesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSignaturesNestedInput = {
    create?: XOR<UserCreateWithoutSignaturesInput, UserUncheckedCreateWithoutSignaturesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSignaturesInput
    upsert?: UserUpsertWithoutSignaturesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSignaturesInput, UserUpdateWithoutSignaturesInput>, UserUncheckedUpdateWithoutSignaturesInput>
  }

  export type UserCreateNestedOneWithoutCachedFoldersInput = {
    create?: XOR<UserCreateWithoutCachedFoldersInput, UserUncheckedCreateWithoutCachedFoldersInput>
    connectOrCreate?: UserCreateOrConnectWithoutCachedFoldersInput
    connect?: UserWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutCachedFoldersNestedInput = {
    create?: XOR<UserCreateWithoutCachedFoldersInput, UserUncheckedCreateWithoutCachedFoldersInput>
    connectOrCreate?: UserCreateOrConnectWithoutCachedFoldersInput
    upsert?: UserUpsertWithoutCachedFoldersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCachedFoldersInput, UserUpdateWithoutCachedFoldersInput>, UserUncheckedUpdateWithoutCachedFoldersInput>
  }

  export type UserCreateNestedOneWithoutCachedEmailsInput = {
    create?: XOR<UserCreateWithoutCachedEmailsInput, UserUncheckedCreateWithoutCachedEmailsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCachedEmailsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutCachedEmailsNestedInput = {
    create?: XOR<UserCreateWithoutCachedEmailsInput, UserUncheckedCreateWithoutCachedEmailsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCachedEmailsInput
    upsert?: UserUpsertWithoutCachedEmailsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCachedEmailsInput, UserUpdateWithoutCachedEmailsInput>, UserUncheckedUpdateWithoutCachedEmailsInput>
  }

  export type UserCreateNestedOneWithoutCachedCalEventsInput = {
    create?: XOR<UserCreateWithoutCachedCalEventsInput, UserUncheckedCreateWithoutCachedCalEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCachedCalEventsInput
    connect?: UserWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutCachedCalEventsNestedInput = {
    create?: XOR<UserCreateWithoutCachedCalEventsInput, UserUncheckedCreateWithoutCachedCalEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCachedCalEventsInput
    upsert?: UserUpsertWithoutCachedCalEventsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCachedCalEventsInput, UserUpdateWithoutCachedCalEventsInput>, UserUncheckedUpdateWithoutCachedCalEventsInput>
  }

  export type UserCreateNestedOneWithoutCachedContactsInput = {
    create?: XOR<UserCreateWithoutCachedContactsInput, UserUncheckedCreateWithoutCachedContactsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCachedContactsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutCachedContactsNestedInput = {
    create?: XOR<UserCreateWithoutCachedContactsInput, UserUncheckedCreateWithoutCachedContactsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCachedContactsInput
    upsert?: UserUpsertWithoutCachedContactsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCachedContactsInput, UserUpdateWithoutCachedContactsInput>, UserUncheckedUpdateWithoutCachedContactsInput>
  }

  export type UserCreateNestedOneWithoutEmailRulesInput = {
    create?: XOR<UserCreateWithoutEmailRulesInput, UserUncheckedCreateWithoutEmailRulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmailRulesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutEmailRulesNestedInput = {
    create?: XOR<UserCreateWithoutEmailRulesInput, UserUncheckedCreateWithoutEmailRulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmailRulesInput
    upsert?: UserUpsertWithoutEmailRulesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutEmailRulesInput, UserUpdateWithoutEmailRulesInput>, UserUncheckedUpdateWithoutEmailRulesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type UserCreateWithoutOrgInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOrgInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOrgInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOrgInput, UserUncheckedCreateWithoutOrgInput>
  }

  export type UserCreateManyOrgInputEnvelope = {
    data: UserCreateManyOrgInput | UserCreateManyOrgInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutOrgInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutOrgInput, UserUncheckedUpdateWithoutOrgInput>
    create: XOR<UserCreateWithoutOrgInput, UserUncheckedCreateWithoutOrgInput>
  }

  export type UserUpdateWithWhereUniqueWithoutOrgInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutOrgInput, UserUncheckedUpdateWithoutOrgInput>
  }

  export type UserUpdateManyWithWhereWithoutOrgInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutOrgInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    avatarUrl?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    orgId?: StringFilter<"User"> | string
  }

  export type OrganizationCreateWithoutUsersInput = {
    id?: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationCreateOrConnectWithoutUsersInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutUsersInput, OrganizationUncheckedCreateWithoutUsersInput>
  }

  export type MsConnectedAccountCreateWithoutUserInput = {
    id?: string
    homeAccountId: string
    msEmail: string
    displayName?: string | null
    tenantId?: string | null
    isDefault?: boolean
    connectedAt?: Date | string
    updatedAt?: Date | string
  }

  export type MsConnectedAccountUncheckedCreateWithoutUserInput = {
    id?: string
    homeAccountId: string
    msEmail: string
    displayName?: string | null
    tenantId?: string | null
    isDefault?: boolean
    connectedAt?: Date | string
    updatedAt?: Date | string
  }

  export type MsConnectedAccountCreateOrConnectWithoutUserInput = {
    where: MsConnectedAccountWhereUniqueInput
    create: XOR<MsConnectedAccountCreateWithoutUserInput, MsConnectedAccountUncheckedCreateWithoutUserInput>
  }

  export type MsConnectedAccountCreateManyUserInputEnvelope = {
    data: MsConnectedAccountCreateManyUserInput | MsConnectedAccountCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type MsalTokenCacheCreateWithoutUserInput = {
    id?: string
    cacheJson: string
    updatedAt?: Date | string
  }

  export type MsalTokenCacheUncheckedCreateWithoutUserInput = {
    id?: string
    cacheJson: string
    updatedAt?: Date | string
  }

  export type MsalTokenCacheCreateOrConnectWithoutUserInput = {
    where: MsalTokenCacheWhereUniqueInput
    create: XOR<MsalTokenCacheCreateWithoutUserInput, MsalTokenCacheUncheckedCreateWithoutUserInput>
  }

  export type EmailDeltaLinkCreateWithoutUserInput = {
    id?: string
    homeAccountId: string
    folderId: string
    deltaToken: string
    updatedAt?: Date | string
  }

  export type EmailDeltaLinkUncheckedCreateWithoutUserInput = {
    id?: string
    homeAccountId: string
    folderId: string
    deltaToken: string
    updatedAt?: Date | string
  }

  export type EmailDeltaLinkCreateOrConnectWithoutUserInput = {
    where: EmailDeltaLinkWhereUniqueInput
    create: XOR<EmailDeltaLinkCreateWithoutUserInput, EmailDeltaLinkUncheckedCreateWithoutUserInput>
  }

  export type EmailDeltaLinkCreateManyUserInputEnvelope = {
    data: EmailDeltaLinkCreateManyUserInput | EmailDeltaLinkCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type WebhookSubscriptionCreateWithoutUserInput = {
    id?: string
    homeAccountId: string
    subscriptionId: string
    resource: string
    expiresAt: Date | string
    clientState: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WebhookSubscriptionUncheckedCreateWithoutUserInput = {
    id?: string
    homeAccountId: string
    subscriptionId: string
    resource: string
    expiresAt: Date | string
    clientState: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WebhookSubscriptionCreateOrConnectWithoutUserInput = {
    where: WebhookSubscriptionWhereUniqueInput
    create: XOR<WebhookSubscriptionCreateWithoutUserInput, WebhookSubscriptionUncheckedCreateWithoutUserInput>
  }

  export type WebhookSubscriptionCreateManyUserInputEnvelope = {
    data: WebhookSubscriptionCreateManyUserInput | WebhookSubscriptionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type DraftCreateWithoutUserInput = {
    id?: string
    homeAccountId?: string | null
    graphDraftId?: string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: string | null
    bodyHtml?: string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: string
    requestReadReceipt?: boolean
    draftType?: string
    inReplyToMessageId?: string | null
    forwardedMessageId?: string | null
    scheduledAt?: Date | string | null
    scheduledSent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DraftUncheckedCreateWithoutUserInput = {
    id?: string
    homeAccountId?: string | null
    graphDraftId?: string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: string | null
    bodyHtml?: string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: string
    requestReadReceipt?: boolean
    draftType?: string
    inReplyToMessageId?: string | null
    forwardedMessageId?: string | null
    scheduledAt?: Date | string | null
    scheduledSent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DraftCreateOrConnectWithoutUserInput = {
    where: DraftWhereUniqueInput
    create: XOR<DraftCreateWithoutUserInput, DraftUncheckedCreateWithoutUserInput>
  }

  export type DraftCreateManyUserInputEnvelope = {
    data: DraftCreateManyUserInput | DraftCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type EmailRuleCreateWithoutUserInput = {
    id?: string
    name: string
    priority: number
    active?: boolean
    conditions: JsonNullValueInput | InputJsonValue
    actions: JsonNullValueInput | InputJsonValue
    emailCount?: number
    stopProcessing?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmailRuleUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    priority: number
    active?: boolean
    conditions: JsonNullValueInput | InputJsonValue
    actions: JsonNullValueInput | InputJsonValue
    emailCount?: number
    stopProcessing?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmailRuleCreateOrConnectWithoutUserInput = {
    where: EmailRuleWhereUniqueInput
    create: XOR<EmailRuleCreateWithoutUserInput, EmailRuleUncheckedCreateWithoutUserInput>
  }

  export type EmailRuleCreateManyUserInputEnvelope = {
    data: EmailRuleCreateManyUserInput | EmailRuleCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SignatureCreateWithoutUserInput = {
    id?: string
    name: string
    html?: string
    title?: string | null
    company?: string | null
    phone?: string | null
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: string
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignatureUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    html?: string
    title?: string | null
    company?: string | null
    phone?: string | null
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: string
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignatureCreateOrConnectWithoutUserInput = {
    where: SignatureWhereUniqueInput
    create: XOR<SignatureCreateWithoutUserInput, SignatureUncheckedCreateWithoutUserInput>
  }

  export type SignatureCreateManyUserInputEnvelope = {
    data: SignatureCreateManyUserInput | SignatureCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type CachedFolderCreateWithoutUserInput = {
    id: string
    homeAccountId: string
    displayName: string
    parentFolderId?: string | null
    unreadCount?: number
    totalCount?: number
    wellKnownName?: string | null
    syncedAt?: Date | string
  }

  export type CachedFolderUncheckedCreateWithoutUserInput = {
    id: string
    homeAccountId: string
    displayName: string
    parentFolderId?: string | null
    unreadCount?: number
    totalCount?: number
    wellKnownName?: string | null
    syncedAt?: Date | string
  }

  export type CachedFolderCreateOrConnectWithoutUserInput = {
    where: CachedFolderWhereUniqueInput
    create: XOR<CachedFolderCreateWithoutUserInput, CachedFolderUncheckedCreateWithoutUserInput>
  }

  export type CachedFolderCreateManyUserInputEnvelope = {
    data: CachedFolderCreateManyUserInput | CachedFolderCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type CachedEmailCreateWithoutUserInput = {
    id: string
    homeAccountId: string
    folderId: string
    subject?: string
    bodyPreview?: string
    fromName?: string
    fromAddress?: string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime: Date | string
    sentDateTime?: Date | string | null
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: Date | string
  }

  export type CachedEmailUncheckedCreateWithoutUserInput = {
    id: string
    homeAccountId: string
    folderId: string
    subject?: string
    bodyPreview?: string
    fromName?: string
    fromAddress?: string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime: Date | string
    sentDateTime?: Date | string | null
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: Date | string
  }

  export type CachedEmailCreateOrConnectWithoutUserInput = {
    where: CachedEmailWhereUniqueInput
    create: XOR<CachedEmailCreateWithoutUserInput, CachedEmailUncheckedCreateWithoutUserInput>
  }

  export type CachedEmailCreateManyUserInputEnvelope = {
    data: CachedEmailCreateManyUserInput | CachedEmailCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type CachedCalendarEventCreateWithoutUserInput = {
    id: string
    homeAccountId: string
    subject?: string
    bodyPreview?: string
    startDateTime: Date | string
    endDateTime: Date | string
    isAllDay?: boolean
    location?: string | null
    organizerName?: string | null
    organizerEmail?: string | null
    responseStatus?: string
    onlineMeetingUrl?: string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: boolean
    reminderMinutes?: number | null
    showAs?: string
    recurrence?: string | null
    syncedAt?: Date | string
  }

  export type CachedCalendarEventUncheckedCreateWithoutUserInput = {
    id: string
    homeAccountId: string
    subject?: string
    bodyPreview?: string
    startDateTime: Date | string
    endDateTime: Date | string
    isAllDay?: boolean
    location?: string | null
    organizerName?: string | null
    organizerEmail?: string | null
    responseStatus?: string
    onlineMeetingUrl?: string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: boolean
    reminderMinutes?: number | null
    showAs?: string
    recurrence?: string | null
    syncedAt?: Date | string
  }

  export type CachedCalendarEventCreateOrConnectWithoutUserInput = {
    where: CachedCalendarEventWhereUniqueInput
    create: XOR<CachedCalendarEventCreateWithoutUserInput, CachedCalendarEventUncheckedCreateWithoutUserInput>
  }

  export type CachedCalendarEventCreateManyUserInputEnvelope = {
    data: CachedCalendarEventCreateManyUserInput | CachedCalendarEventCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type CachedContactCreateWithoutUserInput = {
    id: string
    homeAccountId: string
    displayName?: string
    emailAddress?: string
    phone?: string
    jobTitle?: string
    company?: string
    syncedAt?: Date | string
  }

  export type CachedContactUncheckedCreateWithoutUserInput = {
    id: string
    homeAccountId: string
    displayName?: string
    emailAddress?: string
    phone?: string
    jobTitle?: string
    company?: string
    syncedAt?: Date | string
  }

  export type CachedContactCreateOrConnectWithoutUserInput = {
    where: CachedContactWhereUniqueInput
    create: XOR<CachedContactCreateWithoutUserInput, CachedContactUncheckedCreateWithoutUserInput>
  }

  export type CachedContactCreateManyUserInputEnvelope = {
    data: CachedContactCreateManyUserInput | CachedContactCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationUpsertWithoutUsersInput = {
    update: XOR<OrganizationUpdateWithoutUsersInput, OrganizationUncheckedUpdateWithoutUsersInput>
    create: XOR<OrganizationCreateWithoutUsersInput, OrganizationUncheckedCreateWithoutUsersInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutUsersInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutUsersInput, OrganizationUncheckedUpdateWithoutUsersInput>
  }

  export type OrganizationUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsConnectedAccountUpsertWithWhereUniqueWithoutUserInput = {
    where: MsConnectedAccountWhereUniqueInput
    update: XOR<MsConnectedAccountUpdateWithoutUserInput, MsConnectedAccountUncheckedUpdateWithoutUserInput>
    create: XOR<MsConnectedAccountCreateWithoutUserInput, MsConnectedAccountUncheckedCreateWithoutUserInput>
  }

  export type MsConnectedAccountUpdateWithWhereUniqueWithoutUserInput = {
    where: MsConnectedAccountWhereUniqueInput
    data: XOR<MsConnectedAccountUpdateWithoutUserInput, MsConnectedAccountUncheckedUpdateWithoutUserInput>
  }

  export type MsConnectedAccountUpdateManyWithWhereWithoutUserInput = {
    where: MsConnectedAccountScalarWhereInput
    data: XOR<MsConnectedAccountUpdateManyMutationInput, MsConnectedAccountUncheckedUpdateManyWithoutUserInput>
  }

  export type MsConnectedAccountScalarWhereInput = {
    AND?: MsConnectedAccountScalarWhereInput | MsConnectedAccountScalarWhereInput[]
    OR?: MsConnectedAccountScalarWhereInput[]
    NOT?: MsConnectedAccountScalarWhereInput | MsConnectedAccountScalarWhereInput[]
    id?: StringFilter<"MsConnectedAccount"> | string
    userId?: StringFilter<"MsConnectedAccount"> | string
    homeAccountId?: StringFilter<"MsConnectedAccount"> | string
    msEmail?: StringFilter<"MsConnectedAccount"> | string
    displayName?: StringNullableFilter<"MsConnectedAccount"> | string | null
    tenantId?: StringNullableFilter<"MsConnectedAccount"> | string | null
    isDefault?: BoolFilter<"MsConnectedAccount"> | boolean
    connectedAt?: DateTimeFilter<"MsConnectedAccount"> | Date | string
    updatedAt?: DateTimeFilter<"MsConnectedAccount"> | Date | string
  }

  export type MsalTokenCacheUpsertWithoutUserInput = {
    update: XOR<MsalTokenCacheUpdateWithoutUserInput, MsalTokenCacheUncheckedUpdateWithoutUserInput>
    create: XOR<MsalTokenCacheCreateWithoutUserInput, MsalTokenCacheUncheckedCreateWithoutUserInput>
    where?: MsalTokenCacheWhereInput
  }

  export type MsalTokenCacheUpdateToOneWithWhereWithoutUserInput = {
    where?: MsalTokenCacheWhereInput
    data: XOR<MsalTokenCacheUpdateWithoutUserInput, MsalTokenCacheUncheckedUpdateWithoutUserInput>
  }

  export type MsalTokenCacheUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    cacheJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsalTokenCacheUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    cacheJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailDeltaLinkUpsertWithWhereUniqueWithoutUserInput = {
    where: EmailDeltaLinkWhereUniqueInput
    update: XOR<EmailDeltaLinkUpdateWithoutUserInput, EmailDeltaLinkUncheckedUpdateWithoutUserInput>
    create: XOR<EmailDeltaLinkCreateWithoutUserInput, EmailDeltaLinkUncheckedCreateWithoutUserInput>
  }

  export type EmailDeltaLinkUpdateWithWhereUniqueWithoutUserInput = {
    where: EmailDeltaLinkWhereUniqueInput
    data: XOR<EmailDeltaLinkUpdateWithoutUserInput, EmailDeltaLinkUncheckedUpdateWithoutUserInput>
  }

  export type EmailDeltaLinkUpdateManyWithWhereWithoutUserInput = {
    where: EmailDeltaLinkScalarWhereInput
    data: XOR<EmailDeltaLinkUpdateManyMutationInput, EmailDeltaLinkUncheckedUpdateManyWithoutUserInput>
  }

  export type EmailDeltaLinkScalarWhereInput = {
    AND?: EmailDeltaLinkScalarWhereInput | EmailDeltaLinkScalarWhereInput[]
    OR?: EmailDeltaLinkScalarWhereInput[]
    NOT?: EmailDeltaLinkScalarWhereInput | EmailDeltaLinkScalarWhereInput[]
    id?: StringFilter<"EmailDeltaLink"> | string
    userId?: StringFilter<"EmailDeltaLink"> | string
    homeAccountId?: StringFilter<"EmailDeltaLink"> | string
    folderId?: StringFilter<"EmailDeltaLink"> | string
    deltaToken?: StringFilter<"EmailDeltaLink"> | string
    updatedAt?: DateTimeFilter<"EmailDeltaLink"> | Date | string
  }

  export type WebhookSubscriptionUpsertWithWhereUniqueWithoutUserInput = {
    where: WebhookSubscriptionWhereUniqueInput
    update: XOR<WebhookSubscriptionUpdateWithoutUserInput, WebhookSubscriptionUncheckedUpdateWithoutUserInput>
    create: XOR<WebhookSubscriptionCreateWithoutUserInput, WebhookSubscriptionUncheckedCreateWithoutUserInput>
  }

  export type WebhookSubscriptionUpdateWithWhereUniqueWithoutUserInput = {
    where: WebhookSubscriptionWhereUniqueInput
    data: XOR<WebhookSubscriptionUpdateWithoutUserInput, WebhookSubscriptionUncheckedUpdateWithoutUserInput>
  }

  export type WebhookSubscriptionUpdateManyWithWhereWithoutUserInput = {
    where: WebhookSubscriptionScalarWhereInput
    data: XOR<WebhookSubscriptionUpdateManyMutationInput, WebhookSubscriptionUncheckedUpdateManyWithoutUserInput>
  }

  export type WebhookSubscriptionScalarWhereInput = {
    AND?: WebhookSubscriptionScalarWhereInput | WebhookSubscriptionScalarWhereInput[]
    OR?: WebhookSubscriptionScalarWhereInput[]
    NOT?: WebhookSubscriptionScalarWhereInput | WebhookSubscriptionScalarWhereInput[]
    id?: StringFilter<"WebhookSubscription"> | string
    userId?: StringFilter<"WebhookSubscription"> | string
    homeAccountId?: StringFilter<"WebhookSubscription"> | string
    subscriptionId?: StringFilter<"WebhookSubscription"> | string
    resource?: StringFilter<"WebhookSubscription"> | string
    expiresAt?: DateTimeFilter<"WebhookSubscription"> | Date | string
    clientState?: StringFilter<"WebhookSubscription"> | string
    createdAt?: DateTimeFilter<"WebhookSubscription"> | Date | string
    updatedAt?: DateTimeFilter<"WebhookSubscription"> | Date | string
  }

  export type DraftUpsertWithWhereUniqueWithoutUserInput = {
    where: DraftWhereUniqueInput
    update: XOR<DraftUpdateWithoutUserInput, DraftUncheckedUpdateWithoutUserInput>
    create: XOR<DraftCreateWithoutUserInput, DraftUncheckedCreateWithoutUserInput>
  }

  export type DraftUpdateWithWhereUniqueWithoutUserInput = {
    where: DraftWhereUniqueInput
    data: XOR<DraftUpdateWithoutUserInput, DraftUncheckedUpdateWithoutUserInput>
  }

  export type DraftUpdateManyWithWhereWithoutUserInput = {
    where: DraftScalarWhereInput
    data: XOR<DraftUpdateManyMutationInput, DraftUncheckedUpdateManyWithoutUserInput>
  }

  export type DraftScalarWhereInput = {
    AND?: DraftScalarWhereInput | DraftScalarWhereInput[]
    OR?: DraftScalarWhereInput[]
    NOT?: DraftScalarWhereInput | DraftScalarWhereInput[]
    id?: StringFilter<"Draft"> | string
    userId?: StringFilter<"Draft"> | string
    homeAccountId?: StringNullableFilter<"Draft"> | string | null
    graphDraftId?: StringNullableFilter<"Draft"> | string | null
    toRecipients?: JsonFilter<"Draft">
    ccRecipients?: JsonFilter<"Draft">
    bccRecipients?: JsonFilter<"Draft">
    subject?: StringNullableFilter<"Draft"> | string | null
    bodyHtml?: StringNullableFilter<"Draft"> | string | null
    attachments?: JsonFilter<"Draft">
    importance?: StringFilter<"Draft"> | string
    requestReadReceipt?: BoolFilter<"Draft"> | boolean
    draftType?: StringFilter<"Draft"> | string
    inReplyToMessageId?: StringNullableFilter<"Draft"> | string | null
    forwardedMessageId?: StringNullableFilter<"Draft"> | string | null
    scheduledAt?: DateTimeNullableFilter<"Draft"> | Date | string | null
    scheduledSent?: BoolFilter<"Draft"> | boolean
    createdAt?: DateTimeFilter<"Draft"> | Date | string
    updatedAt?: DateTimeFilter<"Draft"> | Date | string
  }

  export type EmailRuleUpsertWithWhereUniqueWithoutUserInput = {
    where: EmailRuleWhereUniqueInput
    update: XOR<EmailRuleUpdateWithoutUserInput, EmailRuleUncheckedUpdateWithoutUserInput>
    create: XOR<EmailRuleCreateWithoutUserInput, EmailRuleUncheckedCreateWithoutUserInput>
  }

  export type EmailRuleUpdateWithWhereUniqueWithoutUserInput = {
    where: EmailRuleWhereUniqueInput
    data: XOR<EmailRuleUpdateWithoutUserInput, EmailRuleUncheckedUpdateWithoutUserInput>
  }

  export type EmailRuleUpdateManyWithWhereWithoutUserInput = {
    where: EmailRuleScalarWhereInput
    data: XOR<EmailRuleUpdateManyMutationInput, EmailRuleUncheckedUpdateManyWithoutUserInput>
  }

  export type EmailRuleScalarWhereInput = {
    AND?: EmailRuleScalarWhereInput | EmailRuleScalarWhereInput[]
    OR?: EmailRuleScalarWhereInput[]
    NOT?: EmailRuleScalarWhereInput | EmailRuleScalarWhereInput[]
    id?: StringFilter<"EmailRule"> | string
    userId?: StringFilter<"EmailRule"> | string
    name?: StringFilter<"EmailRule"> | string
    priority?: IntFilter<"EmailRule"> | number
    active?: BoolFilter<"EmailRule"> | boolean
    conditions?: JsonFilter<"EmailRule">
    actions?: JsonFilter<"EmailRule">
    emailCount?: IntFilter<"EmailRule"> | number
    stopProcessing?: BoolFilter<"EmailRule"> | boolean
    createdAt?: DateTimeFilter<"EmailRule"> | Date | string
    updatedAt?: DateTimeFilter<"EmailRule"> | Date | string
  }

  export type SignatureUpsertWithWhereUniqueWithoutUserInput = {
    where: SignatureWhereUniqueInput
    update: XOR<SignatureUpdateWithoutUserInput, SignatureUncheckedUpdateWithoutUserInput>
    create: XOR<SignatureCreateWithoutUserInput, SignatureUncheckedCreateWithoutUserInput>
  }

  export type SignatureUpdateWithWhereUniqueWithoutUserInput = {
    where: SignatureWhereUniqueInput
    data: XOR<SignatureUpdateWithoutUserInput, SignatureUncheckedUpdateWithoutUserInput>
  }

  export type SignatureUpdateManyWithWhereWithoutUserInput = {
    where: SignatureScalarWhereInput
    data: XOR<SignatureUpdateManyMutationInput, SignatureUncheckedUpdateManyWithoutUserInput>
  }

  export type SignatureScalarWhereInput = {
    AND?: SignatureScalarWhereInput | SignatureScalarWhereInput[]
    OR?: SignatureScalarWhereInput[]
    NOT?: SignatureScalarWhereInput | SignatureScalarWhereInput[]
    id?: StringFilter<"Signature"> | string
    userId?: StringFilter<"Signature"> | string
    name?: StringFilter<"Signature"> | string
    html?: StringFilter<"Signature"> | string
    title?: StringNullableFilter<"Signature"> | string | null
    company?: StringNullableFilter<"Signature"> | string | null
    phone?: StringNullableFilter<"Signature"> | string | null
    defaultNew?: BoolFilter<"Signature"> | boolean
    defaultReplies?: BoolFilter<"Signature"> | boolean
    account?: StringFilter<"Signature"> | string
    isDefault?: BoolFilter<"Signature"> | boolean
    createdAt?: DateTimeFilter<"Signature"> | Date | string
    updatedAt?: DateTimeFilter<"Signature"> | Date | string
  }

  export type CachedFolderUpsertWithWhereUniqueWithoutUserInput = {
    where: CachedFolderWhereUniqueInput
    update: XOR<CachedFolderUpdateWithoutUserInput, CachedFolderUncheckedUpdateWithoutUserInput>
    create: XOR<CachedFolderCreateWithoutUserInput, CachedFolderUncheckedCreateWithoutUserInput>
  }

  export type CachedFolderUpdateWithWhereUniqueWithoutUserInput = {
    where: CachedFolderWhereUniqueInput
    data: XOR<CachedFolderUpdateWithoutUserInput, CachedFolderUncheckedUpdateWithoutUserInput>
  }

  export type CachedFolderUpdateManyWithWhereWithoutUserInput = {
    where: CachedFolderScalarWhereInput
    data: XOR<CachedFolderUpdateManyMutationInput, CachedFolderUncheckedUpdateManyWithoutUserInput>
  }

  export type CachedFolderScalarWhereInput = {
    AND?: CachedFolderScalarWhereInput | CachedFolderScalarWhereInput[]
    OR?: CachedFolderScalarWhereInput[]
    NOT?: CachedFolderScalarWhereInput | CachedFolderScalarWhereInput[]
    id?: StringFilter<"CachedFolder"> | string
    userId?: StringFilter<"CachedFolder"> | string
    homeAccountId?: StringFilter<"CachedFolder"> | string
    displayName?: StringFilter<"CachedFolder"> | string
    parentFolderId?: StringNullableFilter<"CachedFolder"> | string | null
    unreadCount?: IntFilter<"CachedFolder"> | number
    totalCount?: IntFilter<"CachedFolder"> | number
    wellKnownName?: StringNullableFilter<"CachedFolder"> | string | null
    syncedAt?: DateTimeFilter<"CachedFolder"> | Date | string
  }

  export type CachedEmailUpsertWithWhereUniqueWithoutUserInput = {
    where: CachedEmailWhereUniqueInput
    update: XOR<CachedEmailUpdateWithoutUserInput, CachedEmailUncheckedUpdateWithoutUserInput>
    create: XOR<CachedEmailCreateWithoutUserInput, CachedEmailUncheckedCreateWithoutUserInput>
  }

  export type CachedEmailUpdateWithWhereUniqueWithoutUserInput = {
    where: CachedEmailWhereUniqueInput
    data: XOR<CachedEmailUpdateWithoutUserInput, CachedEmailUncheckedUpdateWithoutUserInput>
  }

  export type CachedEmailUpdateManyWithWhereWithoutUserInput = {
    where: CachedEmailScalarWhereInput
    data: XOR<CachedEmailUpdateManyMutationInput, CachedEmailUncheckedUpdateManyWithoutUserInput>
  }

  export type CachedEmailScalarWhereInput = {
    AND?: CachedEmailScalarWhereInput | CachedEmailScalarWhereInput[]
    OR?: CachedEmailScalarWhereInput[]
    NOT?: CachedEmailScalarWhereInput | CachedEmailScalarWhereInput[]
    id?: StringFilter<"CachedEmail"> | string
    userId?: StringFilter<"CachedEmail"> | string
    homeAccountId?: StringFilter<"CachedEmail"> | string
    folderId?: StringFilter<"CachedEmail"> | string
    subject?: StringFilter<"CachedEmail"> | string
    bodyPreview?: StringFilter<"CachedEmail"> | string
    fromName?: StringFilter<"CachedEmail"> | string
    fromAddress?: StringFilter<"CachedEmail"> | string
    toRecipients?: JsonFilter<"CachedEmail">
    receivedDateTime?: DateTimeFilter<"CachedEmail"> | Date | string
    sentDateTime?: DateTimeNullableFilter<"CachedEmail"> | Date | string | null
    isRead?: BoolFilter<"CachedEmail"> | boolean
    hasAttachments?: BoolFilter<"CachedEmail"> | boolean
    flagStatus?: StringFilter<"CachedEmail"> | string
    categories?: JsonFilter<"CachedEmail">
    syncedAt?: DateTimeFilter<"CachedEmail"> | Date | string
  }

  export type CachedCalendarEventUpsertWithWhereUniqueWithoutUserInput = {
    where: CachedCalendarEventWhereUniqueInput
    update: XOR<CachedCalendarEventUpdateWithoutUserInput, CachedCalendarEventUncheckedUpdateWithoutUserInput>
    create: XOR<CachedCalendarEventCreateWithoutUserInput, CachedCalendarEventUncheckedCreateWithoutUserInput>
  }

  export type CachedCalendarEventUpdateWithWhereUniqueWithoutUserInput = {
    where: CachedCalendarEventWhereUniqueInput
    data: XOR<CachedCalendarEventUpdateWithoutUserInput, CachedCalendarEventUncheckedUpdateWithoutUserInput>
  }

  export type CachedCalendarEventUpdateManyWithWhereWithoutUserInput = {
    where: CachedCalendarEventScalarWhereInput
    data: XOR<CachedCalendarEventUpdateManyMutationInput, CachedCalendarEventUncheckedUpdateManyWithoutUserInput>
  }

  export type CachedCalendarEventScalarWhereInput = {
    AND?: CachedCalendarEventScalarWhereInput | CachedCalendarEventScalarWhereInput[]
    OR?: CachedCalendarEventScalarWhereInput[]
    NOT?: CachedCalendarEventScalarWhereInput | CachedCalendarEventScalarWhereInput[]
    id?: StringFilter<"CachedCalendarEvent"> | string
    userId?: StringFilter<"CachedCalendarEvent"> | string
    homeAccountId?: StringFilter<"CachedCalendarEvent"> | string
    subject?: StringFilter<"CachedCalendarEvent"> | string
    bodyPreview?: StringFilter<"CachedCalendarEvent"> | string
    startDateTime?: DateTimeFilter<"CachedCalendarEvent"> | Date | string
    endDateTime?: DateTimeFilter<"CachedCalendarEvent"> | Date | string
    isAllDay?: BoolFilter<"CachedCalendarEvent"> | boolean
    location?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    organizerName?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    organizerEmail?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    responseStatus?: StringFilter<"CachedCalendarEvent"> | string
    onlineMeetingUrl?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    attendees?: JsonFilter<"CachedCalendarEvent">
    isRecurring?: BoolFilter<"CachedCalendarEvent"> | boolean
    reminderMinutes?: IntNullableFilter<"CachedCalendarEvent"> | number | null
    showAs?: StringFilter<"CachedCalendarEvent"> | string
    recurrence?: StringNullableFilter<"CachedCalendarEvent"> | string | null
    syncedAt?: DateTimeFilter<"CachedCalendarEvent"> | Date | string
  }

  export type CachedContactUpsertWithWhereUniqueWithoutUserInput = {
    where: CachedContactWhereUniqueInput
    update: XOR<CachedContactUpdateWithoutUserInput, CachedContactUncheckedUpdateWithoutUserInput>
    create: XOR<CachedContactCreateWithoutUserInput, CachedContactUncheckedCreateWithoutUserInput>
  }

  export type CachedContactUpdateWithWhereUniqueWithoutUserInput = {
    where: CachedContactWhereUniqueInput
    data: XOR<CachedContactUpdateWithoutUserInput, CachedContactUncheckedUpdateWithoutUserInput>
  }

  export type CachedContactUpdateManyWithWhereWithoutUserInput = {
    where: CachedContactScalarWhereInput
    data: XOR<CachedContactUpdateManyMutationInput, CachedContactUncheckedUpdateManyWithoutUserInput>
  }

  export type CachedContactScalarWhereInput = {
    AND?: CachedContactScalarWhereInput | CachedContactScalarWhereInput[]
    OR?: CachedContactScalarWhereInput[]
    NOT?: CachedContactScalarWhereInput | CachedContactScalarWhereInput[]
    id?: StringFilter<"CachedContact"> | string
    userId?: StringFilter<"CachedContact"> | string
    homeAccountId?: StringFilter<"CachedContact"> | string
    displayName?: StringFilter<"CachedContact"> | string
    emailAddress?: StringFilter<"CachedContact"> | string
    phone?: StringFilter<"CachedContact"> | string
    jobTitle?: StringFilter<"CachedContact"> | string
    company?: StringFilter<"CachedContact"> | string
    syncedAt?: DateTimeFilter<"CachedContact"> | Date | string
  }

  export type UserCreateWithoutMsAccountsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMsAccountsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMsAccountsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMsAccountsInput, UserUncheckedCreateWithoutMsAccountsInput>
  }

  export type UserUpsertWithoutMsAccountsInput = {
    update: XOR<UserUpdateWithoutMsAccountsInput, UserUncheckedUpdateWithoutMsAccountsInput>
    create: XOR<UserCreateWithoutMsAccountsInput, UserUncheckedCreateWithoutMsAccountsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMsAccountsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMsAccountsInput, UserUncheckedUpdateWithoutMsAccountsInput>
  }

  export type UserUpdateWithoutMsAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMsAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutMsalCacheInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMsalCacheInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMsalCacheInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMsalCacheInput, UserUncheckedCreateWithoutMsalCacheInput>
  }

  export type UserUpsertWithoutMsalCacheInput = {
    update: XOR<UserUpdateWithoutMsalCacheInput, UserUncheckedUpdateWithoutMsalCacheInput>
    create: XOR<UserCreateWithoutMsalCacheInput, UserUncheckedCreateWithoutMsalCacheInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMsalCacheInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMsalCacheInput, UserUncheckedUpdateWithoutMsalCacheInput>
  }

  export type UserUpdateWithoutMsalCacheInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMsalCacheInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutDeltaLinksInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDeltaLinksInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDeltaLinksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDeltaLinksInput, UserUncheckedCreateWithoutDeltaLinksInput>
  }

  export type UserUpsertWithoutDeltaLinksInput = {
    update: XOR<UserUpdateWithoutDeltaLinksInput, UserUncheckedUpdateWithoutDeltaLinksInput>
    create: XOR<UserCreateWithoutDeltaLinksInput, UserUncheckedCreateWithoutDeltaLinksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDeltaLinksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDeltaLinksInput, UserUncheckedUpdateWithoutDeltaLinksInput>
  }

  export type UserUpdateWithoutDeltaLinksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDeltaLinksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutWebhookSubsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutWebhookSubsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutWebhookSubsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutWebhookSubsInput, UserUncheckedCreateWithoutWebhookSubsInput>
  }

  export type UserUpsertWithoutWebhookSubsInput = {
    update: XOR<UserUpdateWithoutWebhookSubsInput, UserUncheckedUpdateWithoutWebhookSubsInput>
    create: XOR<UserCreateWithoutWebhookSubsInput, UserUncheckedCreateWithoutWebhookSubsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutWebhookSubsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutWebhookSubsInput, UserUncheckedUpdateWithoutWebhookSubsInput>
  }

  export type UserUpdateWithoutWebhookSubsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutWebhookSubsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutDraftsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDraftsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDraftsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDraftsInput, UserUncheckedCreateWithoutDraftsInput>
  }

  export type UserUpsertWithoutDraftsInput = {
    update: XOR<UserUpdateWithoutDraftsInput, UserUncheckedUpdateWithoutDraftsInput>
    create: XOR<UserCreateWithoutDraftsInput, UserUncheckedCreateWithoutDraftsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDraftsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDraftsInput, UserUncheckedUpdateWithoutDraftsInput>
  }

  export type UserUpdateWithoutDraftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDraftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutSignaturesInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSignaturesInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSignaturesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSignaturesInput, UserUncheckedCreateWithoutSignaturesInput>
  }

  export type UserUpsertWithoutSignaturesInput = {
    update: XOR<UserUpdateWithoutSignaturesInput, UserUncheckedUpdateWithoutSignaturesInput>
    create: XOR<UserCreateWithoutSignaturesInput, UserUncheckedCreateWithoutSignaturesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSignaturesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSignaturesInput, UserUncheckedUpdateWithoutSignaturesInput>
  }

  export type UserUpdateWithoutSignaturesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSignaturesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutCachedFoldersInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCachedFoldersInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCachedFoldersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCachedFoldersInput, UserUncheckedCreateWithoutCachedFoldersInput>
  }

  export type UserUpsertWithoutCachedFoldersInput = {
    update: XOR<UserUpdateWithoutCachedFoldersInput, UserUncheckedUpdateWithoutCachedFoldersInput>
    create: XOR<UserCreateWithoutCachedFoldersInput, UserUncheckedCreateWithoutCachedFoldersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCachedFoldersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCachedFoldersInput, UserUncheckedUpdateWithoutCachedFoldersInput>
  }

  export type UserUpdateWithoutCachedFoldersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCachedFoldersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutCachedEmailsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCachedEmailsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCachedEmailsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCachedEmailsInput, UserUncheckedCreateWithoutCachedEmailsInput>
  }

  export type UserUpsertWithoutCachedEmailsInput = {
    update: XOR<UserUpdateWithoutCachedEmailsInput, UserUncheckedUpdateWithoutCachedEmailsInput>
    create: XOR<UserCreateWithoutCachedEmailsInput, UserUncheckedCreateWithoutCachedEmailsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCachedEmailsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCachedEmailsInput, UserUncheckedUpdateWithoutCachedEmailsInput>
  }

  export type UserUpdateWithoutCachedEmailsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCachedEmailsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutCachedCalEventsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCachedCalEventsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCachedCalEventsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCachedCalEventsInput, UserUncheckedCreateWithoutCachedCalEventsInput>
  }

  export type UserUpsertWithoutCachedCalEventsInput = {
    update: XOR<UserUpdateWithoutCachedCalEventsInput, UserUncheckedUpdateWithoutCachedCalEventsInput>
    create: XOR<UserCreateWithoutCachedCalEventsInput, UserUncheckedCreateWithoutCachedCalEventsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCachedCalEventsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCachedCalEventsInput, UserUncheckedUpdateWithoutCachedCalEventsInput>
  }

  export type UserUpdateWithoutCachedCalEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCachedCalEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutCachedContactsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCachedContactsInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    emailRules?: EmailRuleUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCachedContactsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCachedContactsInput, UserUncheckedCreateWithoutCachedContactsInput>
  }

  export type UserUpsertWithoutCachedContactsInput = {
    update: XOR<UserUpdateWithoutCachedContactsInput, UserUncheckedUpdateWithoutCachedContactsInput>
    create: XOR<UserCreateWithoutCachedContactsInput, UserUncheckedCreateWithoutCachedContactsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCachedContactsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCachedContactsInput, UserUncheckedUpdateWithoutCachedContactsInput>
  }

  export type UserUpdateWithoutCachedContactsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCachedContactsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutEmailRulesInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    org: OrganizationCreateNestedOneWithoutUsersInput
    msAccounts?: MsConnectedAccountCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionCreateNestedManyWithoutUserInput
    drafts?: DraftCreateNestedManyWithoutUserInput
    signatures?: SignatureCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutEmailRulesInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orgId: string
    msAccounts?: MsConnectedAccountUncheckedCreateNestedManyWithoutUserInput
    msalCache?: MsalTokenCacheUncheckedCreateNestedOneWithoutUserInput
    deltaLinks?: EmailDeltaLinkUncheckedCreateNestedManyWithoutUserInput
    webhookSubs?: WebhookSubscriptionUncheckedCreateNestedManyWithoutUserInput
    drafts?: DraftUncheckedCreateNestedManyWithoutUserInput
    signatures?: SignatureUncheckedCreateNestedManyWithoutUserInput
    cachedFolders?: CachedFolderUncheckedCreateNestedManyWithoutUserInput
    cachedEmails?: CachedEmailUncheckedCreateNestedManyWithoutUserInput
    cachedCalEvents?: CachedCalendarEventUncheckedCreateNestedManyWithoutUserInput
    cachedContacts?: CachedContactUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutEmailRulesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutEmailRulesInput, UserUncheckedCreateWithoutEmailRulesInput>
  }

  export type UserUpsertWithoutEmailRulesInput = {
    update: XOR<UserUpdateWithoutEmailRulesInput, UserUncheckedUpdateWithoutEmailRulesInput>
    create: XOR<UserCreateWithoutEmailRulesInput, UserUncheckedCreateWithoutEmailRulesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutEmailRulesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutEmailRulesInput, UserUncheckedUpdateWithoutEmailRulesInput>
  }

  export type UserUpdateWithoutEmailRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    org?: OrganizationUpdateOneRequiredWithoutUsersNestedInput
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutEmailRulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgId?: StringFieldUpdateOperationsInput | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyOrgInput = {
    id: string
    email: string
    name?: string | null
    avatarUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateWithoutOrgInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    msAccounts?: MsConnectedAccountUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUpdateManyWithoutUserNestedInput
    drafts?: DraftUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUpdateManyWithoutUserNestedInput
    signatures?: SignatureUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOrgInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    msAccounts?: MsConnectedAccountUncheckedUpdateManyWithoutUserNestedInput
    msalCache?: MsalTokenCacheUncheckedUpdateOneWithoutUserNestedInput
    deltaLinks?: EmailDeltaLinkUncheckedUpdateManyWithoutUserNestedInput
    webhookSubs?: WebhookSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    drafts?: DraftUncheckedUpdateManyWithoutUserNestedInput
    emailRules?: EmailRuleUncheckedUpdateManyWithoutUserNestedInput
    signatures?: SignatureUncheckedUpdateManyWithoutUserNestedInput
    cachedFolders?: CachedFolderUncheckedUpdateManyWithoutUserNestedInput
    cachedEmails?: CachedEmailUncheckedUpdateManyWithoutUserNestedInput
    cachedCalEvents?: CachedCalendarEventUncheckedUpdateManyWithoutUserNestedInput
    cachedContacts?: CachedContactUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutOrgInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsConnectedAccountCreateManyUserInput = {
    id?: string
    homeAccountId: string
    msEmail: string
    displayName?: string | null
    tenantId?: string | null
    isDefault?: boolean
    connectedAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmailDeltaLinkCreateManyUserInput = {
    id?: string
    homeAccountId: string
    folderId: string
    deltaToken: string
    updatedAt?: Date | string
  }

  export type WebhookSubscriptionCreateManyUserInput = {
    id?: string
    homeAccountId: string
    subscriptionId: string
    resource: string
    expiresAt: Date | string
    clientState: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DraftCreateManyUserInput = {
    id?: string
    homeAccountId?: string | null
    graphDraftId?: string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: string | null
    bodyHtml?: string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: string
    requestReadReceipt?: boolean
    draftType?: string
    inReplyToMessageId?: string | null
    forwardedMessageId?: string | null
    scheduledAt?: Date | string | null
    scheduledSent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmailRuleCreateManyUserInput = {
    id?: string
    name: string
    priority: number
    active?: boolean
    conditions: JsonNullValueInput | InputJsonValue
    actions: JsonNullValueInput | InputJsonValue
    emailCount?: number
    stopProcessing?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignatureCreateManyUserInput = {
    id?: string
    name: string
    html?: string
    title?: string | null
    company?: string | null
    phone?: string | null
    defaultNew?: boolean
    defaultReplies?: boolean
    account?: string
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CachedFolderCreateManyUserInput = {
    id: string
    homeAccountId: string
    displayName: string
    parentFolderId?: string | null
    unreadCount?: number
    totalCount?: number
    wellKnownName?: string | null
    syncedAt?: Date | string
  }

  export type CachedEmailCreateManyUserInput = {
    id: string
    homeAccountId: string
    folderId: string
    subject?: string
    bodyPreview?: string
    fromName?: string
    fromAddress?: string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime: Date | string
    sentDateTime?: Date | string | null
    isRead?: boolean
    hasAttachments?: boolean
    flagStatus?: string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: Date | string
  }

  export type CachedCalendarEventCreateManyUserInput = {
    id: string
    homeAccountId: string
    subject?: string
    bodyPreview?: string
    startDateTime: Date | string
    endDateTime: Date | string
    isAllDay?: boolean
    location?: string | null
    organizerName?: string | null
    organizerEmail?: string | null
    responseStatus?: string
    onlineMeetingUrl?: string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: boolean
    reminderMinutes?: number | null
    showAs?: string
    recurrence?: string | null
    syncedAt?: Date | string
  }

  export type CachedContactCreateManyUserInput = {
    id: string
    homeAccountId: string
    displayName?: string
    emailAddress?: string
    phone?: string
    jobTitle?: string
    company?: string
    syncedAt?: Date | string
  }

  export type MsConnectedAccountUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    msEmail?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    connectedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsConnectedAccountUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    msEmail?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    connectedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MsConnectedAccountUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    msEmail?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    connectedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailDeltaLinkUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    deltaToken?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailDeltaLinkUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    deltaToken?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailDeltaLinkUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    deltaToken?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookSubscriptionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientState?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookSubscriptionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientState?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookSubscriptionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientState?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    graphDraftId?: NullableStringFieldUpdateOperationsInput | string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    bodyHtml?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: StringFieldUpdateOperationsInput | string
    requestReadReceipt?: BoolFieldUpdateOperationsInput | boolean
    draftType?: StringFieldUpdateOperationsInput | string
    inReplyToMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    forwardedMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledSent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    graphDraftId?: NullableStringFieldUpdateOperationsInput | string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    bodyHtml?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: StringFieldUpdateOperationsInput | string
    requestReadReceipt?: BoolFieldUpdateOperationsInput | boolean
    draftType?: StringFieldUpdateOperationsInput | string
    inReplyToMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    forwardedMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledSent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DraftUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    graphDraftId?: NullableStringFieldUpdateOperationsInput | string | null
    toRecipients?: JsonNullValueInput | InputJsonValue
    ccRecipients?: JsonNullValueInput | InputJsonValue
    bccRecipients?: JsonNullValueInput | InputJsonValue
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    bodyHtml?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: JsonNullValueInput | InputJsonValue
    importance?: StringFieldUpdateOperationsInput | string
    requestReadReceipt?: BoolFieldUpdateOperationsInput | boolean
    draftType?: StringFieldUpdateOperationsInput | string
    inReplyToMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    forwardedMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduledSent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailRuleUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    conditions?: JsonNullValueInput | InputJsonValue
    actions?: JsonNullValueInput | InputJsonValue
    emailCount?: IntFieldUpdateOperationsInput | number
    stopProcessing?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailRuleUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    conditions?: JsonNullValueInput | InputJsonValue
    actions?: JsonNullValueInput | InputJsonValue
    emailCount?: IntFieldUpdateOperationsInput | number
    stopProcessing?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailRuleUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    conditions?: JsonNullValueInput | InputJsonValue
    actions?: JsonNullValueInput | InputJsonValue
    emailCount?: IntFieldUpdateOperationsInput | number
    stopProcessing?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignatureUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    html?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    defaultNew?: BoolFieldUpdateOperationsInput | boolean
    defaultReplies?: BoolFieldUpdateOperationsInput | boolean
    account?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignatureUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    html?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    defaultNew?: BoolFieldUpdateOperationsInput | boolean
    defaultReplies?: BoolFieldUpdateOperationsInput | boolean
    account?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignatureUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    html?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    defaultNew?: BoolFieldUpdateOperationsInput | boolean
    defaultReplies?: BoolFieldUpdateOperationsInput | boolean
    account?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedFolderUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    parentFolderId?: NullableStringFieldUpdateOperationsInput | string | null
    unreadCount?: IntFieldUpdateOperationsInput | number
    totalCount?: IntFieldUpdateOperationsInput | number
    wellKnownName?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedFolderUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    parentFolderId?: NullableStringFieldUpdateOperationsInput | string | null
    unreadCount?: IntFieldUpdateOperationsInput | number
    totalCount?: IntFieldUpdateOperationsInput | number
    wellKnownName?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedFolderUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    parentFolderId?: NullableStringFieldUpdateOperationsInput | string | null
    unreadCount?: IntFieldUpdateOperationsInput | number
    totalCount?: IntFieldUpdateOperationsInput | number
    wellKnownName?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedEmailUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    fromName?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    sentDateTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hasAttachments?: BoolFieldUpdateOperationsInput | boolean
    flagStatus?: StringFieldUpdateOperationsInput | string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedEmailUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    fromName?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    sentDateTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hasAttachments?: BoolFieldUpdateOperationsInput | boolean
    flagStatus?: StringFieldUpdateOperationsInput | string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedEmailUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    folderId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    fromName?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toRecipients?: JsonNullValueInput | InputJsonValue
    receivedDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    sentDateTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hasAttachments?: BoolFieldUpdateOperationsInput | boolean
    flagStatus?: StringFieldUpdateOperationsInput | string
    categories?: JsonNullValueInput | InputJsonValue
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCalendarEventUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    startDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isAllDay?: BoolFieldUpdateOperationsInput | boolean
    location?: NullableStringFieldUpdateOperationsInput | string | null
    organizerName?: NullableStringFieldUpdateOperationsInput | string | null
    organizerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    responseStatus?: StringFieldUpdateOperationsInput | string
    onlineMeetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: BoolFieldUpdateOperationsInput | boolean
    reminderMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    showAs?: StringFieldUpdateOperationsInput | string
    recurrence?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCalendarEventUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    startDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isAllDay?: BoolFieldUpdateOperationsInput | boolean
    location?: NullableStringFieldUpdateOperationsInput | string | null
    organizerName?: NullableStringFieldUpdateOperationsInput | string | null
    organizerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    responseStatus?: StringFieldUpdateOperationsInput | string
    onlineMeetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: BoolFieldUpdateOperationsInput | boolean
    reminderMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    showAs?: StringFieldUpdateOperationsInput | string
    recurrence?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCalendarEventUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyPreview?: StringFieldUpdateOperationsInput | string
    startDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isAllDay?: BoolFieldUpdateOperationsInput | boolean
    location?: NullableStringFieldUpdateOperationsInput | string | null
    organizerName?: NullableStringFieldUpdateOperationsInput | string | null
    organizerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    responseStatus?: StringFieldUpdateOperationsInput | string
    onlineMeetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: JsonNullValueInput | InputJsonValue
    isRecurring?: BoolFieldUpdateOperationsInput | boolean
    reminderMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    showAs?: StringFieldUpdateOperationsInput | string
    recurrence?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedContactUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedContactUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedContactUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeAccountId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    jobTitle?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}