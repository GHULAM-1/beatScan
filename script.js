const API_URL = 'https://my.beastscan.com/test-kit';
let ideas = [];
let userVotes = JSON.parse(localStorage.getItem('userVotes')) || {};
const cardsContainer = document.getElementById('cards');
const skeletonContainer = document.getElementById('skeleton');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const editForm = document.getElementById('edit-form');
let currentEditId = null;

function showSkeleton() {
  skeletonContainer.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton-card';
    skeletonContainer.appendChild(sk);
  }
}

async function fetchIdeas() {
  showSkeleton();
  try {
    const stored = localStorage.getItem('ideas');
    if (stored) ideas = JSON.parse(stored);
    else {
      const res = await fetch(API_URL);
      const data = await res.json();
      ideas = data.map((idea, idx) => ({ id: idx+1, ...idea }));
      saveState();
    }
    renderIdeas();
  } catch (e) {
    console.error(e);
    skeletonContainer.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#f00;">Failed to load ideas.</p>';
  }
}

function renderIdeas() {
  skeletonContainer.innerHTML = '';
  cardsContainer.innerHTML = '';
  ideas.forEach(idea => {
    const card = document.createElement('div');
    card.className = 'card';
    const upActive = userVotes[idea.id] === 'up';
    const downActive = userVotes[idea.id] === 'down';
    card.innerHTML = `
      <img src="${idea.image}" alt="${idea.title}" />
      <div class="card-content">
        <h3 class="card-title">${idea.title}</h3>
        <p class="card-desc">${idea.description}</p>
      </div>
      <div class="card-actions">
        <div class="vote-group">
          <button class="vote-btn upvote ${upActive?'active':''}">👍</button>
          <span class="vote-count">${idea.votes.up}</span>
          <button class="vote-btn downvote ${downActive?'active':''}">👎</button>
          <span class="vote-count">${idea.votes.down}</span>
        </div>
        <button class="button edit-btn">Edit</button>
        <a href="${idea.button.url}" class="button action-btn" target="_blank">${idea.button.label}</a>
      </div>
    `;
    cardsContainer.appendChild(card);
    card.querySelector('.upvote').addEventListener('click', () => updateVote(idea.id,'up'));
    card.querySelector('.downvote').addEventListener('click', () => updateVote(idea.id,'down'));
    card.querySelector('.edit-btn').addEventListener('click', () => openModal(idea));
  });
}

function updateVote(id, type) {
  const idea = ideas.find(i=>i.id===id);
  const prev = userVotes[id];
  if(prev===type){ idea.votes[type]--; delete userVotes[id]; }
  else { if(prev) idea.votes[prev]--; idea.votes[type]++; userVotes[id]=type; }
  saveState(); renderIdeas();
}

function openModal(idea){
  currentEditId=idea.id;
  document.getElementById('edit-title').value=idea.title;
  document.getElementById('edit-desc').value=idea.description;
  document.getElementById('edit-img').value=idea.image;
  document.getElementById('edit-btn-label').value=idea.button.label;
  document.getElementById('edit-btn-url').value=idea.button.url;
  modal.classList.add('visible');
}

closeModal.addEventListener('click',()=>modal.classList.remove('visible'));

editForm.addEventListener('submit',e=>{
  e.preventDefault();
  const idea=ideas.find(i=>i.id===currentEditId);
  idea.title=document.getElementById('edit-title').value;
  idea.description=document.getElementById('edit-desc').value;
  idea.image=document.getElementById('edit-img').value;
  idea.button.label=document.getElementById('edit-btn-label').value;
  idea.button.url=document.getElementById('edit-btn-url').value;
  saveState(); modal.classList.remove('visible'); renderIdeas();
});

function saveState(){
  localStorage.setItem('ideas',JSON.stringify(ideas));
  localStorage.setItem('userVotes',JSON.stringify(userVotes));
}

window.addEventListener('DOMContentLoaded',fetchIdeas);