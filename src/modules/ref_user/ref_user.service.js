const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { RefUser, User, Wallet, Bet, RefRefs, RefReferenceTrack} = require("../../utils/dbs");

const { messages } = require("../../utils/localization");

const { saveFileToFolder } = require("../../utils/file/fileHelper");
const localization = require("../../utils/localization");
const { Create } = require("../ref_wallet/ref_wallet.service");


async function Registrate(data) {
  const {email, password, name, communicationType, partnershipType, promocode, reference} = data
  if (!email || !password || !communicationType || !partnershipType || !name){
    throw new Error(messages.ERRORS.USER.USER_IS_NOT_CONFIRMED)
  }
  let isExists = await RefUser.exists({email: email})
  if (isExists){
    throw new Error(messages.ERRORS.USER.USER_EMAIL_EXISTS)
  }
  if (password.length <= process.env.password_min_length || password.length >= process.env.password_max_length)
  {
    throw new Error(messages.ERRORS.USER.PASSWORD_MUST_HAS_MORE_THEN_8_CHARACTERS)
  }
  const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
  let enc = await bcrypt.hash(password, salt);
  let refString = await bcrypt.hash(email,salt);

  let usrDat = {
    email: email, password: enc, ref_string:refString, communicationType:communicationType,partnershipType:partnershipType, name:name
  }
  if (promocode)
  {
    usrDat.promocode = promocode
  }

  if (reference){
    usrDat.reference = reference
  }

  let createdUser = await RefUser.create(usrDat)
  let walletUser = await Create({_id: createdUser._id})
  return true;
}
async function Authorize(req) {
  return {token: req.token};
}
async function GetCurrentUser(req) {
  if (req.user){
    return req.user
  }
  throw new Error("No user found!")
}
async function updateData(req) {
  if (req.user){
    const {data} = req.body
    if (!data){
      throw new Error("")
    }
    const {email, password, name, communicationType, partnershipType, trafficSource} = data;
    let foundUser = await RefUser.findOne({_id: req.user._id})

    if (password){
      if (password.length <= process.env.password_min_length || password.length >= process.env.password_max_length)
      {
        throw new Error(localization.messages.ERRORS.USER.PASSWORD_MUST_HAS_MORE_THEN_8_CHARACTERS)
      }
      let isOldValid = await bcrypt.compare(newPassword, foundUser.password);
      if (isOldValid){
        throw new Error(localization.messages.ERRORS.USER.NEW_PASSWORD_MUST_BE_DIFFERENT)
      }
      let isEq = await bcrypt.compare(oldPassword, foundUser.password)
      if (!isEq){
        throw new Error(localization.messages.ERRORS.USER.OLD_PASSWORD_IS_WRONG)
      }
      const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
      let enc = await bcrypt.hash(newPassword, salt);
      foundUser.password = enc;
    }
    if (email){
      let isUsed = await RefUser.findOne({email: email})
      if (isUsed){
        throw new Error(localization.messages.ERRORS.USER.USER_EMAIL_EXISTS)
      }
      foundUser.email = email;
    }
    if (name){
      foundUser.name = name
    }
    if (communicationType){
      foundUser.communicationType = communicationType;
    }
    if (partnershipType){
      foundUser.partnershipType = partnershipType;
    }
    if (trafficSource){
      foundUser.trafficSource = trafficSource;
    }
    
    await foundUser.save();
    req.user = foundUser;
    return true;
  }
  throw new Error("No user found!")
}
async function getAllReferent(req) {
  if (req.user){
    
    let referends = await User.find({refferend: req.user._id})
    let res = []
    for (let i = 0; i < referends.length; i ++){
      let copyRef = {}
      Object.assign(copyRef, referends[i]._doc)
      copyRef.password = null;
      let statistics = {}

      // Дата
      statistics.date = new Date()

      // Переходы
      statistics.traffic = 0

      // Дата регистрации

      if (!referends[i].connection_date){
        statistics.connection_date = new Date();
      }else{
        statistics.connection_date = referends[i].connection_date
      }

      // Первые депозиты
      statistics.depositsFirst = 0

      // Количество депозитов
      statistics.depositsCount = 0

      // Сумма депозитов
      statistics.depositsSummary = 0

      // Повторные депозиты
      statistics.depositsRepeat = 0

      // Кол-во ставок
      let countBets = await Bet.find({user: referends[i]._id})
      let betsCount = countBets.length;
      statistics.betsCount = betsCount

      // Сумма ставок
      let summaryBets = await Bet.find({user: referends[i]._id})
      let betsSummary = 0;
      for (let sb = 0; sb < summaryBets.length; sb++){
        betsSummary += Number(summaryBets[sb].value)
      }
      statistics.betsSummary = betsSummary

      // Общий проигрыш
      let losedBets = await Bet.find({user: referends[i]._id, is_won: false})
      let losedSummary = 0;
      for (let lb = 0; lb < losedBets.length; lb++){
        losedSummary += Number(losedBets[lb].value)
      }
      statistics.losedSummary = losedSummary
      
      // Общий выигрыш
      let winnedBets = await Bet.find({user: referends[i]._id, is_won: true})
      let winnedSummary = 0;
      for (let wb = 0; wb < winnedBets.length; wb++){
        winnedSummary += (Number(winnedBets[wb].value) * Number(winnedBets[wb].multiplier))
      }
      statistics.winnedSummary = winnedSummary

      // Общая разница

      let betsDiff = winnedSummary - losedSummary;
      statistics.betsDiff = betsDiff

      // Бонус

      let bonus = 0;
      statistics.bonus = bonus


      // Доход

      let income = losedSummary * Number(process.env.percentToRef);
      statistics.income = income

      copyRef.statistics = statistics;
      res.push(copyRef);
    }
    return res;
  }
  throw new Error("No user found!")
}
async function getRefUserDefended({_id}){
  let refUser = await RefUser.findOne({_id: _id});
  if (refUser){
    return refUser;
  }
  return null;
}
async function getDashboard(req){
  if (req.user){
    let referends = await User.find({refferend: req.user._id})
    let refs = await RefRefs.find({user: req.user._id})
    
    let statistics = { }
    // Переходы
    statistics.traffic = 0;
    for (let i = 0; i < refs.length; i++){
      statistics.traffic += refs[i].traffic
    }

    // Регистрации
    statistics.registractions = referends.length;

    // Ратио по регистрация
    statistics.ratioTrafficRegistration = Number(statistics.traffic)/Number(statistics.registractions)

    // Средний доход с игрока
    statistics.avgIncome = 0
    for (let i = 0; i < referends.length; i ++){
      let losedBets = await Bet.find({user: referends[i]._id, is_won: false})
      let losedSummary = 0;
      for (let lb = 0; lb < losedBets.length; lb++){
        losedSummary += Number(losedBets[lb].value)
      }
      statistics.avgIncome += losedSummary * Number(process.env.percentToRef);
    }
    statistics.avgIncome = statistics.avgIncome/referends.length;

    // Переходы2
    statistics.traffic2 = 0;

    // Первые депозиты
    statistics.depositsFirst = 0

    // Количество депозитов
    statistics.depositsCompleted = 0

    // Ратио депозитов
    statistics.depositsRatio = 0

    // Повторные депозиты
    statistics.depositsSummary = 0

    // Повторные депозиты
    statistics.trafficPrice = 0

    return statistics;
  }
  throw new Error("No user found!")
}
async function getDashboardByDate(req){
  if (req.user){
    const {start_date} = req.body
    if (!start_date){
      throw new Error("No date provided!")
    }
    let referends = await User.find({refferend: req.user._id})
    let refs = await RefRefs.find({user: req.user._id})
    
    let statistics = { }
    // Переходы
    statistics.traffic = [];

    let trafRes = []
    for (let i = 0; i < refs.length; i++){
      let refRefTracks = await RefReferenceTrack.find({ref_ref: refs[i]._id, createdAt: {$lt: start_date}})
      for (let j = 0; j < refRefTracks.length; j++){
        let k = {
          date: refRefTracks[i].createdAt,
          data: 1,
        }
        trafRes.push(k)
      }
    }
    statistics.traffic = trafRes

    // Регистрации
    let referendAfterDate = await User.find({refferend: req.user._id, createdAt: {$lt: start_date}})
    let dataReg = []
    for (let i = 0; i < referendAfterDate.length; i++){
      let o = {
        date: referendAfterDate[i].createdAt,
        data: 1
      }
      dataReg.push(o)
    }
    statistics.registractions = dataReg;

    // Ратио по регистрация
    statistics.ratioTrafficRegistration = []

    // Средний доход с игрока
    statistics.avgIncome = 0

    let avgIncome = []
    for (let i = 0; i < referends.length; i ++){
      let losedBets = await Bet.find({user: referends[i]._id, is_won: false})
      for (let lb = 0; lb < losedBets.length; lb++){
        let o = {
          date: losedBets[lb].updatedAt,
          value: Number(losedBets[lb].value) * Number(process.env.percentToRef),
        }
        avgIncome.push(o)
      }
    }
    statistics.avgIncome = avgIncome;

    // Переходы2
    statistics.traffic2 = [];

    // Первые депозиты
    statistics.depositsFirst = []

    // Количество депозитов
    statistics.depositsCompleted = []

    // Ратио депозитов
    statistics.depositsRatio = []

    // Повторные депозиты
    statistics.depositsSummary = []

    // Повторные депозиты
    statistics.trafficPrice = []

    return statistics;
  }
  throw new Error("No user found!")
}
module.exports = {
  updateData,
  GetCurrentUser,
  Registrate,
  Authorize,
  getAllReferent,
  getDashboard,
  getRefUserDefended,
  getDashboardByDate
};