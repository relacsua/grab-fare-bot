const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const mailSchema = new mongoose.Schema({
  lastID: String
});

mailSchema.statics.createOrUpdate = function (id) {
  return this
    .findOne()
    .then(record => {
      if (record) {
        return this.update({ lastID: id });
      }
      return this.create({ lastID: id });
    });
}

mailSchema.statics.getLastIDRead = function () {
  return this
    .findOne()
    .then(record => record ? record.lastID : '0');
}

const Mail = mongoose.model('Mail', mailSchema);

export default Mail;
