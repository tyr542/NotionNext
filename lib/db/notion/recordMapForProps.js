const RECORD_RUNTIME_METADATA_FIELDS = [
  'version',
  'created_by_table',
  'created_by_id',
  'last_edited_by_table',
  'last_edited_by_id',
  'space_id',
  'parent_table',
  'copied_from_pointer',
  'copied_from',
  'permissions',
  'alive',
  'shard_id',
  'created_time',
  'last_edited_time'
]

const FORMAT_RUNTIME_METADATA_FIELDS = [
  'copied_from_pointer',
  'block_locked_by'
]

function stripFields(target, fields) {
  if (!target || typeof target !== 'object') {
    return
  }

  fields.forEach(field => {
    delete target[field]
  })
}

function unwrapRecordValue(record) {
  if (record?.value?.value && typeof record.value.value === 'object') {
    return record.value.value
  }

  if (record?.value && typeof record.value === 'object') {
    return record.value
  }

  return record && typeof record === 'object' ? record : null
}

function shrinkRecordSection(section) {
  if (!section || typeof section !== 'object') {
    return
  }

  Object.values(section).forEach(record => {
    const recordValue = unwrapRecordValue(record)
    if (!recordValue) {
      return
    }

    stripFields(recordValue, RECORD_RUNTIME_METADATA_FIELDS)
    stripFields(recordValue.format, FORMAT_RUNTIME_METADATA_FIELDS)
  })
}

export function shrinkRecordMapForPageProps(recordMap) {
  if (!recordMap || typeof recordMap !== 'object') {
    return recordMap
  }

  shrinkRecordSection(recordMap.block)
  shrinkRecordSection(recordMap.collection)
  shrinkRecordSection(recordMap.collection_view)

  if (
    recordMap.notion_user &&
    typeof recordMap.notion_user === 'object' &&
    Object.keys(recordMap.notion_user).length === 0
  ) {
    delete recordMap.notion_user
  }

  return recordMap
}

export function createNoticePreview(notice) {
  if (!notice || typeof notice !== 'object') {
    return notice
  }

  const preview = { ...notice }
  delete preview.blockMap
  return preview
}
