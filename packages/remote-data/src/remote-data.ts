export type Initialized = { type: "initialized" };
export type Pending = { type: "pending" };
export type Success<D> = { type: "success"; data: D };
export type Failure<E> = { type: "failure"; error: E };
export type Updating<D> = { type: "updating"; data: D };

export type RemoteData<D, E> =
  | Initialized
  | Pending
  | Success<D>
  | Failure<E>
  | Updating<D>;

export const initialized: Initialized = { type: "initialized" };
export const pending: Pending = { type: "pending" };
export const success = <D>(d: D): Success<D> => ({ type: "success", data: d });
export const failure = <E>(error: E): Failure<E> => ({
  type: "failure",
  error,
});
export const updating = <D>(data: D): Updating<D> => ({
  type: "updating",
  data,
});

export const isInitialized = <D, E>(rd: RemoteData<D, E>): rd is Initialized =>
  rd.type === "initialized";
export const isPending = <D, E>(rd: RemoteData<D, E>): rd is Pending =>
  rd.type === "pending";
export const isSuccess = <D, E>(rd: RemoteData<D, E>): rd is Success<D> =>
  rd.type === "success";
export const isFailure = <D, E>(rd: RemoteData<D, E>): rd is Failure<E> =>
  rd.type === "failure";
export const isUpdating = <D, E>(rd: RemoteData<D, E>): rd is Updating<D> =>
  rd.type === "updating";

export type IMatchExhaustive<RT, D, E> = {
  initialized: () => RT;
  pending: () => RT;
  success: (data: D, isUpdating: boolean) => RT;
  failure: (error: E) => RT;
};

export type IMatchWithDefault<RT, D, E> = Partial<
  IMatchExhaustive<RT, D, E>
> & { _: () => RT };

export type IMatch<RT, D, E> =
  | IMatchWithDefault<RT, D, E>
  | IMatchExhaustive<RT, D, E>;

export const isMatchWithDefault = <RT, D, E>(
  matcher: IMatch<RT, D, E>,
): matcher is IMatchWithDefault<RT, D, E> => "_" in matcher;

export const map = <D1, D2, E>(
  rt: RemoteData<D1, E>,
  map: (d1: D1) => D2,
): RemoteData<D2, E> =>
  fold<RemoteData<D2, E>, D1, E>(rt, {
    success: (d1, isUpdating) =>
      isUpdating ? updating(map(d1)) : success(map(d1)),
    failure,
    initialized: () => initialized,
    pending: () => pending,
  });

export const mapFailure = <D, E1, E2>(
  rd: RemoteData<D, E1>,
  map: (e: E1) => E2,
) =>
  fold<RemoteData<D, E2>, D, E1>(rd, {
    success: (d, isUpdating) => (isUpdating ? updating(d) : success(d)),
    failure: (e) => failure(map(e)),
    initialized: () => initialized,
    pending: () => pending,
  });

export const fold = <RT, D, E>(
  rd: RemoteData<D, E>,
  match: IMatch<RT, D, E>,
): RT => {
  switch (rd.type) {
    case "initialized":
      if ("initialized" in match && match.initialized)
        return match.initialized();
      break;
    case "pending":
      if ("pending" in match && match.pending) return match.pending();
      break;
    case "success":
    case "updating":
      if ("success" in match && match.success)
        return match.success(rd.data, rd.type === "updating");
      break;
    case "failure":
      if ("failure" in match && match.failure) return match.failure(rd.error);
      break;
  }
  if ("_" in match) return match["_"]();
  else throw Error("NEVER");
};

export const transposeRDPr = async <D, E>(
  rd: RemoteData<Promise<D>, E>,
): Promise<RemoteData<D, E>> => {
  const rd2 = isSuccess(rd)
    ? success(await rd.data)
    : isUpdating(rd)
      ? updating(await rd.data)
      : rd;
  return rd2;
};

export const get = <D, E>(rd: RemoteData<D, E>) =>
  rd.type === "success" || rd.type === "updating" ? rd.data : undefined;
