const _ = require('lodash')
const store = require('../utils/store')
const uuid = require('node-uuid')

let todos = store.createNameSpace('todos')

class ToDo {
  constructor(entry){
    this.entry = entry
    this.id = uuid.v1()
    this.completed = false
  }
  complete(){
    this.completed = true
  }
  remove(){
  }
}

const init = (bot) => {
  bot.addListener("nick", function(oldNick, newNick) {
    if (todos.has(oldNick)) {
      todos.move(oldNick, newNick)
    }
  });
}

function matchTodo(match, say) {
  match(['todo'], function(search) {
    let {data} = todos.get(say.prototype.from)
    if (!data)
      data = []
    if (!search)
    {
      _.map(_.remove(data, {completed: true}), (todo, index) => {
        console.log(todo)
        say(`${index} - ${todo.entry}`)
      })
    }
    else if (search.startsWith('completed'))
    {
      _.map(_.remove(data, {completed: false}), (todo, index) => {
        say(`${index} - ${todo.entry}`)
      })
    }
    else if (search.startsWith('all'))
    {
      _.map(data, (todo, index) => {
        say(`${index} - ${todo.entry}`)
      })
    }
    else if (search.startsWith('complete'))
    {
    }
    else if (search.startsWith('clearCompleted'))
    {
    }
    else if (search.startsWith('clearCompleted'))
    {
    }
    else
    {
      data.push(new ToDo(search))
      todos.set(say.prototype.from, data)
      say('Todo Added!')
    }
  })
}

matchTodo.prototype.init = init

module.exports = matchTodo
