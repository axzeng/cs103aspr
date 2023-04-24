/*
  todo.js -- Router for the ToDoList
*/
const express = require('express');
const router = express.Router();
const ToDoItem = require('../models/ToDoItem')
const User = require('../models/User')


/*
this is a very simple server which maintains a key/value
store using an object where the keys and values are lists of strings

*/

isLoggedIn = (req, res, next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// get the value associated to the key
router.get('/todo/',
  isLoggedIn,
  async (req, res, next) => {
    const sortBy = req.query.sortBy
    const sortCat = sortBy == 'category'
    const sortAmt = sortBy == 'amount'
    const sortDesc = sortBy == 'description'
    const sortDate = sortBy == 'date'

    if (sortCat) {
      res.locals.items = await ToDoItem.find({ userId: req.user._id }).sort({ category: 1 })
    } else if (sortAmt) {
      res.locals.items = await ToDoItem.find({ userId: req.user._id }).sort({ amount: 1 })
    } else if (sortDesc) {
      res.locals.items = await ToDoItem.find({ userId: req.user._id }).sort({ item: 1 })
    } else if (sortDate) {
      res.locals.items = await ToDoItem.find({ userId: req.user._id }).sort({ date: 1 })
    } else {
      res.locals.items = await ToDoItem.find({ userId: req.user._id })
    }
    res.render('toDoList');
  });


/* add the value in the body to the list associated to the key */
router.post('/todo',
  isLoggedIn,
  async (req, res, next) => {
    const todo = new ToDoItem(
      {
        item: req.body.item,
        amount: parseInt(req.body.amount),
        category: req.body.category,
        date: req.body.date,
        userId: req.user._id
      })
    await todo.save();
    res.redirect('/todo')
  });

router.get('/todo/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
    console.log("inside /todo/remove/:itemId")
    await ToDoItem.deleteOne({ _id: req.params.itemId });
    res.redirect('/todo')
  });


router.get('/todo/edit/:itemId',
  isLoggedIn,
  async (req, res, next) => {
    console.log("inside /todo/edit/:itemId")
    const item =
      await ToDoItem.findById(req.params.itemId);
    //res.render('edit', { item });
    res.locals.item = item
    res.render('transaction_edit')
    //res.json(item)
  });

router.post('/todo/updateTodoItem',
  isLoggedIn,
  async (req, res, next) => {
    const { itemId, description, category, amount, date } = req.body;
    console.log("inside /todo/complete/:itemId");
    await ToDoItem.findOneAndUpdate(
      { _id: itemId },
      { $set: { description, category, amount, date } });
    res.redirect('/toDo')
  });

router.get('/todo/groupByCat',
  isLoggedIn,
  async (req, res, next) => {
    let results =
      await ToDoItem.aggregate(
        [
          {
            $group: {
              _id: '$category',
              total: { $count: {} }
            }
          },
          { $sort: { total: -1 } },
        ])
    res.render('groupByCat', { results })
  });



module.exports = router;
