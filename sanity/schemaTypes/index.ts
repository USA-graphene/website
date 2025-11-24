import { type SchemaTypeDefinition } from 'sanity'
import post from './post'
import author from './author'
import category from './category'
import product from './product'
import application from './application'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, author, category, product, application],
}
