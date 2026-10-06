# Security deployment: FSS registration

Prepared against GitHub commit `d40b37d743f24e361fe2e9ac3c3df4ed3d296b1c`.
No production applicant documents were read, written, migrated, or deleted while preparing this change.

Configuration verified on 2026-10-06: Google and Anonymous providers enabled, `phashara.github.io` authorized, and the dedicated runtime account granted only conditional `roles/datastore.viewer` on the event database. Anonymous was explicitly authorized for this shared project; other applications should not treat an arbitrary authenticated identity as an administrator. Auto cleanup of anonymous accounts was not enabled.

Cloud Build required additional infrastructure permissions on its default build identity: read access only under the `publicDirectory/` source archive prefix, write access only to the regional `gcf-artifacts` repository, Logs Writer, and Service Usage Consumer. No database role was granted to the build identity. These are separate from the read-only function runtime identity.

## What changes

- Google sign-in restricted to the verified Google account `phasharak@gmail.com`; browser-stored flags and the former hardcoded password cannot grant admin access.
- Firestore rules protect raw applicants/orders and staff-controlled payment/check-in fields. Anonymous Firebase identities own newly submitted records. Existing records remain intact and available to the admin; they are not assigned new owners.
- Public directory uses a read-only Cloud Function with explicit public-field allowlists. Applicant phones, email, date of birth, medical data, emergency contacts, student IDs, addresses and payment slips are not included.
- Bulk applicant/order/card caches are no longer written to browser storage; old bulk caches are removed locally. Failed submission payloads remain on the applicant's own device for safe retry.
- CSV exports escape every cell and protect formula-like prefixes.

## Validation performed locally

- TypeScript check and production frontend build pass.
- 22 frontend tests pass, including forged admin sessions, private cache removal, owner IDs on new submissions, public-query routing, and CSV payloads.
- 3 server projection/input tests pass, using synthetic values only.
- 7 Firestore Emulator test cases pass in `demo-fss-security`, covering unauthenticated denial, other-account denial, legacy admin access, invalid admin identities, protected staff fields, registration batch/retry, and CMS permissions.
- Production authentication, IAM, callable behavior and deployed rules still need configuration/deployment verification. No production document requests should be used for verification under the user's restriction.

## Deployment order

1. Confirm Google provider (already observed enabled), enable Anonymous provider, and authorize `phashara.github.io` for Google login. These are configuration changes only.
2. With explicit approval, create `fss-public-directory@alpine-insight-1t3g1.iam.gserviceaccount.com`. Grant only `roles/datastore.viewer` conditioned on the named database resource `projects/alpine-insight-1t3g1/databases/ai-studio-fsshalloweenfanc-3137dab4-29d6-492e-b607-01b4ace7e671`. Do not grant Editor or datastore.user. A read-only identity prevents the function from modifying applicant data even though server SDKs bypass Firestore Security Rules.
3. Deploy only the `directory-security` function codebase in `firebase.json`. There are no database triggers, migrations or writes in this function. It will read records only when the website's users request the public directory; the agent must not invoke it against production.
4. Build and publish the new frontend, then deploy the rules to the exact named database (not an unverified default database). Complete these steps together; the old frontend's public raw-document reads will be denied under the new rules.
5. Verify deployment statuses and configuration only. The owner can verify their normal workflow themselves; the agent must not browse applicant records or submit test registrations to production.

## Operational limits

- Legacy cards remain publicly viewable. Old records do not acquire new ownership automatically; editing an old card or private order requires the admin. Anonymous ownership applies only to future submissions from the same Firebase identity/device.
- The public service adds Cloud Functions usage on the existing Blaze plan. Instance limits and per-instance IP throttling are safeguards, not a spending cap or a global rate limit. App Check is an additional step requiring site configuration.
- Old open browser tabs may need reloading after the coordinated switch. Publishing rules alone before the compatible frontend/service is ready would interrupt registration/search.
- This does not establish whether there was previous unauthorized access. No investigation of production applicant data was performed.

## Local test commands

```sh
npm install --legacy-peer-deps
npm run lint
npm test
npm run build
node --test functions/test/projection.test.js
npx firebase emulators:exec --config firebase.emulator.json --project demo-fss-security --only firestore 'node --test tests/security/firestore.test.mjs'
```

The emulator test script refuses to run unless `FIRESTORE_EMULATOR_HOST` is exactly `127.0.0.1:8080`.
