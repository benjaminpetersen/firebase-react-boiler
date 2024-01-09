// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PropsOf<T extends (props: any) => unknown> = Parameters<T>[0];
