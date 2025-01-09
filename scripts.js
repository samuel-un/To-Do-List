const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const dateInput = document.getElementById("dateTodo");
const categoryInput = document.getElementById("categoryInput");
const todoList = document.getElementById("todoList");
const deleteAllButton = document.getElementById("deleteAllButton");
const themeToggleButton = document.getElementById("themeToggle");
const sortByDateButton = document.getElementById("sortByDate");
const sortByNameButton = document.getElementById("sortByName");
const searchInput = document.getElementById("searchInput");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

function addTodo(e) {
	e.preventDefault();
	const todoText = todoInput.value.trim();
	const date = dateInput.value;
	const category = categoryInput.value;

	if (todoText) {
		const newTodo = {
			id: Date.now(),
			text: todoText,
			date: date,
			category: category,
			completed: false,
		};
		todos.push(newTodo);
		saveTodos();
		renderTodos();
		todoInput.value = "";
		dateInput.value = "";
	}
}

function saveTodos() {
	localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos(filteredTodos = todos) {
	todoList.innerHTML = "";
	filteredTodos.forEach((todo) => {
		const formattedDate = todo.date
			? new Date(todo.date).toLocaleDateString("es-ES")
			: "Sin fecha";
		const li = document.createElement("li");
		li.innerHTML = `
            <div class="task-content ${todo.completed ? "completed-text" : ""}">
                ${todo.text} (${todo.category}) - ${formattedDate}
            </div>
            <div class="task-actions">
                <button onclick="toggleComplete(${todo.id})">✅</button>
                <button onclick="deleteTodo(${todo.id})">❌</button>
                <button onclick="editTodo(${todo.id})">✏️</button>
            </div>`;
		todoList.appendChild(li);
	});
	updateStats();
}

function updateStats() {
	const pending = todos.filter((todo) => !todo.completed).length;
	const completed = todos.filter((todo) => todo.completed).length;
	pendingCount.textContent = pending;
	completedCount.textContent = completed;
}

function sortByDate() {
	const sorted = [...todos].sort((a, b) => {
		const dateA = a.date ? new Date(a.date) : new Date(0);
		const dateB = b.date ? new Date(b.date) : new Date(0);
		return dateA - dateB;
	});
	renderTodos(sorted);
}

function sortByName() {
	const sorted = [...todos].sort((a, b) => a.text.localeCompare(b.text));
	renderTodos(sorted);
}

function searchTodos() {
	const query = searchInput.value.toLowerCase();
	const filtered = todos.filter((todo) =>
		todo.text.toLowerCase().includes(query)
	);
	renderTodos(filtered);
}

function toggleComplete(id) {
	const todo = todos.find((todo) => todo.id === id);
	if (todo) {
		Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Quieres marcar esta tarea como "${
				todo.completed ? "pendiente" : "completada"
			}"?`,
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#4CAF50",
			cancelButtonColor: "#ff5252",
			confirmButtonText: "Sí, cambiar",
			cancelButtonText: "Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				todo.completed = !todo.completed;
				saveTodos();
				renderTodos();
				Swal.fire(
					"¡Actualizado!",
					`La tarea ha sido marcada como "${
						todo.completed ? "completada" : "pendiente"
					}".`,
					"success"
				);
			}
		});
	}
}

function deleteTodo(id) {
	const todo = todos.find((todo) => todo.id === id);
	if (todo) {
		Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar la tarea "${todo.text}"? Esta acción no se puede deshacer.`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ff5252",
			cancelButtonColor: "#797979",
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				todos = todos.filter((todo) => todo.id !== id);
				saveTodos();
				renderTodos();
				Swal.fire(
					"¡Eliminada!",
					"La tarea ha sido eliminada exitosamente.",
					"success"
				);
			}
		});
	}
}

function deleteAllTodos() {
	if (todos.length === 0) {
		Swal.fire({
			title: "No hay tareas para borrar",
			text: "Tu lista de tareas ya está vacía.",
			icon: "info",
			confirmButtonColor: "#797979",
			confirmButtonText: "Aceptar",
		});
		return;
	}

	Swal.fire({
		title: "¿Estás seguro?",
		text: "Esta acción eliminará todas las tareas y no se podrá deshacer.",
		imageUrl: "images/no-bueno-si.gif",
		imageWidth: 250,
		imageHeight: 250,
		imageAlt: "Gif de advertencia",
		showCancelButton: true,
		confirmButtonColor: "#ff5252",
		cancelButtonColor: "#797979",
		confirmButtonText: "Sí, borrar todo",
		cancelButtonText: "Cancelar",
	}).then((result) => {
		if (result.isConfirmed) {
			todos = [];
			saveTodos();
			renderTodos();
			Swal.fire(
				"¡Eliminadas!",
				"Todas las tareas han sido borradas exitosamente.",
				"success"
			);
		}
	});
}

function editTodo(id) {
	const todo = todos.find((todo) => todo.id === id);
	if (todo) {
		const newText = prompt("Edita tu tarea:", todo.text);
		if (newText !== null && newText.trim() !== "") {
			todo.text = newText.trim();
			saveTodos();
			renderTodos();
		}
	}
}

function toggleTheme() {
	const bodyClass = document.body.classList;
	bodyClass.toggle("light-theme");
	const isLight = bodyClass.contains("light-theme");
	themeToggleButton.textContent = isLight ? "Modo oscuro" : "Modo claro";
	localStorage.setItem("theme", isLight ? "light" : "dark");
}

document.body.classList.add(localStorage.getItem("theme") || "dark");

todoForm.addEventListener("submit", addTodo);
deleteAllButton.addEventListener("click", deleteAllTodos);
sortByDateButton.addEventListener("click", sortByDate);
sortByNameButton.addEventListener("click", sortByName);
searchInput.addEventListener("input", searchTodos);
themeToggleButton.addEventListener("click", toggleTheme);

renderTodos();
