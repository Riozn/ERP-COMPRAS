import assert from 'node:assert/strict'
import test from 'node:test'

import { CrudApplicationService } from '../src/application/crud/crud.service.js'

test('crud application service delegates list and mutations to repository', async () => {
  const calls: string[] = []
  const repository = {
    async list() {
      calls.push('list')
      return [{ id: 1, name: 'alpha' }]
    },
    async findById(id: number) {
      calls.push(`find:${id}`)
      return { id, name: 'alpha' }
    },
    async create(input: { name: string }) {
      calls.push(`create:${input.name}`)
      return { id: 2, name: input.name }
    },
    async update(id: number, input: { name?: string }) {
      calls.push(`update:${id}:${input.name ?? ''}`)
      return { id, name: input.name ?? 'beta' }
    },
    async delete(id: number) {
      calls.push(`delete:${id}`)
    },
  }

  const service = new CrudApplicationService(repository)

  assert.deepEqual(await service.list(), [{ id: 1, name: 'alpha' }])
  assert.deepEqual(await service.getById(7), { id: 7, name: 'alpha' })
  assert.deepEqual(await service.create({ name: 'gamma' }), { id: 2, name: 'gamma' })
  assert.deepEqual(await service.update(9, { name: 'delta' }), { id: 9, name: 'delta' })
  await service.delete(11)

  assert.deepEqual(calls, [
    'list',
    'find:7',
    'create:gamma',
    'update:9:delta',
    'delete:11',
  ])
})
