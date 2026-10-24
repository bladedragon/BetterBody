# Verification

## Repeatable checks

```sh
npm run check
npm test
```

Syntax checks cover JavaScript modules in the application, backend, and scripts. Deterministic tests cover nutrient scaling and missing values, dish components, portions, metric validation, backup handling, vision protocols, USDA units and failure handling, and HTTP access boundaries. Tests use local fixtures and do not validate live providers.

## Manual UI acceptance

1. Run `npm run test:ui` and open `http://localhost:4180`.
2. Select `tests/fixtures/upload.png` and consent to analysis.
3. Confirm the fixed-response label, ingredient, estimated portion, and database source appear.
4. Review nutrient details, save the meal, and check the daily total.
5. For the fixture rice at 180 g, expect 234 kcal and 5.4 g protein. Missing nutrients should remain unknown.
6. Stop the fixture server. Use `npm start` for the normal application.

The fixture server does not read private environment configuration or make live provider calls. It verifies the data flow, not recognition accuracy.

## Deployment acceptance still required

- Physical camera permissions and image quality on intended iOS/Android/desktop browsers.
- Live vision-provider and USDA interoperability, matching quality, portion error, and network reachability.
- Container build, HTTPS reverse proxy, authentication, and deployment-specific rate limits.
- Offline behavior, browser storage lifecycle, export, and partial restore on target browsers.

Screenshots in this directory illustrate demo UI states; they are not evidence of live recognition accuracy or production deployment validation.
