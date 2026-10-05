import { catalogue } from "../lib/catalogue";
import { catalogueReview } from "../lib/catalogue-validation";
const review=catalogueReview(catalogue);
const summary=(items:typeof catalogue)=>items.map(item=>({id:item.id,title:item.title,provider:item.provider,kind:item.sourceKind,checkedAt:item.checkedAt,opening:item.openingDate||item.openingPeriod,deadline:item.deadlineDate||item.deadline,sources:item.sourceUrls,unconfirmed:item.unconfirmed}));
// The counts come first so a maintainer sees whether the catalogue is healthy before
// scrolling a list. "Incomplete" is reported separately: those records carry a caveat that
// is already visible to students, not a problem waiting to be found.
console.log(JSON.stringify({generatedAt:new Date().toISOString(),counts:review.counts,duplicates:review.duplicates,stale:summary(review.stale),approachingOpenings:summary(review.approachingOpenings),approachingDeadlines:summary(review.approachingDeadlines),conflicts:summary(review.conflicts),needsReview:summary(review.needsReview),incomplete:summary(review.incomplete)},null,2));
