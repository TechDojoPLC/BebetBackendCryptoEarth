const { resolve } = require("path");

require("dotenv").config();

const dbName = "bet";
const apiVersion = "0.0.2";

const ports = {
  local: 3012,
  dev: 3012,
  prod: 3012,
};

const urls = {
  server: {
    local: {
      url: "http://localhost",
      mongoUrl: `mongodb://localhost:27017/${dbName}`,
      pathToStaticFiles: resolve(__dirname, "..", "..", `${dbName}-uploads`),
      pathToAssets: resolve(__dirname, "..", `assets`),
    },
    dev: {
      mongoUrl: `mongodb://localhost:27017/${dbName}`,
      pathToStaticFiles: resolve(__dirname, "..", "..", `${dbName}-uploads`),
      pathToAssets: resolve(__dirname, "..", `assets`),
    },
    prod: {
      mongoUrl: `mongodb://localhost:27017/${dbName}`,
      pathToStaticFiles: resolve(__dirname, "..", "..", `${dbName}-uploads`),
      pathToAssets: resolve(__dirname, "..", `assets`),
    },
  },
  client: {
    local: {
      url: "http://localhost:3000",
    },
    dev: {
      url: "",
    },
    prod: {
      url: "",
    },
  },
};

const server = {
  secretSession: process.env.secretSession,
  port: ports.dev,
  baseUrl: urls.server.dev.url,
  fullBaseUrl: urls.server.dev.url,
  clientUrl: urls.client.dev.url,
  mongodbConnectionUrl: urls.server.dev.mongoUrl,
  apiVersion,
  pathToStaticFiles: urls.server.dev.pathToStaticFiles,
  pathToAssets: urls.server.dev.pathToAssets,
};

switch (process.env.NODE_ENV) {
  case "local":
    server.port = ports.local;
    server.baseUrl = urls.server.local.url;
    server.fullBaseUrl = `${urls.server.local.url}:${ports.local}`;
    server.clientUrl = urls.client.local.url;
    server.mongodbConnectionUrl = urls.server.local.mongoUrl;
    server.apiVersion;
    server.pathToStaticFiles = urls.server.local.pathToStaticFiles;
    server.pathToAssets = urls.server.local.pathToAssets;
    break;
  case "prod":
    server.port = ports.prod;
    server.baseUrl = urls.server.prod.url;
    server.fullBaseUrl = urls.server.prod.url;
    server.clientUrl = urls.client.prod.url;
    server.mongodbConnectionUrl = urls.server.prod.mongoUrl;
    break;
}

const mongodbParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

const auth = {
  secret: process.env.JWT_SECRET || "SWpjFdOaVcLnHVmn",
  tokenLife: process.env.SECRET_TOKEN_LIFE || "86400000",
  reset_password: process.env.JWT_RESET_PASSWORD || "asfknkasv",
  refreshTokenSecret: process.env.JWT_REFRESH || "qhcXtwLXNketNBpJ",
};

const facebookCredentials = {
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: `${server.baseUrl}/api/v1/auth/facebook/callback`,
  successURL: `${server.clientUrl}`,
  failureURL: `${server.clientUrl}/login-failed`,
};

const googleCredentials = {
  googleClientIdFirebase: process.env.GOOGLE_CLIENT_ID_FIREBASE,
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${server.baseUrl}/api/v1/auth/google/callback`,
  successURL: `${server.clientUrl}`,
  failureURL: `${server.clientUrl}/login-failed`,
};

const devicePlatforms = {
  android: "android",
  ios: "ios",
};

const imgMimetype = [
  "image/gif",
  "image/jpeg",
  "image/png",
];

const videoMimetype = ["video/3gpp", "video/x-flv", "video/mp4", "video/quicktime"];

const fileMaxSize = 52428800; // 50mb ( 50*(1024*1024) )



module.exports = {
  server,
  urls,
  mongodbParams,
  auth,
  devicePlatforms,
  imgMimetype,
  videoMimetype,
  fileMaxSize,
};
