import { catalogue } from "../lib/catalogue";
import { catalogueReview } from "../lib/catalogue-validation";
const review=catalogueReview(catalogue);
const summary=(items:typeof catalogue)=>items.map(item=>({id:item.id,title:item.title,provider:item.provider,kind:item.sourceKind,checkedAt:item.checkedAt,opening:item.openingDate||item.openingPeriod,deadline:item.deadlineDate||item.deadline,sources:item.sourceUrls,unconfirmed:item.unconfirmed}));
console.log(JSON.stringify({generatedAt:new Date().toISOString(),duplicates:review.duplicates,stale:summary(review.stale),approachingOpenings:summary(review.approachingOpenings),approachingDeadlines:summary(review.approachingDeadlines),conflicts:summary(review.conflicts),needsReview:summary(review.needsReview)},null,2));
