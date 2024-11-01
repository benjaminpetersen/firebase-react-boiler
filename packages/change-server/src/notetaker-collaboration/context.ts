export type DocUserContext = {
  // server generated on connect.
  sessionId: string;
  roomName: string;
  updates: number;
};

let count = 0;
export const newDocUserContext = (roomName: string): DocUserContext => {
  return {
    sessionId: `${count++}`,
    roomName,
    updates: 0,
  };
};
