/**
 * A general write up of the inspiration for testing is here /security-rules-test/README.md
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  a1c1,
  // a1c1FilePath,
  a1c2,
  c1,
  s1c1,
  s2c1,
  seed,
  toSet,
} from "./seed";
import { appDbPaths, bucket } from "./init";
import { getTestRunner } from "./lib";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getBytes, ref } from "firebase/storage";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { initializeApp } from "firebase-admin/app";
initializeApp();

// Read Access Important points:
// 1. No reads for non company users.
// 2. Contracts - must be user && ( admin || claims )

// Write access with broader security implications:
// invites - no write access - function maintained
// users - no write access - function maintained
// contracts - companyUsers AND ( admin OR claims based )

// These logs just ensure the emulator is working
const readsWorkLog = "SANITY: Reads work.";

const gsIfy = (s: string) => `gs://${bucket}/${s}`;
let testRunner: ReturnType<typeof getTestRunner>;
beforeAll(async () => {
  await seed(getFirestore(), getStorage());
  testRunner = getTestRunner(
    await initializeTestEnvironment({
      projectId: "playgroundfree",
    }),
  );
});

afterAll(() => {
  setTimeout(() => {
    // No idea why this won't exit itself. It worked before I used jest
    process.exit(0);
  }, 5000);
});

/**
 *
 * READ Tests. Major concerns:
 *  - Can't read other companies docs.
 *  - Can't read other standard users contract details.
 *
 */

const c1Paths: string[] = toSet
  .map((v) => v.path)
  .filter((path) => path.includes("/companies/c1/"));
test(
  readsWorkLog,
  async () =>
    await testRunner(a1c1, ({ firestore }) => {
      return c1Paths.map((path) =>
        assertSucceeds(getDoc(doc(firestore, path))),
      );
    }),
);
test(`TEST: Admin for company c2 can not read any of ${c1Paths} company c1 docs`, () =>
  testRunner(a1c2, ({ firestore }) => {
    return c1Paths.map((path) => assertFails(getDoc(doc(firestore, path))));
  }));

// test(readsWorkLog, () =>
//   testRunner(a1c1, ({ storage }) =>
//     assertSucceeds(getBytes(ref(storage, gsIfy(a1c1FilePath)))),
//   ),
// );

/**
 *
 * Gaining access to a company. Major concerns:
 *   - ONLY admins can invite users to thier own company.
 *   - Users can't elevate their own status
 *
 */

test("SANITY: admins can invite", () =>
  testRunner(s1c1, async ({ storage }) => {
    // Done via cloud functions. Not sure how to access here... will have to sign a bearer er sumthin
    // return [assertSucceeds(getBytes(ref(storage, gsIfy(s1c1FilePath))))];
  }));

test(`TEST: Standard for c1 can not create or update permissions`, () =>
  testRunner(s1c1, async ({ firestore }) => {
    return [
      assertFails(
        updateDoc(
          doc(
            firestore,
            appDbPaths.companyUsersPermissions({ companyId: "c1" }, s1c1.id),
          ),
          { admin: true },
        ),
      ),
      assertFails(
        setDoc(
          doc(
            firestore,
            appDbPaths.companyUsersPermissions(
              { companyId: "c1" },
              "new-user-1",
            ),
          ),
          { admin: true },
        ),
      ),
    ];
  }));
test(`SANITY: Admins can toggle other admins`, () =>
  testRunner(a1c1, async ({ firestore }) => {
    const one = assertSucceeds(
      updateDoc(
        doc(
          firestore,
          appDbPaths.companyUsersPermissions({ companyId: "c1" }, s1c1.id),
        ),
        { admin: true },
      ),
    );
    await one;
    const two = assertSucceeds(
      updateDoc(
        doc(
          firestore,
          appDbPaths.companyUsersPermissions({ companyId: "c1" }, s1c1.id),
        ),
        { admin: false },
      ),
    );
    return [one, two];
  }));
test(`TEST: Admin (${a1c1.id}) for c1 can not create permissions`, () =>
  testRunner(a1c1, async ({ firestore }) => {
    return [
      assertFails(
        setDoc(
          doc(
            firestore,
            appDbPaths.companyUsersPermissions(
              { companyId: "c1" },
              "new-user-1",
            ),
          ),
          { admin: true },
        ),
      ),
    ];
  }));
test(`TEST: No user can create an existing company`, () =>
  testRunner(a1c2, async ({ firestore }) =>
    assertFails(
      setDoc(doc(firestore, appDbPaths.companies("c1")), {
        ...c1,
        name: "Rob yerr company",
      }),
    ),
  ));

test("FUNCTIONS: fail incorrect prop types", () =>
  testRunner(a1c1, async ({ httpsFunction }) => {
    const res = await Promise.all([
      // @ts-expect-error
      httpsFunction("c1", "createCompany", { name: 10 }),
      // @ts-expect-error
      httpsFunction("c1", "deleteUser", { userId: 1 }),
      // @ts-expect-error
      httpsFunction("c1", "sendInviteToCompany", { email: 10, admin: 10 }),
      // @ts-expect-error
      httpsFunction("c1", "signUp", { email: 10, password: 10 }),

      httpsFunction("c1", "updateContract", {
        id: "",
        accessGrantedToUserIds: [],
        // @ts-expect-error
        currentEditor: { id: 1 },
        // @ts-expect-error
        delete: 10,
      }),
    ]);
    expect(
      res.every(
        (v) => v.type === "error" && v.code === "functions/failed-precondition",
      ),
    ).toBe(true);
  }));

test("FUNCTIONS: Admin only can invite", async () => {
  await testRunner(a1c1, async ({ httpsFunction }) => {
    const [canInviteUser, cantInviteToOtherCompany] = await Promise.all([
      httpsFunction("c1", "sendInviteToCompany", {
        email: "nonexistinguser1@email.com",
        admin: true,
      }),
      httpsFunction("c2", "sendInviteToCompany", {
        email: "nonexistinguser2@email.com",
        admin: true,
      }),
    ]);
    expect(canInviteUser.type).toBe("success");
    expect(cantInviteToOtherCompany.type).toBe("error");
  });
  await testRunner(s1c1, async ({ httpsFunction }) => {
    const standardCantInvite = await httpsFunction(
      "c1",
      "sendInviteToCompany",
      {
        email: "nonexistinguser3@email.com",
      },
    );
    expect(standardCantInvite.type === "error").toBe(true);
  });
});

test("FUNCTIONS: Can't create an existing company", () => {
  return testRunner(a1c2, async ({ httpsFunction }) => {
    // This probably creates a new company
    const newCompany = await httpsFunction("c1", "createCompany", {
      name: "c1",
    });
    const companyId =
      newCompany.type === "success"
        ? newCompany.data.data?.companyId
        : undefined;
    expect(typeof companyId).toBe("string");
    expect(companyId).not.toBe("c1");
  });
});
