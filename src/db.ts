import Dexie, { Table } from 'dexie'
import { Concern, NextAction, Tag } from './types'

export class OttaDoDB extends Dexie {
  concerns!: Table<Concern, number>
  nextActions!: Table<NextAction, number>
  tags!: Table<Tag, number>

  constructor() {
    super('OttaDoDB')
    this.version(6)
      .stores({
        concerns: '++id, createdAt',
        nextActions:
          '++id, createdAt, minutesEstimate, effort, priority, *tags, completedAt, concernId',
        tags: '++id, name, category, usedCount, filteredCount',
      })
      .upgrade(async (tx) => {
        return tx
          .table('tags')
          .toCollection()
          .modify((tag) => {
            tag.filteredCount = 0
          })
      })
  }
}

export const db = new OttaDoDB()
