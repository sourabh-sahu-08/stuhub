import type { Model, Document, FilterQuery } from "mongoose";

export interface PaginationResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string | Record<string, any>;
  populate?: string | string[] | any;
}

export async function paginate<T extends Document>(
  model: Model<T>,
  query: FilterQuery<T> = {},
  options: PaginationOptions = {}
): Promise<PaginationResult<T>> {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Number(options.limit || 10));
  const skip = (page - 1) * limit;

  const totalDocs = await model.countDocuments(query);
  const totalPages = Math.ceil(totalDocs / limit);

  let dbQuery = model.find(query).skip(skip).limit(limit);

  if (options.sort) {
    dbQuery = dbQuery.sort(options.sort);
  }

  if (options.populate) {
    dbQuery = dbQuery.populate(options.populate);
  }

  const docs = await dbQuery.exec();

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}
