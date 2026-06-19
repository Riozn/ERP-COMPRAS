import type {
  DataSource,
  DeepPartial,
  EntityTarget,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm'

import { NotFoundError } from '../../../shared/errors/http-error.js'
import type { CrudRepository } from '../../../domain/repositories/crud.repository.js'

export type TypeormRepositorySource = Pick<DataSource, 'getRepository'>

type TypeormCrudConfig<TEntity extends ObjectLiteral, TCreate, TUpdate, TList, TId extends string | number> = {
  entity: EntityTarget<TEntity>
  order?: FindOptionsOrder<TEntity>
  map(entity: TEntity): TList
  buildWhere(id: TId): FindOptionsWhere<TEntity>
  buildCreate(input: TCreate): DeepPartial<TEntity>
  applyUpdate(entity: TEntity, input: TUpdate): void
}

export function createTypeormCrudRepository<TEntity extends ObjectLiteral, TCreate, TUpdate, TList, TId extends string | number>(
  dataSource: TypeormRepositorySource,
  config: TypeormCrudConfig<TEntity, TCreate, TUpdate, TList, TId>,
): CrudRepository<TEntity, TCreate, TUpdate, TList, TId> {
  const repository = dataSource.getRepository(config.entity)

  return {
    async list(): Promise<TList[]> {
      const entities = config.order
        ? await repository.find({ order: config.order })
        : await repository.find()
      return entities.map(config.map)
    },

    async findById(id: TId): Promise<TList | null> {
      const entity = await repository.findOne({ where: config.buildWhere(id) })
      return entity ? config.map(entity) : null
    },

    async create(input: TCreate): Promise<TList> {
      const entity = repository.create(config.buildCreate(input))
      const saved = await repository.save(entity)
      return config.map(saved)
    },

    async update(id: TId, input: TUpdate): Promise<TList> {
      const current = await repository.findOne({ where: config.buildWhere(id) })
      if (!current) {
        throw new NotFoundError('Registro no encontrado.')
      }

      config.applyUpdate(current, input)
      const saved = await repository.save(current)
      return config.map(saved)
    },

    async delete(id: TId): Promise<void> {
      await repository.delete(config.buildWhere(id))
    },
  }
}
