let filters = [
  {tag: "testbank", enabled: true},
  {tag: "common", enabled: false},
  {tag: "game_session", enabled: true},
  {tag: "websocket_game", enabled: true},
]
function log(data, tag) {
  let isFiltered = false
  for (let i = 0; i < filters.length; i++){
    if (filters[i].tag === tag){
      if (filters[i].enabled){
        isFiltered = true;
        break;
      }
    }
  }
  if (isFiltered){
    console.log(data)
    return true
  }
  return false
}

module.exports = {
  log,
};
