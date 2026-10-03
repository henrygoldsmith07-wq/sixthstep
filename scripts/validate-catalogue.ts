import { catalogue } from "../lib/catalogue";
import { catalogueReview } from "../lib/catalogue-validation";
const review=catalogueReview(catalogue);
console.log("Validated",catalogue.length,"source-linked catalogue records.");
console.log("Review queue:",review.needsReview.length,"· stale:",review.stale.length,"· conflicting:",review.conflicts.length);
