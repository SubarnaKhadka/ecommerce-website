export interface ITenant {
  id?: number;
  name: string;
  domain: string;
  dedicated_db?: boolean;
  db_name: string;
}
