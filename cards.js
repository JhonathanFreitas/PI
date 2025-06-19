
    // --- Funções Auxiliares ---
    function formatarData(dataString) {
        if (!dataString) return 'Sem data';
        const partes = dataString.split('-');
        if (partes.length !== 3) return dataString;
        return `${partes[2]}/${partes[1]}`; // Dia/Mês
    }
    function carregarTarefasDoLocalStorage() {
        const tasksJSON = localStorage.getItem('avengersTasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    }

    // --- Funções de Renderização do Dashboard ---
    function renderizarProximasTarefas(tasks) {
        const listaEl = document.getElementById('proximas-tarefas-lista');
        listaEl.innerHTML = '';
        const proximas = tasks
            .filter(t => !t.completed && t.data)
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(0, 3);

        if (proximas.length === 0) {
            listaEl.innerHTML = '<li>Nenhuma tarefa com data marcada.</li>';
            return;
        }
        proximas.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${task.text} (${task.categoria})</span> <span class="task-date">${formatarData(task.data)}</span>`;
            listaEl.appendChild(li);
        });
    }

    function renderizarResumoSemana(tasks) {
        const numeroEl = document.getElementById('resumo-semana-numero');
        const hoje = new Date();
        const seteDiasAtras = new Date(hoje.setDate(hoje.getDate() - 7));

        const concluidasNaSemana = tasks.filter(t => {
            return t.completed && t.data && new Date(t.data) >= seteDiasAtras;
        }).length;
        
        numeroEl.textContent = concluidasNaSemana;
    }

    function renderizarCards(tasks) {
        const container = document.getElementById('cards-container');
        container.innerHTML = ''; // Limpa antes de renderizar
        const categorias = {
            Estudos: { tasks: [], icon: '📚' },
            Pessoal: { tasks: [], icon: '🧘‍♂️' },
            Trabalho: { tasks: [], icon: '💼' },
        };

        tasks.forEach(t => {
            if (categorias[t.categoria]) {
                categorias[t.categoria].tasks.push(t);
            }
        });

        for (const nomeCategoria in categorias) {
            const categoria = categorias[nomeCategoria];
            const total = categoria.tasks.length;
            const concluidas = categoria.tasks.filter(t => t.completed).length;
            const percentual = total > 0 ? (concluidas / total) * 100 : 0;
            const temPrioridadeAlta = categoria.tasks.some(t => !t.completed && t.prioridade === 'Alta');
            const proximaTarefa = categoria.tasks
                .filter(t => !t.completed && t.data)
                .sort((a, b) => new Date(a.data) - new Date(b.data))[0];

            const cardHTML = `
                <div class="card" onclick="abrirModalCategoria('${nomeCategoria}')">
                    ${temPrioridadeAlta ? '<span class="priority-indicator">🔥</span>' : ''}
                    <h2>${categoria.icon} ${nomeCategoria}</h2>
                    <p>${concluidas} de ${total} tarefas concluídas</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentual}%;">${percentual.toFixed(0)}%</div>
                    </div>
                    <div class="next-task-preview">
                        <strong>Próxima:</strong>
                        <span>${proximaTarefa ? proximaTarefa.text : 'Tudo em dia!'}</span>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        }
    }

    // --- Funções de Modal e Tema (sem alterações de lógica) ---
    function abrirModalCategoria(categoria) {
      const tasks = carregarTarefasDoLocalStorage();
      const tasksDaCategoria = tasks.filter(task => task.categoria === categoria);
      const modal = document.getElementById('modalCategoria');
      const tituloModal = document.getElementById('modalCategoriaTitulo');
      const contadorModal = document.getElementById('modalCategoriaContador');
      const listaModal = document.getElementById('modalListaTarefas');
      tituloModal.textContent = `Tarefas de ${categoria}`;
      listaModal.innerHTML = '';
      const totalCount = tasksDaCategoria.length;
      const concluidasCount = tasksDaCategoria.filter(t => t.completed).length;
      contadorModal.textContent = `(${concluidasCount}/${totalCount} concluídas)`;
      if (totalCount === 0) {
          listaModal.innerHTML = '<li>Nenhuma tarefa encontrada.</li>';
      } else {
          tasksDaCategoria.forEach(task => {
              const li = document.createElement('li');
              if (task.completed) li.classList.add('concluida');
              if (task.prioridade) li.classList.add('prioridade-' + task.prioridade.toLowerCase());
              li.innerHTML = `<input type="checkbox" ${task.completed ? 'checked' : ''} disabled> <span class="modal-task-title">${task.text}</span> <span class="modal-task-date">${formatarData(task.data)}</span>`;
              listaModal.appendChild(li);
          });
      }
      modal.classList.add('ativa');
    }
    function fecharModalCategoria() { document.getElementById('modalCategoria').classList.remove('ativa'); }

    function alternarTema() {
      const body = document.body;
      const logo = document.getElementById('logo-img');
      if (body.classList.contains('tema-claro')) {
          body.className = 'tema-escuro';
          temaBtn.textContent = '🌙 Tema Escuro ';
          logo.src = 'logo-branca.png';
      } else {
          body.className = 'tema-claro';
          temaBtn.textContent = '☀️ Tema Claro ';
          logo.src = 'logo.png';
      }
      localStorage.setItem('temaAvengers', body.classList.contains('tema-escuro') ? 'escuro' : 'claro');
    }
    function carregarTemaDoLocalStorage() {
      const temaSalvo = localStorage.getItem('temaAvengers') || 'claro';
      document.body.className = `tema-${temaSalvo}`;
      document.getElementById('temaBtn').textContent = temaSalvo === 'escuro' ? '🌙 Tema Escuro' : '☀️ Tema Claro';
      document.getElementById('logo-img').src = temaSalvo === 'escuro' ? 'logo-branca.png' : 'logo.png';
    }
    
    // --- Inicialização ---
    document.addEventListener('DOMContentLoaded', () => {
        const allTasks = carregarTarefasDoLocalStorage();
        carregarTemaDoLocalStorage();
        renderizarProximasTarefas(allTasks);
        renderizarResumoSemana(allTasks);
        renderizarCards(allTasks);
        document.getElementById('temaBtn').addEventListener('click', alternarTema);
    });