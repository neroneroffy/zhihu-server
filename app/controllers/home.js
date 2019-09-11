/**
 * Author: NERO
 * Date: 2019/8/20 0020
 * Time: 22:20
 *
 */
const path = require('path')
const qiniu = require("qiniu");
const { qiniuAccessKey, qiniuSecretKey, bucket, serverURL } = require('../config')
const mac = new qiniu.auth.digest.Mac(qiniuAccessKey, qiniuSecretKey);
const options = {
  scope: bucket,
  expires: 631138519
};
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

function uploadFileHandler(key, file, resolve, reject) {
  const extra = new qiniu.form_up.PutExtra();
  const formUploader = new qiniu.form_up.FormUploader
  formUploader.put(uploadToken, key, file.buffer, extra, function (err, res) {
    console.log(file.buffer);
    if (!err) {
      resolve(res.key);
    } else {
      // 上传失败， 处理返回代码
      reject(err);
    }
  });
}
function uploadFile(key, file) {
  return new Promise((resolve, reject) => {
    uploadFileHandler(key, file, resolve, reject)
  })
}

class HomeCtl {
  index(ctx) {
    ctx.body = '主页'
  }
  async upload(ctx) {
    const file = ctx.request.files.file
    const basename = path.basename(file.path)
    // @TODO 需要将图片上传到七牛
    ctx.body = {
      url: `${ctx.origin}/uploads/${basename}`
    }
  }
}

module.exports = new HomeCtl()