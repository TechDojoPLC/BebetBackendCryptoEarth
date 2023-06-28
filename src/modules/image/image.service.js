const mongoose = require("mongoose");

const fs = require("fs")

const { saveFileToFolder, deleteFile, ReadFile } = require("../../utils/file/fileHelper");
const { Image, User } = require("../../utils/dbs");
const { folderNameForImageContent} = require("./image.constants")


const {
  server: { pathToStaticFiles, fullBaseUrl },
  fileMaxSize,
  imgMimetype,
} = require("../../config");

const { resolve } = require("path");
async function unchainAllExistingImages(owner){
  try{
    const chained = await User.findOne({_id: owner._id}, {password: 0} )
    if (chained == null){
      throw new Error("User not found");
    }
    const imgs = await Image.find({chained: owner._id})
    for (let i = 0; i < imgs.length; i++){
      imgs[i].chained = null;
      await imgs[i].save()
    }
    return true;
  }catch(err){
    console.log(err)
    return false;
  }

}
async function createImageContent(data, user){
    const file = data;
    const folderPath = [folderNameForImageContent];
    const demoInfo = await saveFileToFolder(file, folderPath);

    const path = [folderNameForImageContent]

    const localPath = [...path];
    const urlPath = path.join("/");

    localPath.unshift(pathToStaticFiles);
    const pathToWriteFile = resolve(...localPath);
    const fileFullName = `${demoInfo.name}_1.jpg`;
    const filePath = resolve(pathToWriteFile, fileFullName);
    const fileURL = `/files/${urlPath}/${fileFullName}`;

    await fs.mkdir(pathToWriteFile, { recursive: true }, (error) => {
      if (error) {
        rej(error);
      }
    });
    const item = await Image.create({content: demoInfo, wallet: user._id})
    return item;
}
async function getImageWithContent(data){
  const {_id} = data
  const user = await User.findOne({_id: _id}, {password: 0} )
  if (!user){
    throw new Error("User not found")
  }
  const image = await Image.findOne({chained: _id})
  return image;
}
module.exports = {
  createImageContent,
  getImageWithContent,
  unchainAllExistingImages,
};
