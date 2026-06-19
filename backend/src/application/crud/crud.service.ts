import type { CrudRepository } from '../../domain/repositories/crud.repository.js'

export class CrudApplicationService<TEntity, TCreate, TUpdate, TList = TEntity, TId extends string | number = string | number> {
  constructor(private readonly repository: CrudRepository<TEntity, TCreate, TUpdate, TList, TId>) {}

  list(): Promise<TList[]> {
    return this.repository.list()
  }

  getById(id: TId): Promise<TList | null> {
    return this.repository.findById(id)
  }

  create(input: TCreate): Promise<TList> {
    return this.repository.create(input)
  }

  update(id: TId, input: TUpdate): Promise<TList> {
    return this.repository.update(id, input)
  }

  delete(id: TId): Promise<void> {
    return this.repository.delete(id)
  }
}
