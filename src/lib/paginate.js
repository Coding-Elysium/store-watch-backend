export const paginate = async (
  model,
  { filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, select = "" }
) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    model.find(filter).select(select).sort(sort).skip(skip).limit(limitNum),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    total,
    totalPages,
    currentPage: pageNum,
    data,
  };
};
