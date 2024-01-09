import { logger } from "firebase-functions/v2";
import { auth } from "../fb-lib/init";
export const sendNotification = async (data: {
  msg: string;
  link: string;
  user: { id: string } | { email: string };
}) => {
  const email =
    "email" in data.user
      ? data.user.email
      : await auth.getUser(data.user.id).then((u) => u?.email);
  logger.info(
    `STUB TODO: send notifications ${email} - ${data.msg} - ${data.link}`,
  );
};
