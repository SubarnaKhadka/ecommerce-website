import { config } from '../config';
import { esClient } from './client';

export async function indexDoc(index: string, doc: any) {
  await esClient.index({
    index,
    id: String(doc.id),
    document: doc,
  });

  // auto-refresh every second, only for development for immediate search visibility
  if (config.app.app_env === 'development') {
    await esClient.indices.refresh({ index });
  }
}

export async function indexBulkDoc(index: string, docs: any[]) {
  const ops: any[] = [];

  for (const doc of docs) {
    ops.push({
      index: { _index: index, _id: String(doc.id) },
    });
    ops.push(doc);
  }
  const result = await esClient.bulk({ body: ops });

  if (result.errors) {
    console.error('Bulk insert had errors:', result.items);
  }

  if (config.app.app_env === 'development') {
    await esClient.indices.refresh({ index });
  }
}

export async function deleteDocFromIndex(index: string, id: string) {
  await esClient.delete({
    index,
    id: String(id),
  });
}
