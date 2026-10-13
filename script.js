
"use strict";

// ========================================
// CLASS TODO
// ========================================

class Todo {
  constructor(id, title, completed) {
    this.id = id;
    this.title = title;
    this.completed = completed || false;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }
}


// ========================================
// CLASS TODO LIST
// ========================================

class TodoList {
  constructor() {
    this.todos = [];
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(function (todo) {
      return todo.id !== id;
    });
  }

  toggleTodo(id) {
    const todo = this.todos.find(function (todo) {
      return todo.id === id;
    });

    if (!todo) {
      throw new Error("Todo tidak ditemukan.");
    }

    todo.toggleComplete();
  }

  clearCompleted() {
    this.todos = this.todos.filter(function (todo) {
      return todo.completed === false;
    });
  }

  getTodos() {
    return this.todos;
  }

  getActiveTodos() {
    return this.todos.filter(function (todo) {
      return todo.completed === false;
    });
  }
}


// ========================================
// CREATE TODO LIST
// ========================================

const todoList = new TodoList();


// ========================================
// GET ELEMENTS FROM DOM
// ========================================

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoListElement = document.querySelector("#todo-list");
const todoCount = document.querySelector("#todo-count");
const message = document.querySelector("#message");
const emptyMessage = document.querySelector("#empty-message");
const clearCompletedButton =
  document.querySelector("#clear-completed");


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(text, type) {
  message.textContent = text;
  message.className = type || "error";
}


// ========================================
// GENERATE UNIQUE ID
// ========================================

function generateUniqueId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}


// ========================================
// LOAD TODOS FROM API
// ========================================

async function loadTodos() {
  try {
    showMessage("Loading tasks...", "info");

    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos?_limit=5"
    );

    if (!response.ok) {
      throw new Error(
        "Gagal mengambil data dari server."
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(
        "Data dari server tidak valid."
      );
    }

    data.forEach(function (item) {
      const todo = new Todo(
        item.id,
        item.title,
        item.completed
      );

      todoList.addTodo(todo);
    });

    showMessage(
      "Tasks berhasil dimuat.",
      "success"
    );

    renderTodos();

  } catch (error) {
    showMessage(
      "Terjadi kesalahan: " + error.message,
      "error"
    );

    console.error(error);
  }
}


// ========================================
// RENDER TODOS
// ========================================

function renderTodos() {
  todoListElement.innerHTML = "";

  const todos = todoList.getTodos();

  // Jika list kosong
  if (todos.length === 0) {
    emptyMessage.style.display = "block";
    todoCount.textContent = "0 tasks";
    return;
  }

  emptyMessage.style.display = "none";


  // Buat elemen untuk setiap Todo
  todos.forEach(function (todo) {

    const listItem =
      document.createElement("li");

    listItem.className = "todo-item";


    // Jika Todo selesai
    if (todo.completed) {
      listItem.classList.add("completed");
    }


    // Checkbox
    const checkbox =
      document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;


    checkbox.addEventListener(
      "change",
      function () {

        try {

          todoList.toggleTodo(todo.id);

          renderTodos();

        } catch (error) {

          showMessage(
            error.message,
            "error"
          );
        }
      }
    );


    // Judul Todo
    const title =
      document.createElement("span");

    title.textContent = todo.title;


    // Delete button
    const deleteButton =
      document.createElement("button");

    deleteButton.textContent = "Delete";


    deleteButton.addEventListener(
      "click",
      function () {

        todoList.deleteTodo(todo.id);

        renderTodos();

        showMessage(
          "Task berhasil dihapus.",
          "success"
        );
      }
    );


    // Masukkan elemen ke list item
    listItem.appendChild(checkbox);
    listItem.appendChild(title);
    listItem.appendChild(deleteButton);


    // Masukkan list item ke DOM
    todoListElement.appendChild(listItem);
  });


  updateTodoCount();
}


// ========================================
// UPDATE COUNTER
// ========================================

function updateTodoCount() {

  const activeTodos =
    todoList.getActiveTodos().length;

  if (activeTodos === 1) {

    todoCount.textContent =
      "1 task remaining";

  } else {

    todoCount.textContent =
      activeTodos + " tasks remaining";
  }
}


// ========================================
// ADD TODO
// ========================================

todoForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();

    try {

      const title =
        todoInput.value.trim();


      // Validasi kosong
      if (title === "") {

        throw new Error(
          "Task tidak boleh kosong."
        );
      }


      // Validasi minimal 3 karakter
      if (title.length < 3) {

        throw new Error(
          "Task minimal 3 karakter."
        );
      }


      // Buat Todo baru
      const todo = new Todo(
        generateUniqueId(),
        title,
        false
      );


      // Tambahkan Todo
      todoList.addTodo(todo);


      // Kosongkan input
      todoInput.value = "";


      // Update tampilan
      renderTodos();


      // Feedback
      showMessage(
        "Task berhasil ditambahkan.",
        "success"
      );

    } catch (error) {

      showMessage(
        error.message,
        "error"
      );
    }
  }
);


// ========================================
// CLEAR COMPLETED TODOS
// ========================================

clearCompletedButton.addEventListener(
  "click",
  function () {

    todoList.clearCompleted();

    renderTodos();

    showMessage(
      "Completed tasks berhasil dihapus.",
      "success"
    );
  }
);


// ========================================
// START APPLICATION
// ========================================

loadTodos();
