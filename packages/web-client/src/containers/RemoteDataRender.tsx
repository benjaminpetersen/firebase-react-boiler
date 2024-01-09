import { RD, RemoteData, IMatchExhaustive } from "@chewing-bytes/remote-data";
import { ErrorPage } from "../components/ErrorPage";
import { LinearProgress } from "@mui/material";
import { PartialAndPick } from "../utils/PartialAndPick";

type RemoteDataRenderProps<D, E> = {
  remoteData: RemoteData<D, E>;
} & PartialAndPick<IMatchExhaustive<React.ReactNode, D, E>, "success">;

export const RemoteDataRender = <D, E>({
  remoteData,
  failure,
  initialized,
  pending,
  success,
}: RemoteDataRenderProps<D, E>) => {
  const reactNode = RD.fold(remoteData, {
    failure: (error) => (failure ? failure(error) : <ErrorPage />),
    initialized: () => (initialized ? initialized() : <LinearProgress />),
    pending: () => (pending ? pending() : <LinearProgress />),
    success,
  });
  return <>{reactNode}</>;
};
