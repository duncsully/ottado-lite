import Dexie, { Table } from 'dexie'
import { Concern, NextAction, Tag } from './types'

export class OttaDoDB extends Dexie {
  concerns!: Table<Concern, number>
  nextActions!: Table<NextAction, number>
  tags!: Table<Tag, number>

  constructor() {
    super('OttaDoDB')
    this.version(1).stores({
      concerns: '++id, createdAt',
      nextActions: '++id, createdAt, minutesEstimate, effort, priority, tags',
      tags: '++id, category, usedCount',
    })
  }
}

export const db = new OttaDoDB()
