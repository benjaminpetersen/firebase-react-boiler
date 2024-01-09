import { ZodError } from "zod";

// TODO add in useable zod errors
export type ParseError = { type: "parse-error" };
export const parseErr = (e: ZodError): ParseError => {
  console.error("DEV LOG FIREBASE-STANDARDS", e);
  return { type: "parse-error" };
};
export type Failure<E = Error> = { type: "error"; error: E };
export const failE = <E>(e: E): Failure<E> => ({ type: "error", error: e });
export type Data<D> = { type: "success"; data: D; id: string };
export const dataRt = <D>(d: D, id: string): Data<D> => ({
  data: d,
  id,
  type: "success",
});

export type SuccessFail<D, E = Error> = Data<D> | Failure<E> | ParseError;
