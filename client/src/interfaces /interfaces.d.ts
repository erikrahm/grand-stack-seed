declare const NO_DEFAULT_VALUE: undefined;
declare const __DEV__: boolean;
declare const __PROD__: boolean;
declare const devToolsExtension: boolean;
declare const LAUNCH_DARKLY_OVERRIDES_INJECTED: { [key: string]: boolean };

declare type WithStyle<T> = { [P in keyof T]: string };

declare type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
declare type Subtract<T, K> = Omit<T, keyof K>;

declare module "*";

declare module "*.graphql" {
  import { DocumentNode } from "graphql";

  const value: DocumentNode;
  export = value;
}

declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.png" {
  const content: any;
  export default content;
}

declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare namespace React {
  export interface FunctionComponent<P = {}> {
    fragments?: { [key: string]: any };
  }
}

type WithDefaultProps<T, P> = React.ComponentType<
  JSX.LibraryManagedAttributes<T, P>
>;

// Custom GraphQL Scalars
declare type GQLANUUID = string;
declare type GQLInt53 = number;
declare type GQLRoleSlug = string;
declare type GQLTimeStamp = number; // timestamp in seconds
declare type GQLUUID = string;
