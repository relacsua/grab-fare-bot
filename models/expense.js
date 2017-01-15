const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const expenseSchema = new mongoose.Schema({
  year: Number,
  month:  Number,
  expense: Number
});

expenseSchema.statics.createOrUpdate = function (year, month, expense) {
  return this
    .findOne({ year, month })
    .then(record => {
      if (record) {
        return record.update({ expense: record.expense + expense });
      }

      return this.create({ year, month, expense });
    });
}

expenseSchema.statics.setExpense = function (year, month, expense) {
  return this
    .findOne({ year, month })
    .then(record => {
      if (record) {
        return record.update({ expense });
      }
    });
}

expenseSchema.statics.getExpense = function (year, month) {
  return this
    .findOne({ year, month })
    .then(record => {
      return record ? record.expense : 0;
    });
}

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
