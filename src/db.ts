import Dexie, { Table } from 'dexie'
import { Concern, NextAction, Tag } from './types'

export class OttaDoDB extends Dexie {
  concerns!: Table<Concern, number>
  nextActions!: Table<NextAction, number>
  tags!: Table<Tag, number>

  constructor() {
    super('OttaDoDB')
    this.version(9)
      .stores({
        concerns: '++id, createdAt',
        nextActions:
          '++id, title, createdAt, minutesEstimate, effort, priority, *tags, completedAt, concernId',
        tags: '++id, name, category, usedCount, filteredCount',
      })
      // Add number of times a tag has been filtered by
      .upgrade(async (tx) => {
        return tx
          .table('tags')
          .toCollection()
          .modify((tag) => {
            tag.filteredCount = 0
          })
      })
      // Add dependencies to next actions
      .upgrade(async (tx) => {
        return tx
          .table('nextActions')
          .toCollection()
          .modify((na) => {
            na.dependencies = []
          })
      })
      // Normalize relationship between next actions and tags
      .upgrade(async (tx) => {
        const tags: Tag[] = await tx.table('tags').toArray()
        const tagIdMap = tags.reduce((acc, tag) => {
          acc[tag.name] = tag.id!
          return acc
        }, {} as Record<string, number>)
        return tx
          .table('nextActions')
          .toCollection()
          .modify((na) => {
            na.tags = (na.tags as string[]).reduce(
              (tagIds, tagName: string) => {
                if (tagName in tagIdMap) {
                  tagIds.push(tagIdMap[tagName])
                }
                return tagIds
              },
              [] as number[]
            )
          })
      })
  }
}

export const db = new OttaDoDB()
