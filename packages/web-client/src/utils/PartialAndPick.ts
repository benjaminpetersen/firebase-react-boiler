export type PartialAndPick<T, K extends keyof T> = Partial<T> & Pick<T, K>;
