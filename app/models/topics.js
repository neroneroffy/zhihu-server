/**
 * Author: NERO
 * Date: 2019/9/3 0003
 * Time: 22:34
 *
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const topicSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  avatar_url: { type: String },
  introduction: { type: String, select: false }
})
module.exports = model('Topic', topicSchema)