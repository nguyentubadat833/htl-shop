export const product = (count: number, index = 0) => ({
  publicId: `fixture-${count}`, alias: `fixture-${count}`, name: `Fixture product with ${count} images`,
  price: 0, priceVND: 0, plan: 'FREE', createdAt: '2026-10-06T00:00:00.000Z', indexable: true,
  imageLinks: Array.from({ length: count }, (_, i) => `/images/logo.jpg?preview=${i}`),
  categories: [{ publicId: 'chairs', alias: 'chairs', name: 'Chairs', type: '3D' }],
  info: { platform: '', render: '', size: '', colors: '', style: '', materials: '', formfactor: '', description: `Test fixture ${index}` },
});
export default defineEventHandler(() => [product(1), product(60, 1), product(0, 2)]);
