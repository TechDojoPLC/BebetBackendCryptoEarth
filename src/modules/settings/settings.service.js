const {
  Types: { ObjectId },
} = require("mongoose");

const {
  auth,
  server: { fullBaseUrl, clientUrl },
} = require("../../config");
const localization = require("../../localizations/en.json");

const { status } = require("./settings.constants");
const { GameSession, Settings } = require("../../utils/dbs");
const { params} = require("../../utils/globals");
const { CompleteBets } = require("../bet/bet.service");


const sendWebSocketMessage = (wsClient, content) => {
  if (wsClient) wsClient.send(JSON.stringify(content));
}


const Create = async (req) => {
  let settings = await Settings.find({})
  if (settings.length == 0){
    let newSettings = await Settings.create(req.body)
    return newSettings
  }
  throw new Error("Settings already made!")
}


const Get = async () => {
  let settings = await Settings.find({})
  if (settings.length > 0){
    return settings[0]
  }
  let curSet = await Create({max_multiplier: 20.0,min_multiplier: 1.0,  speed: 1, is_active: true, crash_chance: 10,min_bot_count: 4, max_bot_count: 10})
  return curSet
}
const Update = async (req) => {
  const {max_multiplier, min_multiplier, speed, is_active,crash_chance,min_bot_count,max_bot_count} = req.body
  let settings = await Settings.find({})
  if (settings.length > 0){
    if (max_multiplier < min_multiplier || max_multiplier < 0 || min_multiplier < 0) throw new Error("No valid data!")
    if (max_multiplier) settings[0].max_multiplier = max_multiplier
    if (min_multiplier) settings[0].min_multiplier = min_multiplier
    if (speed) settings[0].speed = speed
    if (is_active) settings[0].is_active = is_active
    if (crash_chance) settings[0].crash_chance = crash_chance
    if (min_bot_count) settings[0].min_bot_count = min_bot_count
    if (max_bot_count) settings[0].max_bot_count = max_bot_count
    await settings[0].save();
    return settings[0]
  }
  throw new Error("Settings not exists!")
}

module.exports = {
  Create,
  Get,
  Update,
};
