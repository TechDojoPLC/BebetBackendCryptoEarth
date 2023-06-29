const express = require("express");
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const { routeNotFound } = require("./middlewares/notFoundPage");
const { server, mongodbParams } = require("./config");
const auth = require("auth-vk").Zeuvs;
const passport = require("passport");
const app = express();
const fileupload = require("express-fileupload");
const fs = require('fs');
const https = require("https");
const { createPaymentUrl } = require("./modules/in_transaction/in_transaction.service");
const { Callback, CallbackCancel } = require("./modules/in_transaction/in_transaction.controller");
const { Bank, User } = require("./utils/dbs");

const { makeSMTPService } = require("./utils/sendSMTP");
const http = require('http')
const {wsServerChat, wsServerGame} = require("./utils/websocketCommon.js");
const { AttachUserByTokenOrUserData, AttachRefUserByTokenOrUserData } = require("./utils/auth/attachUser");
const { CatchTraffic } = require("./modules/ref_refs/ref_refs.controller");
const { sheduleGameSessionStart } = require("./utils/schedules");
const gameSessionController = require("./modules/game_session/game_session.controller");
const { log } = require("./utils/debug");


app.use(express.static(__dirname + "../public"));
const options = { 
  key: fs.readFileSync("./src/ssl_cert/key.key"), 
  cert: fs.readFileSync("./src/ssl_cert/cert.csr") 
}

app.use(fileupload());
const corsOptions = {
  origin: true,
  credentials: true,
  
};
app.use(cors(corsOptions));

app.use(bodyParser.json({    parameterLimit: 100000,
  limit: '50mb'}));
app.use(bodyParser.urlencoded({    parameterLimit: 100000,
  limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: server.secretSession,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
const showInConsole = (req,res,next)=>{
  if (req.path === "/api/v1/in_transaction/callback"){
    log(new Date() + ": " + req.path, "common")
    //console.log("TOKEN " + req.headers.authorization);
    log(req.body, "common")
    //console.log(req.params)
    //console.log(req.file)
    //console.log(req.files)
  }
  next()
}



app.use(showInConsole)



passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new auth(
    {
      clientID: process.env.vkClientId,
      clientSecret: process.env.vkClientSecret,
      callbackURL: "https://api-wellink-test.online/api/v1/auth/vk_callback",
      scope: ["offline", "groups", "email", "friends"],
      profileFields: ["offline", "groups", "email", "friends"],
    },
    async function verify(accessToken, refreshToken, params, profile, done) {
      process.nextTick(function () {
        done(null, profile);
      });
    }
  )
);


app.use("/api/v1/files", express.static(server.pathToStaticFiles));
app.use("/files", express.static(server.pathToStaticFiles));
app.use("/api/v1/auth", require("./modules/auth/auth.router"));
app.use("/api/v1/ref_auth", require("./modules/ref_auth/ref_auth.router"));
app.use("/api/v1/ref_refs/CatchTraffic", CatchTraffic);
app.use("/api/v1/confirmation", require("./modules/confirmation/confirmation.router"));
app.use("/api/v1/game_session", require("./modules/game_session/game_session.router"));
app.use("/api/v1/game_session/getAll/:count", gameSessionController.GetAll);
app.use("/api/v1/game_session/getAll", gameSessionController.GetAll);

app.use("/api/v1/bet", require("./modules/bet/bet.router"));
app.use("/api/v1/in_transaction/callback", Callback)
app.use("/api/v1/in_transaction/callback_cancel", CallbackCancel)


app.use("/api/v1/admin", AttachUserByTokenOrUserData, require("./modules/admin/admin.router"));
app.use("/api/v1/chat", AttachUserByTokenOrUserData, require("./modules/chat/chat.router"));
app.use("/api/v1/wallet", AttachUserByTokenOrUserData, require("./modules/wallet/wallet.router"));
app.use("/api/v1/chat_message", AttachUserByTokenOrUserData, require("./modules/chat_message/chat_message.router"));
app.use("/api/v1/user", AttachUserByTokenOrUserData, require("./modules/user/user.router"));
app.use("/api/v1/game_session", AttachUserByTokenOrUserData, require("./modules/game_session/game_session.router"));
app.use("/api/v1/transaction", AttachUserByTokenOrUserData, require("./modules/transaction/transaction.router"));
app.use("/api/v1/in_transaction", AttachUserByTokenOrUserData, require("./modules/in_transaction/in_transaction.router"));
app.use("/api/v1/out_transaction", AttachRefUserByTokenOrUserData, require("./modules/out_transaction/out_transaction.router"));
//Ref routes
app.use("/api/v1/ref_user", AttachRefUserByTokenOrUserData, require("./modules/ref_user/ref_user.router"));
app.use("/api/v1/ref_wallet", AttachRefUserByTokenOrUserData, require("./modules/ref_wallet/ref_wallet.router"));
app.use("/api/v1/ref_transaction", AttachRefUserByTokenOrUserData, require("./modules/ref_transaction/ref_transaction.router"));
app.use("/api/v1/ref_refs", AttachRefUserByTokenOrUserData, require("./modules/ref_refs/ref_refs.router"));
app.use("/api/v1/out_ref_transaction", AttachRefUserByTokenOrUserData, require("./modules/out_ref_transaction/out_ref_transaction.router"));


app.use(errorHandler);
app.use(routeNotFound);
app.listen(3030, async () => {
  console.log(`Server is working on port ${3030}`);
  mongoose
    .connect(server.mongodbConnectionUrl, mongodbParams) 
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));
  //require("./cron");
  wsServerChat.runWebSocketServer();
  wsServerGame.runWebSocketServer();
  //wsServerTranslation.runWebSocketServer();
  makeSMTPService();
  getOrCreateMainBank();
  sheduleGameSessionStart();
  /*
  let user = await User.find({})

  let t = await createPaymentUrl({user: user[0], body: {amount: 1000, currency: "RUB"}})
  console.log(t)
  */
});


https.createServer(options, app).listen(server.port); 
const getOrCreateMainBank = async () => {
  let banks = await Bank.find({})
  if (banks.length == 0){
    let bank = await Bank.create({})
  }
}

http.createServer((req,res) => {
  console.log(req.query)
  console.log(req.body)
  res.writeHead(200, {"Content-Type": "text/plain"})
  res.write("OK")
  res.end()
}).listen(443)


