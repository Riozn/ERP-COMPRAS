import { requestJson } from '../../core/http/apiClient'
import type { Article, ArticleFormValues, ArticleItemResponse, ArticleListResponse } from './articles.types'

function toPayload(values: ArticleFormValues) {
  return {
    itemCode: values.itemCode.trim(),
    itemName: values.itemName.trim(),
    descripcion: values.descripcion.trim() || null,
    unidadMedida: values.unidadMedida.trim() || 'UNI',
    costoEstandar: values.costoEstandar.trim() || '0',
    grupoId: Number(values.grupoId),
    impuestoId: Number(values.impuestoId),
    activo: values.activo,
  }
}

export function fetchArticles(): Promise<Article[]> {
  return requestJson<ArticleListResponse>('/admin/masters/items').then((response) => response.items)
}

export function createArticle(values: ArticleFormValues): Promise<Article> {
  return requestJson<ArticleItemResponse>('/admin/masters/items', {
    method: 'POST',
    body: toPayload(values),
  }).then((response) => response.item)
}

export function updateArticle(id: string, values: ArticleFormValues): Promise<Article> {
  return requestJson<ArticleItemResponse>(`/admin/masters/items/${id}`, {
    method: 'PATCH',
    body: toPayload(values),
  }).then((response) => response.item)
}

export function deleteArticle(id: string): Promise<void> {
  return requestJson<void>(`/admin/masters/items/${id}`, {
    method: 'DELETE',
  })
}
