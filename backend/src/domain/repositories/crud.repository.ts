export type CrudId = string | number

export interface CrudRepository<TEntity, TCreate, TUpdate, TList = TEntity, TId extends CrudId = CrudId> {
  list(): Promise<TList[]>
  findById(id: TId): Promise<TList | null>
  create(input: TCreate): Promise<TList>
  update(id: TId, input: TUpdate): Promise<TList>
  delete(id: TId): Promise<void>
}
