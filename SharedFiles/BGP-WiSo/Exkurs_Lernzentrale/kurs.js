const page = document.body;
const unitId = page.dataset.unit;
const storageKey = unitId ? `dpa-lernkurs:${unitId}` : null;

function readState() {
  if (!storageKey) return {};
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch {
    return {};
  }
}

function writeState(update) {
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify({ ...readState(), ...update }));
}

function updateProgress() {
  const questions = [...document.querySelectorAll('[data-question]')];
  const answered = questions.filter((question) => question.dataset.answered === 'true').length;
  const percent = questions.length ? Math.round((answered / questions.length) * 100) : 0;
  const bar = document.querySelector('.progress-bar');
  if (bar) bar.style.width = `${percent}%`;
  const label = document.querySelector('[data-progress-label]');
  if (label) label.textContent = `${answered} von ${questions.length} Aufgaben bearbeitet`;
}

document.querySelectorAll('[data-check]').forEach((button) => {
  button.addEventListener('click', () => {
    const question = button.closest('[data-question]');
    const expected = String(question.dataset.answer || '').toLowerCase().split('|').map((value) => value.trim());
    const selected = question.querySelector('input[type="radio"]:checked');
    const textField = question.querySelector('input[type="text"], textarea');
    const actual = String(selected?.value || textField?.value || '').trim().toLowerCase();
    const mode = question.dataset.match || 'exact';
    const correct = mode === 'contains'
      ? expected.every((term) => actual.includes(term))
      : expected.includes(actual);
    const feedback = question.querySelector('.feedback');

    question.dataset.answered = 'true';
    feedback.classList.add('visible', correct ? 'correct' : 'incorrect');
    feedback.classList.remove(correct ? 'incorrect' : 'correct');
    feedback.querySelector('[data-result]').textContent = correct ? 'Richtig.' : 'Noch nicht ganz.';
    updateProgress();
  });
});

document.querySelectorAll('[data-reveal]').forEach((button) => {
  button.addEventListener('click', () => {
    const question = button.closest('[data-question]');
    question.dataset.answered = 'true';
    question.querySelector('.feedback').classList.add('visible');
    updateProgress();
  });
});

const examButton = document.querySelector('[data-exam-toggle]');
if (examButton) {
  examButton.addEventListener('click', () => {
    page.classList.toggle('exam-mode');
    const active = page.classList.contains('exam-mode');
    examButton.textContent = active ? 'Lernmodus' : 'IHK-Modus';
    document.querySelectorAll('.feedback').forEach((item) => item.classList.remove('visible'));
  });
}

document.querySelectorAll('[data-status]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-status]').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    writeState({ status: button.dataset.status, updatedAt: new Date().toISOString() });
  });
});

const saved = readState();
if (saved.status) document.querySelector(`[data-status="${saved.status}"]`)?.classList.add('selected');
updateProgress();

document.querySelectorAll('[data-unit-card]').forEach((card) => {
  const id = card.dataset.unitCard;
  let state = {};
  try {
    state = JSON.parse(localStorage.getItem(`dpa-lernkurs:${id}`) || '{}');
  } catch {
    state = {};
  }
  const names = { secure: 'Sicher', repeat: 'Wiederholen', open: 'Noch offen' };
  card.querySelector('.unit-status').textContent = state.status ? `Status: ${names[state.status]}` : 'Status: nicht bewertet';
});