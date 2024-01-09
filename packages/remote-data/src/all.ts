/**
 * Combine up to 10 remote datas, or an array of remote datas
 */
import {
  RemoteData,
  success,
  failure,
  initialized,
  pending,
} from "./remote-data";
export function all<D1, E1, D2, E2>(
  rds: [RemoteData<D1, E1>, RemoteData<D2, E2>],
): RemoteData<[D1, D2], (E1 | E2)[]>;
export function all<D1, E1, D2, E2, D3, E3>(
  rds: [RemoteData<D1, E1>, RemoteData<D2, E2>, RemoteData<D3, E3>],
): RemoteData<[D1, D2, D3], (E1 | E2 | E3)[]>;
export function all<D1, E1, D2, E2, D3, E3, D4, E4>(
  rds: [
    RemoteData<D1, E1>,
    RemoteData<D2, E2>,
    RemoteData<D3, E3>,
    RemoteData<D4, E4>,
  ],
): RemoteData<[D1, D2, D3, D4], (E1 | E2 | E3 | E4)[]>;
export function all<D, E>(rds: RemoteData<D, E>[]): RemoteData<D[], E[]>;
export function all<D, E>(rds: RemoteData<D, E>[]): RemoteData<D[], E[]> {
  if (rds.every((rd) => rd.type === "success")) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const s = success(rds.map((rd) => rd.data));
    return s;
  }
  if (rds.find((rd) => rd.type === "failure"))
    return failure(
      rds
        .filter((rd) => rd.type === "failure")
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .map((rd) => rd.error),
    );
  if (rds.find((rd) => rd.type === "pending")) return pending;
  return initialized;
}
