import { product } from '../products.get';
export default defineEventHandler(event => {
  const alias = getRouterParam(event, 'alias')!;
  if (alias === 'missing') throw createError({ statusCode: 404 });
  const count = Number(alias.replace('fixture-', ''));
  return product(count);
});
