let tasks = [];

function addItem() {
  const input = document.getElementById('novoItem');
  const categoria = document.getElementById('categoriaItem').value;
  const prioridade = document.getElementById('prioridadeItem').value;
  const taskText = input.value.trim();

  if (taskText === '') {
    alert("Por favor, insira uma tarefa.");
    return;
  }

  const task = {
    text: taskText,
    categoria,
    prioridade,
    completed: false
  };

  tasks.push(task);
  input.value = '';
  atualizarTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  atualizarTasks();
}

function removerItem(index) {
  tasks.splice(index, 1);
  atualizarTasks();
}

function editItem(index) {
  const novoTexto = prompt("Edite sua tarefa:", tasks[index].text);
  if (novoTexto !== null && novoTexto.trim() !== '') {
    tasks[index].text = novoTexto.trim();
    atualizarTasks();
  }
}

function atualizarTasks() {
  const lista = document.getElementById('listaItem');
  lista.innerHTML = '';

  const prioridadePeso = { "Alta": 1, "Média": 2, "Baixa": 3 };
  tasks.sort((a, b) => prioridadePeso[a.prioridade] - prioridadePeso[b.prioridade]);

  let completedCount = 0;
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.classList.toggle('completed', task.completed);

    if (task.completed) completedCount++;

    li.innerHTML = `
      <span>${task.text} - (${task.categoria} / Prioridade: ${task.prioridade})</span>
      <button onclick="editItem(${index})">✏️</button>
      <button onclick="toggleTask(${index})">✔️</button>
      <button onclick="removerItem(${index})">🗑️</button>
    `;
    lista.appendChild(li);
  });

  document.getElementById('totalTasks').textContent = tasks.length;
  document.getElementById('totalTasks2').textContent = tasks.length;
  document.getElementById('completedTasks').textContent = completedCount;
}

document.getElementById('adicionarBtn').addEventListener('click', addItem);

document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addItem();
});

document.getElementById('toggleTema').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const temaAtual = document.body.classList.contains('dark') ? 'escuro' : 'claro';
  localStorage.setItem('tema', temaAtual);
});

document.addEventListener('DOMContentLoaded', () => {
  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'escuro') {
    document.body.classList.add('dark');
  }
});
