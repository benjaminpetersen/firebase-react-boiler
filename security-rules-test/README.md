# Security rules tests for firebase

## Quickstart

run `yarn run test:rules` from the project root
Which will cause the following:

1. Build the contents of `./security-rules-test`
2. Start the emulators with security rules from firestore.rules and storage.rules
3. run the bash script ./security-rules-test/run.sh which runs the built js files.

## Auth considerations

The rules these tests are concerned with are validating that a companies private information is secure. So we don't concern ourselves with a member being able to read / write their own documents. Only that they can't read/write another companies documents. And that admin privileges don't bleed.

1. /{env}/companies/companies/{companyId}/\*\*

   - Test: Admin for company 2 can read no company 1 docs. Admin for company 2 and standard user for company 1 doesn't have admin for company 1.

2. /{env}/companies/companies/{companyId}/company-user-permissions/\*\*
   - Only write if you're an admin!
   - Only read if you're in the list!

Note: A general philosophy around testing is that it's pretty dumb. It should only be used to evaluate critical things as it bogs down dev time. So the goal is to have 2 general types: 1. Critical data security: There's no way for data to leak. 2. Functional app: Screen recordings of onboarding a new company to contract completion on a fresh database.
