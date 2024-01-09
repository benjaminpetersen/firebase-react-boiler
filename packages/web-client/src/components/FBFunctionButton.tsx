import {
  BackendFunctions,
  FunctionRequestData,
  FunctionResponseData,
} from "@chewing-bytes/firebase-standards";
import { PropsOf } from "../utils/propsOf";
import { AsyncButton } from "./AsyncButton";
import { firebaseFunction } from "../network/firebase/init";
import { Toast } from "../state/toast";
import { MouseEvent, useState } from "react";

export const FBFunctionButton = <Endpoint extends BackendFunctions>({
  endpoint,
  submit,
  ...props
}: Omit<PropsOf<typeof AsyncButton>, "onClick"> & {
  submit: (
    event: MouseEvent<HTMLButtonElement>,
    call: (
      args: FunctionRequestData[Endpoint],
    ) => Promise<FunctionResponseData[Endpoint] | null>,
  ) => void;
  endpoint: Endpoint;
}) => {
  const [feedback, setFeedback] = useState<Toast[]>();
  return (
    <AsyncButton
      {...props}
      feedback={feedback}
      onClick={(e) => {
        return new Promise((res, rej) => {
          submit(e, async (args) => {
            try {
              const response = await firebaseFunction(
                endpoint,
                args,
                setFeedback,
              );
              res();
              return response;
            } catch (error) {
              rej(error);
              return null;
            }
          });
        });
      }}
    />
  );
};
