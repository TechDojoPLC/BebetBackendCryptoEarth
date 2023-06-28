const fs = require("fs");
const { resolve } = require("path");
const { randomBytes } = require("crypto");
const {
  server: { pathToStaticFiles, fullBaseUrl },
  fileMaxSize,
  videoMimetype,
  imgMimetype,
} = require("../../config");
const multer = require("multer");

function multerFileFilter(req, file, cb) {
  if (![...imgMimetype, ...videoMimetype].includes(file.mimetype)) {
    return cb(new Error("goes wrong on the mimetype"), false);
  }
  cb(null, true);
}

const upload = multer({
  limits: { fileSize: fileMaxSize },
  fileFilter: multerFileFilter,
});

async function saveFileToFolder(file, path) {
  try{
    const { fileName: name, fileMimeType: mimeType, filePath, fileURL: url } = await writeFile(file, path);

    return {
      name,
      mimeType,
      path: filePath,
      url,
    };
  }catch(err){
    console.log(err)
    return false;
  }
}

function getFullFileUrl(shortUrl) {
  if (!shortUrl) {
    return null;
  }

  if (/(http(s?)):\/\//i.test(shortUrl)) {
    return shortUrl;
  } else {
    const serverURL = fullBaseUrl;
    let url = "";

    if (/^\//gi.test(shortUrl)) {
      url = shortUrl ? `${serverURL}${shortUrl}` : "";
    } else {
      url = shortUrl ? `${serverURL}/${shortUrl}` : "";
    }

    url = encodeURI(url);

    return url;
  }
}

function getFileExt(fileName) {
  return fileName.split(".").pop().toLowerCase();
}

function writeFile(file, path) {
  try{
    return new Promise((res, rej) => {
      const localPath = [...path];
      const urlPath = path.join("/");
  
      localPath.unshift(pathToStaticFiles);
      const pathToWriteFile = resolve(...localPath);
  
      const fileName = randomBytes(8).toString("hex");
      const fileExtension = getFileExt(file.name);
      const fileFullName = `${fileName}.${fileExtension}`;
      const fileURL = `/files/${urlPath}/${fileFullName}`;
      const filePath = resolve(pathToWriteFile, fileFullName);
  
      fs.mkdir(pathToWriteFile, { recursive: true }, (error) => {
        if (error) {
          rej(error);
        }
  
        fs.writeFile(filePath, file.data, (error) => {
          if (error) {
            rej(error);
          }
  
          res({
            fileName: file.name,
            filePath: filePath,
            fileMimeType: file.mimetype,
            fileURL: fileURL,
          });
        });
      });
    });
  }catch(err){
    console.log(err)
  }

}

function copyFile(source) {
  const regexpFileName = /[0-9a-zA-Z]+\.[a-z]+$/;

  const path = source.path.replace(regexpFileName, "");
  const url = source.url.replace(regexpFileName, "");
  const oldFileName = source.path.match(regexpFileName)[0];

  const fileName = randomBytes(8).toString("hex");
  const fileExtension = getFileExt(oldFileName);
  const newFileNameWithType = `${fileName}.${fileExtension}`;

  const rd = fs.createReadStream(source.path);
  const wr = fs.createWriteStream(path + newFileNameWithType);

  return new Promise(function (resolve, reject) {
    rd.on("error", reject);
    wr.on("error", reject);
    wr.on("finish", () => {
      resolve({
        name: source.name,
        mimeType: source.mimeType,
        path: path + newFileNameWithType,
        url: url + newFileNameWithType,
      });
    });
    rd.pipe(wr);
  }).catch(function (error) {
    rd.destroy();
    wr.end();
    throw error;
  });
}

function deleteFile(pathToFile) {
  return new Promise((res) => {
    fs.unlink(pathToFile, (error) => {
      if (error) {
        console.error(error);
      }

      res();
    });
  });
}

function deleteAllInFolder(pathToFolder) {
  return new Promise((res) => {
    pathToFolder = resolve(pathToStaticFiles, pathToFolder);

    fs.rmdir(pathToFolder, { recursive: true }, (error) => {
      console.error(error);
    });

    res();
  });
}

async function ReadFile(pathToFile){
  return fs.readFile(pathToFile, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    return data;
  });
}
module.exports = {
  upload,
  ReadFile,
  saveFileToFolder,
  getFullFileUrl,
  getFileExt,
  writeFile,
  copyFile,
  deleteFile,
  deleteAllInFolder,
};
