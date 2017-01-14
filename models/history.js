const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const historySchema = new mongoose.Schema({
  offset:  Number
});

historySchema.statics.createOrUpdate = function (index) {
  return this
    .count()
    .then(count => count === 0)
    .then(isEmpty => {
      if (isEmpty) {
        return this.create({ offset: index });
      } else {
        return this.update({ offset: index });
      }
    });
}

historySchema.statics.getOffset = function () {
  return this
    .findOne()
    .then(history => history ? history.offset : 0);
}

const History = mongoose.model('History', historySchema);

export default History;
