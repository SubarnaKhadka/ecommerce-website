import { Client } from '@elastic/elasticsearch';
import { config } from '../config';

const { url, user, password } = config.elastic;

export const esClient = new Client({
  node: url,
  auth: {
    username: user,
    password: password,
  },
});
