const LibCirculationView = {
  render() {
    return \
      <div class="page-header">
        <div>
          <h1>CIRCULATION</h1>
          <p>Issue, return, and renew books</p>
        </div>
      </div>
      <div class="card" style="padding:2rem; text-align:center;">
        <h2 style="font-weight:700; margin-bottom:1rem;">Circulation Workflow</h2>
        <div style="display:flex; gap:1rem; justify-content:center;">
          <button class="btn-primary" onclick="alert('Issue Flow')">Issue Book</button>
          <button class="btn-secondary" onclick="alert('Return Flow')">Return Book</button>
        </div>
      </div>
    \;
  }
};
window.LibCirculationView = LibCirculationView;
