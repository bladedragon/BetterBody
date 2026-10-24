# Product scope and architecture

BetterBody is a local-first nutrition journal for individual use. The current interface is Chinese; repository documentation is English-first.

## Core workflow

Record a meal manually or capture/select a photo. Photo upload requires consent. Review ingredient candidates and estimated portions, adjust nutrient sources or values, then save the meal and review the daily summary. Personal records remain separate from clearly labeled demo data.

Mixed dishes use ingredient-level portions. Unknown nutrients remain `null`. Food state, units, and source identifiers matter: an image estimate is not a measured serving weight, and intake below a reference value is not a diagnosis.

## Architecture

The browser owns UI state and persisted personal records. Domain modules handle nutrient scaling, dish components, portions, and backup validation. A small Node.js HTTP server serves an explicit static asset allowlist and mediates external API calls. Provider credentials never belong in browser code.

The recognition adapter validates structured ingredient output, then retrieves nutrient candidates from USDA. Vision-generated nutrient numbers are not accepted as authoritative database values. Provider and database failures surface as errors or unknown nutrients.

## Release boundaries

Version 0.4.0 supports a responsive single-user web app, optional photo recognition, manual records, body-metric import, and JSON export/partial restore. Native packages, accounts, cloud synchronization, label OCR, background notifications, and professionally reviewed personalized plans are future work.

Further releases need device-camera testing, live-provider evaluation, stronger food matching coverage, and deployment-specific validation. New capabilities should preserve explicit consent, traceable sources, editable estimates, and honest empty/error states.
