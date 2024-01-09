// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { CollectionTypes } from "@chewing-bytes/firebase-standards";

export const getValuesToSeed = (
  uid: string,
): {
  [K in keyof CollectionTypes]?: (CollectionTypes[K] & { id?: string })[];
} => {
  const dates = {
    createdAt: new Date(),
    deletedAt: Math.random() ? null : new Date(),
    updatedAt: new Date(),
    status: "current",
  };
  const contractType = {
    // //
    ...dates,
    fields: [],
    files: [],
    status: "current",
    name: "TEST",
  };
  const seedDefaults: CollectionTypes = {
    contracts: {
      contractData: {},
      contractDataBBoxes: {},
      accessGrantedToUserIds: [],
      creatorUserId: "123",
      inputFiles: [],
      name: "TestUserAdmin",
      contractType,
      contractTypeId: "123",
    },
    contractTypes: contractType,
    fileStatusi: { ...dates, gsUri: "gs://" },
    uniqueNames: { renameCount: 1 },
    users: {
      authId: "123",
      name: "TestUser",
      admin: true,
      email: "admin@dd.dd",
      phone: "123456789",
    },
  };
  //
  const randomAvatar = () => ({
    avatarUrl:
      Math.random() > 0.5
        ? "https://plus.unsplash.com/premium_photo-1683121366070-5ceb7e007a97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        : Math.random() > 0.5
          ? "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          : undefined,
  });
  //

  const adminId = Math.random().toString();
  const standardId = Math.random().toString();
  const standardId2 = Math.random().toString();
  return {
    contractTypes: [seedDefaults.contractTypes],
    contracts: [
      {
        ...seedDefaults.contracts,
        accessGrantedToUserIds: [standardId, standardId2, uid],
        creatorUserId: standardId,
        currentEditor: { id: standardId },
      },
      {
        ...seedDefaults.contracts,
        status: "completed",
        accessGrantedToUserIds: [uid],
      },
    ],
    users: [
      {
        ...seedDefaults.users,
        authId: adminId,
        name: "A 1",
        admin: true,
        email: "admin@dd.dd",
        phone: "123456789",
        ...randomAvatar(),
      },
      {
        ...seedDefaults.users,
        authId: standardId,
        name: "S 1",
        admin: false,
        email: "dd@dd.dd",
        phone: "223456789",
        ...randomAvatar(),
      },
      {
        ...seedDefaults.users,
        authId: standardId2,
        name: "S 2",
        admin: false,
        email: "dd2@dd.dd",
        phone: "233456789",
        ...randomAvatar(),
      },
    ],
  };
  //
};
