let tasks = [];
let temaAtual = 'claro';

function addItem(event) {
  event.preventDefault();

  const input = document.getElementById('novoItem');
  const data = document.getElementById('dataItem').value;
  const categoria = document.getElementById('categoriaItem').value;
  const prioridade = document.getElementById('prioridadeItem').value;
  const taskText = input.value.trim();

  if (taskText === '') {
    alert("Por favor, insira uma tarefa.");
    return;
  }

  const task = {
    text: taskText,
    data,
    categoria,
    prioridade,
    completed: false
  };

  tasks.push(task);
  input.value = '';
  document.getElementById('dataItem').value = '';
  mostrarFeedback("✅ Tarefa adicionada!");
  atualizarTasks();
}

function mostrarFeedback(msg) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = msg;
  setTimeout(() => feedback.textContent = '', 2000);
}

function atualizarTasks(filtro = 'Todas', termoBusca = '') {
  const lista = document.getElementById('listaItem');
  lista.innerHTML = '';

  const hoje = new Date();
  const fimDaSemana = new Date(hoje);
  fimDaSemana.setDate(hoje.getDate() + 7);

  const ordenacao = document.getElementById('ordenarSelect').value;

  let filtradas = tasks.filter(task => {
    const correspondeFiltro =
      filtro === 'Todas' ||
      (filtro === 'Hoje' && task.data === hoje.toISOString().split('T')[0]) ||
      (filtro === 'Semana' && task.data && new Date(task.data) <= fimDaSemana) ||
      task.categoria === filtro;

    const correspondeBusca = task.text.toLowerCase().includes(termoBusca.toLowerCase());
    return correspondeFiltro && correspondeBusca;
  });

  if (ordenacao === 'nome') {
    filtradas.sort((a, b) => a.text.localeCompare(b.text));
  } else if (ordenacao === 'data') {
    filtradas.sort((a, b) => new Date(a.data || 0) - new Date(b.data || 0));
  } else if (ordenacao === 'prioridade') {
    const prioridadeOrdem = { Alta: 1, Média: 2, Baixa: 3 };
    filtradas.sort((a, b) => prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade]);
  }

  filtradas.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `${task.completed ? 'concluida' : ''} prioridade-${task.prioridade}`;

    li.innerHTML = `
      <span>
        <input type="checkbox" onchange="toggleConcluida(${index})" ${task.completed ? 'checked' : ''} />
        ${task.text} (${task.categoria} - ${task.data || 'Sem data'})
      </span>
      <span>
        <button onclick="editarItem(${index})">✏️</button>
        <button onclick="removerItem(${index})">🗑️</button>
      </span>
    `;
    lista.appendChild(li);
  });
}

function removerItem(index) {
  tasks.splice(index, 1);
  atualizarTasks();
}

function editarItem(index) {
  const novaDescricao = prompt("Editar tarefa:", tasks[index].text);
  const novaData = prompt("Nova data (AAAA-MM-DD):", tasks[index].data);
  const novaCategoria = prompt("Nova categoria:", tasks[index].categoria);
  const novaPrioridade = prompt("Nova prioridade:", tasks[index].prioridade);

  if (novaDescricao?.trim()) tasks[index].text = novaDescricao.trim();
  if (novaData) tasks[index].data = novaData;
  if (novaCategoria) tasks[index].categoria = novaCategoria;
  if (novaPrioridade) tasks[index].prioridade = novaPrioridade;

  atualizarTasks();
}

function toggleConcluida(index) {
  tasks[index].completed = !tasks[index].completed;
  atualizarTasks();
}

function filtrarCategoria(categoria) {
  atualizarTasks(categoria, document.getElementById('buscaTarefa').value);
}

document.getElementById('formTarefa').addEventListener('submit', addItem);
document.getElementById('buscaTarefa').addEventListener('input', () => {
  atualizarTasks('Todas', document.getElementById('buscaTarefa').value);
});

document.getElementById('filtroHoje').addEventListener('click', () => atualizarTasks('Hoje'));
document.getElementById('filtroSemana').addEventListener('click', () => atualizarTasks('Semana'));
document.getElementById('filtroTodas').addEventListener('click', () => atualizarTasks('Todas'));

document.getElementById('temaBtn').addEventListener('click', () => {
  const body = document.body;
  if (body.classList.contains('tema-claro')) {
    body.className = 'tema-escuro';
    temaBtn.textContent = '🌙 Tema Escuro';
  } else if (body.classList.contains('tema-escuro')) {
    body.className = 'tema-tech';
    temaBtn.textContent = '💻 Tema Tech';
  } else if (body.classList.contains('tema-tech')) {
    body.className = 'tema-vintage';
    temaBtn.textContent = '🕰️ Tema Vintage';
  } else {
    body.className = 'tema-claro';
    temaBtn.textContent = '☀️ Tema Claro';
  }
});
