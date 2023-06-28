function getPaginationInfo(
  { value: offset, default: defaultOffset = 0 },
  { value: limit, default: defaultLimit = 10 }
) {
  const newOffset = !+offset || offset < 0 ? defaultOffset : +offset;
  const newLimit = !+limit || limit < 1 ? defaultLimit : +limit;

  return {
    offset: newOffset,
    limit: newLimit,
  };
}

module.exports = {
  getPaginationInfo,
};
