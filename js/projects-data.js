/* Shared project status data — the single source of truth for the hero banner
   and the featured project cards. Verified against each repository's latest
   commit and release metadata on 2026-11-02. */
(function () {
  'use strict';

  var PROJECTS = {
    'markdown-studio': {
      name: 'Markdown Studio',
      repoUrl: 'https://github.com/kumaradoss16/markdown-studio',
      status: 'Active Development',
      statusTone: 'active',
      release: 'v1.0.1',
      lastVerified: '2026-11-02'
    },
    'ai-workflow-orchestrator': {
      name: 'AI Workflow Orchestrator',
      repoUrl: 'https://github.com/kumaradoss16/AI-Workflow-Orchestrator',
      status: 'In Development',
      statusTone: 'dev',
      release: 'Pre-release',
      lastVerified: '2026-11-02'
    }
  };

  function projectFor(el, attribute) {
    return PROJECTS[el.getAttribute(attribute)];
  }

  document.querySelectorAll('[data-project-status]').forEach(function (el) {
    var project = projectFor(el, 'data-project-status');
    if (!project) return;
    el.textContent = project.status;
    el.classList.remove('project-status--active', 'project-status--dev');
    el.classList.add('project-status--' + project.statusTone);
  });

  document.querySelectorAll('[data-project-name]').forEach(function (el) {
    var project = projectFor(el, 'data-project-name');
    if (project) el.textContent = project.name;
  });

  document.querySelectorAll('[data-project-link]').forEach(function (el) {
    var project = projectFor(el, 'data-project-link');
    if (!project) return;
    el.setAttribute('href', project.repoUrl);
  });

  document.querySelectorAll('[data-project-release]').forEach(function (el) {
    var project = projectFor(el, 'data-project-release');
    if (project) el.textContent = project.release;
  });

  document.querySelectorAll('[data-project-verified]').forEach(function (el) {
    var project = projectFor(el, 'data-project-verified');
    if (project) el.textContent = project.lastVerified;
  });

  window.DEVSPIRE_PROJECTS = PROJECTS;
})();
