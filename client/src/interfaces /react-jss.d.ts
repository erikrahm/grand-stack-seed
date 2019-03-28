/*
 * The "official" definitelyTyped @types/react-jss has various problems:
 * 1) it complains about type widening, which they claim is a typescript problem, so it is more-or-less unusable in its present state
 * 2) ignoring 1), it doesnt properly inject `classes`, causing an error in the `injectSheet(styles)(component)` line
 *
 * Stable version of react-jss
 * - add the following into your components Props:
 *     classes: WithStyle<typeof styles>,
 *   The `classes` prop will be properly injected into the component,
 *   and the WithStyle type will enforce that you only use classes that are defined in the object
 *
 *   Will not have typesafe-by-default "function styles" (which isnt very common in our codebase);
 *   instead you'd have to keep it as `any`, or you can manually type the argument as Props
 *   and then you'll have to `as any` the FieldLine, or the container FieldObject
 *
 *      Default state: props is implictily `any`, no type checking of `firstCell`
 *      const styles = {
 *        tableCell: {
 *          paddingLeft: (props) => props.firstCell ? 30 : props.padding,
 *        }
 *      }
 *
 *      Solution A) Manually type props: Props, and mark the field `as any`
 *      const styles = {
 *        tableCell: {
 *          paddingLeft: ((props: Props) => props.firstCell ? 30 : props.padding) as any,
 *        }
 *      }
 *
 *      Solution B) Manually type props: Props, and mark the FieldObject `as any`
 *      const styles = {
 *        tableCell: {
 *          paddingLeft: (props: Props) => props.firstCell ? 30 : props.padding,
 *        } as any,
 *      }
 *
 */
declare module 'react-jss' {
  import * as React from 'react';
  import {
    ComponentType as Component,
    ComponentClass,
    StatelessComponent,
    ValidationMap,
  } from 'react';

  type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
  type Subtract<T, K> = Omit<T, keyof K>;

  interface InjectedProps<S extends string> {
    classes: Record<S, string>;
  }

  type WithStateT<S extends string> = <WrappedProps extends InjectedProps<S>>(
    WrappedComponent:
      | React.ComponentType<WrappedProps>
      | React.FC<WrappedProps>,
  ) => React.FC<Subtract<WrappedProps, InjectedProps<S>>> & {
    InnerComponent: React.FC<WrappedProps>;
  };

  type StyleObj<ClassKey extends string = string> = Record<
    ClassKey,
    CSSProperties
  >;

  // type Modifier = string;
  // type CSSProperty = string | number | ((props: object) => string | number) | Array<number>;

  // Allow functions that take the properties of the component and return a CSS value
  export type DynamicCSSRule =
    | string
    | number
    | null
    | undefined
    | Array<number | string>
    | ((props: any) => string | number | null | undefined | Array<number>);

  export interface CSSProperties {
    // Allow pseudo selectors and media queries
    [k: string]: DynamicCSSRule | CSSProperties;
  }

  function injectSheet<S extends string>(styles: StyleObj<S>): WithStateT<S>;

  export default injectSheet;
}

/*
 * Experimental version of react-jss
 *   Attempted benefits were to automatically type the `props` argument in the following
 *      const styles = {
 *        tableCell: {
 *          paddingLeft: (props) => props.firstCell ? 30 : props.padding,
 */
// declare module 'react-jss' {
//   import * as React from 'react';
//   import { ComponentType as Component, ComponentClass, StatelessComponent, ValidationMap } from 'react';

//   export interface InjectedProps<S extends string> {
//     classes: Record<S, string>,
//   }

//   type WithStateT<S extends string, WrappedProps extends InjectedProps<S>> = (
//     WrappedComponent: React.ComponentType<WrappedProps> | React.FC<WrappedProps> | ((props: WrappedProps) => React.ReactNode)
//   ) => React.FC<Subtract<WrappedProps, InjectedProps<S>>>;

//   export type Styles<P extends {}, ClassKey extends string = string> = Record<
//     ClassKey,
//     CSSProperties<P>
//   >;

//   export type CSSProperties<P> = Record<
//     string,
//     string|number|boolean|((props: P) => string|number|boolean)
//   >;

//   function injectSheet<
//     S extends string,
//     WrappedProps extends InjectedProps<S>,
//   >(styles: Styles<Subtract<WrappedProps, InjectedProps<S>>, S>): WithStateT<S, WrappedProps>;

//   export default injectSheet;
// }
