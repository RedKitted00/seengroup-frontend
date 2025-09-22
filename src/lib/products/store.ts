import { Category, Product } from './types';

let categories: Category[] = [];
let products: Product[] = [];

const now = () => new Date().toISOString();
const id = () => Math.random().toString(36).slice(2, 10);
const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Seed data for initial static manipulation
const seedCategories: Category[] = [
  { id: 'cat-aux', name: 'Auxiliary', slug: 'auxiliary', createdAt: now(), updatedAt: now() },
  { id: 'cat-comp', name: 'Components', slug: 'components', createdAt: now(), updatedAt: now() },
  { id: 'cat-parts', name: 'Parts', slug: 'parts', createdAt: now(), updatedAt: now() },
];

const seedProducts: Product[] = [
  { id: 'p-1', categoryId: 'cat-aux', name: 'Alternator Blower', manufacturerName: 'GE', manufacturerNumber: '5GDY74B2', weight: '2.8 kg', packageDimension: '20x10x8 cm', imageUrl: '', createdAt: now(), updatedAt: now() },
  { id: 'p-2', categoryId: 'cat-aux', name: 'Exhauster Blower', manufacturerName: 'GE', manufacturerNumber: '5GDY90F1', weight: '3.1 kg', packageDimension: '22x12x9 cm', imageUrl: '', createdAt: now(), updatedAt: now() },
  { id: 'p-3', categoryId: 'cat-comp', name: 'Stator Assembly', manufacturerName: 'EMD', manufacturerNumber: 'STATOR-001', weight: '5.0 kg', packageDimension: '30x20x10 cm', imageUrl: '', createdAt: now(), updatedAt: now() },
];

if (categories.length === 0) {
  categories = seedCategories.slice();
}
if (products.length === 0) {
  products = seedProducts.slice();
}

export const db = {
  // Category operations
  listCategories(): Category[] {
    return categories.slice();
  },
  createCategory(name: string): Category {
    const newCategory: Category = {
      id: id(),
      name,
      slug: slugify(name),
      createdAt: now(),
      updatedAt: now(),
    };
    categories.push(newCategory);
    return newCategory;
  },
  renameCategory(categoryId: string, name: string): Category | null {
    const c = categories.find((c) => c.id === categoryId);
    if (!c) return null;
    c.name = name;
    c.slug = slugify(name);
    c.updatedAt = now();
    return c;
  },
  deleteCategory(categoryId: string): boolean {
    const before = categories.length;
    categories = categories.filter((c) => c.id !== categoryId);
    products = products.filter((p) => p.categoryId !== categoryId);
    return categories.length < before;
  },

  // Product operations
  listProducts(categoryId?: string): Product[] {
    return (categoryId ? products.filter((p) => p.categoryId === categoryId) : products).slice();
  },
  createProduct(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...input,
      id: id(),
      createdAt: now(),
      updatedAt: now(),
    };
    products.push(newProduct);
    return newProduct;
  },
  updateProduct(productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Product | null {
    const p = products.find((p) => p.id === productId);
    if (!p) return null;
    Object.assign(p, updates);
    p.updatedAt = now();
    return p;
  },
  deleteProduct(productId: string): boolean {
    const before = products.length;
    products = products.filter((p) => p.id !== productId);
    return products.length < before;
  },
};



