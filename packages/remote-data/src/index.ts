import {
  initialized,
  pending,
  success,
  failure,
  updating,
  fold,
  map,
  mapFailure,
  get,
} from "./remote-data";
import { all } from "./all";
export type {
  RemoteData,
  IMatch,
  IMatchExhaustive,
  IMatchWithDefault,
} from "./remote-data";
export const RD = {
  map,
  mapFailure,
  initialized,
  pending,
  success,
  failure,
  updating,
  fold,
  all,
  get,
};
