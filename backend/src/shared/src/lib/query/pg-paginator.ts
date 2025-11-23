import { IPaginationResult } from "shared/types/pagination/paginate.interface";
import { queryDb } from "./query-db";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: Record<string, string | undefined>;
  searchMode?: "OR" | "AND";
}

export class PgPaginator {
  private static instance: PgPaginator;

  private constructor() {}

  static init(): PgPaginator {
    if (!PgPaginator.instance) {
      PgPaginator.instance = new PgPaginator();
    }
    return PgPaginator.instance;
  }

  static getInstance(): PgPaginator {
    if (!PgPaginator.instance) {
      throw new Error(
        "PgPaginator is not initialized. Call PgPaginator.init(queryDb) first."
      );
    }
    return PgPaginator.instance;
  }

  async paginate<T>(
    table: string,
    options: PaginationOptions = {}
  ): Promise<IPaginationResult<T>> {
    const { page = 1, limit = 20, search = {}, searchMode = "OR" } = options;

    const offset = (page - 1) * limit;

    const params: any[] = [];
    const whereParts: string[] = [];

    for (const [field, value] of Object.entries(search)) {
      if (value && value.trim() !== "") {
        params.push(`%${value}%`);
        whereParts.push(`${field} ILIKE $${params.length}`);
      }
    }

    const whereClause = whereParts.length
      ? `WHERE ${whereParts.join(` ${searchMode} `)}`
      : "";

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM ${table}
      ${whereClause}
    `;

    const countResult = await queryDb(countQuery, params);
    const total = Number(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    params.push(limit);
    params.push(offset);

    const limitIndex = params.length - 1;
    const offsetIndex = params.length;

    const query = `
      SELECT *
      FROM ${table}
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;

    const result = await queryDb(query, params);

    return {
      data: result.rows,
      pagination: {
        page,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

PgPaginator.init();
