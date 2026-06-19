import type { ReferenceCatalogs } from '../../core/auth/auth.types'

export type Article = {
  id: string
  itemCode: string
  itemName: string
  descripcion: string | null
  unidadMedida: string
  costoEstandar: string
  grupoId: number
  impuestoId: number
  activo: boolean
  createdAt: string
  updatedAt: string
}

export type ArticleFormValues = {
  itemCode: string
  itemName: string
  descripcion: string
  unidadMedida: string
  costoEstandar: string
  grupoId: string
  impuestoId: string
  activo: boolean
}

export type ArticleFormErrors = Partial<Record<keyof ArticleFormValues, string>>

export type ArticleCatalogs = Pick<ReferenceCatalogs, 'gruposArticulo' | 'impuestos'>

export type ArticleListResponse = {
  items: Article[]
}

export type ArticleItemResponse = {
  item: Article
}

export const emptyArticleFormValues: ArticleFormValues = {
  itemCode: '',
  itemName: '',
  descripcion: '',
  unidadMedida: 'UNI',
  costoEstandar: '0',
  grupoId: '',
  impuestoId: '',
  activo: true,
}
