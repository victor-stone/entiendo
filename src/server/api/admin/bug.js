import { reportBug } from '../../lib/github.js';

export async function reportAppBug(routeContext) {
  const { payload: { title, body, labels }, user: { userId, name } } = routeContext;
  const bodyPlus = body + `
  
  user: ${name?.slice(0,5)}... / ${userId}
  `;
  const result = reportBug({title,body: bodyPlus,labels});
  return result;
}