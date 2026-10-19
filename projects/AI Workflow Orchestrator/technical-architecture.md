# AI Workflow Orchestrator - Technical Architecture & Engineering Specification

Architecture baseline · Security-first · Integrity-enforced · Test-driven · Release-gated

The recommended approach is to build the AI Workflow Orchestrator as a local-first engineering platform with a modular Python backend, a desktop interface, a durable project state, and controlled AI/tool integrations.

The first engineering milestone is not adding more providers, agents, or dashboard features. It is establishing a reliable foundation in which project data cannot be silently corrupted, AI output cannot silently become approved state, untrusted tools cannot execute unrestricted actions, and releases cannot pass when mandatory checks fail.

## 1. Architecture objectives

The platform must satisfy these objectives before expanding the feature set.

- Secure by default: integrations receive no permissions unless explicitly granted.
- One canonical project state: approved requirements, decisions, tasks, and artifacts have authoritative records.
- Traceable AI operations: each model run links to its task, prompt version, context snapshot, and relevant source revision.
- No implicit trust: model responses are proposals; validation and approval govern acceptance.
- Recoverable workflows: failures, timeouts, restarts, and partial execution do not produce false success.
- Deterministic quality gates: required checks must pass for the exact artifact revision being accepted.
- Portable local data: project metadata, Markdown, and Git repositories remain exportable.
- Incremental architecture: build a modular monolith first; introduce distributed services only when justified.

## 2. System architecture
<img width="810" height="711" alt="image" src="https://github.com/user-attachments/assets/bdd04c0b-8fa6-4170-a68b-bbe2ae118e74" />


### Architecture decisions

| Area                  | Decision                                             | Rationale                                                                       |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| Application structure | Modular monolith                                     | Easier to test, deploy, debug and maintain as a solo developer.                 |
| Desktop UI            | Tauri 2 + vanilla JavaScript                         | Fits the local-first product and avoids unnecessary frontend complexity.        |
| Backend               | Python + FastAPI                                     | Reuses Python for AI integration, orchestration, and verification.              |
| Database              | SQLite with migrations and foreign keys              | Suitable for a single-user initial release.                                     |
| Knowledge             | Markdown and ordinary files                          | Portable and versionable independently of the application.                      |
| Source control        | Git                                                  | Provides source revision history, diffs and recovery mechanisms.                |
| Workflow execution    | Persistent job state and a controlled worker         | Supports long-running tasks without depending on web-request lifetime.          |
| Provider integration  | Adapter interface per provider                       | Keeps vendor-specific formats out of the core domain.                           |
| Testing               | Automated tests plus external-tool integration tests | Separates application correctness from provider availability.                   |
| Future collaboration  | Separate architectural boundary                      | Allows later synchronization without forcing cloud infrastructure into the MVP. |

Important: Tauri does not automatically secure a locally exposed FastAPI service. The local API, desktop-to-backend authentication, allowed origins, listening interface, and filesystem permissions must be designed explicitly.

## 3. Trust boundaries and security model

Treat every external input as potentially untrusted, including AI-generated code, model responses, repository contents, retrieved documentation, web pages, MCP results, and imported chat transcripts.
<img width="802" height="463" alt="image" src="https://github.com/user-attachments/assets/2a12f9f1-81a0-409f-8c25-89e7888edff1" />


### Mandatory security controls

1. Bind the local API to loopback by default; never expose it to the LAN or public internet by default.
2. Authenticate desktop requests to the local API. Use a protected session or per-installation secret, and validate origins and request sources as appropriate.
3. Restrict filesystem operations to user-authorized project roots. Resolve paths and symlinks before checking access; reject traversal and unauthorized paths.
4. Store provider credentials in the operating system's credential store where available. Never store plaintext API keys in SQLite, Markdown, source code, or ordinary logs.
5. Redact secrets from prompts, context snapshots, logs, and exported diagnostics. Do not assume pattern-based redaction catches every secret.
6. Treat model output as untrusted. Never execute generated shell commands or code merely because a model recommends them.
7. Require explicit permission policies for each tool and project. Start with read-only access; grant write and execution capabilities separately.
8. Run untrusted code in a sandbox with restricted filesystem access, resource limits, timeouts, and network access disabled unless specifically required.
9. Require fresh approval for destructive or high-impact actions. Approval must reference the exact operation and artifact revision.
10. Pin and scan dependencies, protect the update mechanism, and test the packaged application-not just the Python modules.
11. Keep audit records for sensitive actions without recording raw secrets or unnecessarily retaining confidential prompts.
12. Provide backup, restore, export, and deletion mechanisms with documented behavior.

### Permission levels

| Level       | Example                                                       | Default behavior                                                |
| ----------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| Read        | Search approved project documentation                         | Allowed within granted scope                                    |
| Draft       | Generate a proposed patch or configuration                    | Save as a proposal; do not accept automatically                 |
| Write       | Modify files in an authorized worktree                        | Restricted, revision-aware operation                            |
| Execute     | Run tests or approved commands                                | Allowlisted, bounded execution                                  |
| High impact | Change security policy, migrations, or dependencies           | Review, tests and explicit approval                             |
| Critical    | Delete project data, expose credentials, deploy to production | Deny by default; require elevated authorization where supported |

A model's response must never be able to escalate its own permissions. A request to access a new directory, invoke a new tool, or perform a more privileged operation must go through the application policy layer.

## 4. Explicit data-integrity invariants

These invariants are the rules the system must always enforce. They should be implemented in domain services, database constraints where possible, and automated tests.

| ID     | Invariant                                                                                                                   | Enforcement                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| INV-01 | Every task belongs to exactly one valid project.                                                                            | Foreign key and service validation.                   |
| INV-02 | Every record has a stable identifier and valid lifecycle state.                                                             | Schema constraints and transition rules.              |
| INV-03 | Accepted requirements and decisions cannot be silently overwritten.                                                         | Immutable revisions and explicit supersession.        |
| INV-04 | Every model run references its task and the prompt/context versions used, when applicable.                                  | Required provenance references.                       |
| INV-05 | Model output never directly changes canonical approved state.                                                               | Proposal-to-approval workflow.                        |
| INV-06 | A completed task must satisfy its configured completion criteria.                                                           | State-transition guard.                               |
| INV-07 | A passing validation result applies only to the exact source revision and relevant environment recorded by the check.       | Revision hashes and environment metadata.             |
| INV-08 | An approval applies only to the specific reviewed action or artifact revision.                                              | Revision-bound approval record.                       |
| INV-09 | Stale or concurrent changes cannot silently overwrite newer approved changes.                                               | Optimistic concurrency checks and integration review. |
| INV-10 | Every sensitive operation has an auditable actor, target, timestamp and outcome.                                            | Audit event creation.                                 |
| INV-11 | Workflow retries cannot silently duplicate non-idempotent side effects.                                                     | Idempotency keys and operation-specific recovery.     |
| INV-12 | An interrupted workflow cannot be reported as successful without verified completion.                                       | Durable state machine and recovery reconciliation.    |
| INV-13 | A project backup is not considered valid until restoration has been tested.                                                 | Automated restore verification.                       |
| INV-14 | Secrets are excluded from ordinary logs and exports to the extent supported by configured detection and redaction controls. | Centralized redaction and leak tests.                 |
| INV-15 | Deletion and archival behavior preserves required referential integrity and follows the declared retention policy.          | Explicit deletion rules and transaction tests.        |
| INV-16 | A release cannot pass when a mandatory quality gate is failed, missing, or invalidated by a subsequent change.              | Release gate evaluator.                               |

### State transition rules

Do not use a single free-form status field that can be set arbitrarily by any module. Define permitted transitions.

```

Task:
  draft -> ready -> running -> review -> verified -> completed

Allowed exception transitions:
  ready/running/review -> blocked
  running/review -> failed
  failed -> ready          (explicit retry)
  blocked -> ready         (blocker resolved)
  review -> running        (revision required)
  verified -> review       (artifact or relevant policy changed)

Rules:
  - "completed" requires required checks and approvals.
  - A changed artifact invalidates verification for the changed revision.
  - A failed workflow cannot become completed by changing its status alone.
  - A retry creates a new attempt linked to the original run.

```

The exact state names can change, but the rules must remain explicit. If the source revision changes after a successful test, that test result cannot certify the new revision.

### Decision and artifact versioning

Approved decisions should be superseded, not silently edited. Each revision should preserve:

- Decision identifier and revision number.
- Proposed content, rationale, alternatives and supporting evidence.
- Author or initiating actor and timestamp.
- Review and approval status.
- The decision it supersedes, if applicable.

Artifacts should have an immutable revision reference or content hash where practical. Git commits can serve as source revision identifiers, while generated files can use checksums and version records. A checksum proves content identity, not that the content is safe or correct.

## 5. Data model and storage design

Use relational records for authoritative application state, Markdown for portable knowledge, and Git for source-code history. Avoid duplicating the same authoritative decision in several files and tables without a defined synchronization rule.

### Core entities

| Entity             | Key fields                                                             | Purpose                                          |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------ |
| `Project`          | `id`, `name`, `root_path`, `status`, `created_at`                      | Project identity and authorized workspace.       |
| `Requirement`      | `id`, `project_id`, `revision`, `status`, `content`                    | Versioned project requirements.                  |
| `Decision`         | `id`, `project_id`, `revision`, `status`, `rationale`, `supersedes_id` | Architecture and engineering decisions.          |
| `Task`             | `id`, `project_id`, `status`, `expected_revision`, `criteria`          | Unit of work and acceptance requirements.        |
| `ContextSnapshot`  | `id`, `task_id`, `source_revision`, `content_hash`                     | Record of the context supplied to a run.         |
| `PromptTemplate`   | `id`, `version`, `template`, `schema`                                  | Reusable, versioned prompts.                     |
| `ModelRun`         | `id`, `task_id`, `provider`, `model`, `status`                         | Model invocation and execution result metadata.  |
| `ArtifactRevision` | `id`, `task_id`, `path`, `content_hash`, `source_revision`             | Proposed or accepted artifact revision.          |
| `WorkflowRun`      | `id`, `workflow_version`, `status`, `checkpoint`                       | Durable workflow execution state.                |
| `ValidationResult` | `id`, `artifact_revision_id`, `check`, `status`, `evidence`            | Results of tests and quality checks.             |
| `Approval`         | `id`, `action_hash`, `artifact_revision_id`, `decision`                | Approval bound to a reviewed action or revision. |
| `AuditEvent`       | `id`, `actor`, `operation`, `target`, `outcome`                        | History of important operations.                 |
| `ProviderConfig`   | `id`, `provider`, `enabled`, `capabilities`                            | Non-secret integration configuration.            |
| `ToolPermission`   | `id`, `scope`, `tool`, `permission_level`                              | Explicit tool authorization.                     |

Additional tables can be added when a real workflow requires them. Do not implement every entity in the first release simply because it appears in the architecture.

### Database rules

- Enable SQLite foreign-key enforcement on every database connection.
- Use migrations instead of editing production schemas manually.
- Use transactions for operations that update related canonical records.
- Use unique constraints for identifiers, revisions, and idempotency keys where appropriate.
- Use optimistic concurrency checks on records that can be updated by multiple workflows.
- Store timestamps in a consistent UTC representation.
- Use structured error handling for constraint violations; never silently discard a failed write.
- Keep provider secrets outside the database.
- Treat audit history as append-only at the application level, with database protections and backups appropriate to the threat model.

### Example: accepting a model-generated change

```
def accept_artifact(task, proposal, approval, validation):    # Conceptual domain logic: each operation below must    # execute inside a transaction or equivalent safe boundary.    assert proposal.task_id == task.id    assert proposal.source_revision == task.expected_revision    assert approval.artifact_revision_id == proposal.id    assert approval.decision == "approved"    assert validation.artifact_revision_id == proposal.id    assert validation.required_checks_passed    # Production implementation must additionally:    # 1. Verify the current repository revision.    # 2. Check the approval's action hash and scope.    # 3. Verify all required checks are current.    # 4. Perform a concurrency-safe state transition.    # 5. Record the accepted revision and audit event.    # 6. Roll back the transaction if any write fails.    return "Acceptance permitted only after all guards pass"
```

This is an illustrative contract, not production-ready acceptance code. The real implementation must use explicit exceptions and transactional persistence rather than relying on Python `assert` statements for security or integrity enforcement.

## 6. Workflow engine design

The workflow engine coordinates model calls, external tools, validation, and approvals. It should be a persistent state machine, not a sequence of API calls that exists only in memory.

### Standard execution lifecycle

1\. Create task

Validate project, task definition, permissions and acceptance criteria.

2\. Freeze inputs

Record the prompt version, context snapshot, relevant files and source revision.

3\. Authorize execution

Resolve the provider/tool, allowed operations, privacy rules and budget.

4\. Execute

Create a durable run record before calling the provider or starting a tool.

5\. Capture result

Persist the response, status, usage metadata, logs and any proposed artifact.

6\. Verify

Run configured checks against the precise proposed artifact revision.

7\. Approve

Request human approval when required and bind it to the exact revision/action.

8\. Commit state

Record the accepted revision, task transition and audit event atomically where possible.

9\. Reconcile

On interruption, determine what completed before retrying or resuming.

### Workflow reliability requirements

1. Persist the run before initiating external work.
2. Set explicit timeouts and bounded retry counts.
3. Classify errors as transient, permanent, permission-related, or unknown.
4. Use idempotency keys where supported and keep a record of side effects.
5. Do not assume that a timed-out external operation did not happen.
6. Support cancellation without losing the record of partial execution.
7. Recover interrupted runs through reconciliation, not by blindly rerunning every step.
8. Record the workflow definition version and current step.
9. Require explicit policies for parallel work and integration conflicts.
10. Ensure every terminal state-success, failure, cancellation-has a recorded outcome.

Exactly-once execution cannot be assumed across arbitrary external APIs and local processes. Design for durable tracking, idempotent operations where possible, and reconciliation when the external outcome is uncertain.

## 7. Provider adapter contract

Every model integration should implement a common interface while exposing provider-specific capabilities explicitly.

```
from dataclasses import dataclassfrom typing import Protocol, Any@dataclass(frozen=True)class ModelRequest:    task_id: str    prompt_version: str    context_snapshot_id: str    model: str    system_prompt: str    user_prompt: str    timeout_seconds: int = 90    max_output_tokens: int = 4096@dataclassclass ModelResponse:    provider: str    model: str    status: str    text: str | None = None    input_tokens: int | None = None    output_tokens: int | None = None    provider_request_id: str | None = None    error_code: str | None = Noneclass ModelAdapter(Protocol):    async def generate(        self, request: ModelRequest    ) -> ModelResponse:        ...    async def health_check(self) -> bool:
```

Required adapter behaviors:

- Normalize success and failure responses.
- Enforce timeouts, output limits, and usage budgets.
- Avoid logging secrets or complete sensitive prompts by default.
- Preserve the provider's request identifier when available.
- Return an explicit error status rather than a fabricated response.
- Support cancellation where the underlying API permits it.
- Declare capabilities without pretending that every provider supports every feature.
- Keep provider-specific SDK logic inside the adapter.

For local inference, apply the same policy checks as for cloud providers. Local execution reduces the need to send data externally but does not automatically make generated code, local tools, or the endpoint trustworthy.

## 8. Automated regression test strategy

Testing must verify the invariants and security boundaries, not merely whether endpoints return HTTP 200.

Use `pytest` for Python tests, FastAPI's test client for API tests, temporary SQLite databases for persistence tests, and controlled fakes for external providers. Add browser and packaged-desktop tests when the UI and desktop boundary are introduced.

### Test layers

| Layer                      | What to test                                                         | Example failure the test must catch                                   |
| -------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Unit tests                 | State transitions, context assembly, routing and policy decisions    | A failed task can transition directly to completed.                   |
| Database integrity         | Foreign keys, revisions, transactions and deletion rules             | Deleting a project leaves orphaned task records.                      |
| API contract tests         | Request schemas, response formats, authorization and error handling  | Invalid input reaches the workflow engine.                            |
| Provider adapter tests     | Success, timeouts, throttling, malformed responses and cancellation  | An API timeout is incorrectly recorded as success.                    |
| Workflow integration tests | Retry, resume, cancellation and approval                             | Restarting the app loses a previously acknowledged task.              |
| Security tests             | Path traversal, symlink escape, secret leakage and permission bypass | An agent reads a file outside its authorized root.                    |
| Concurrency tests          | Simultaneous updates, duplicate requests and stale revisions         | One task update silently overwrites another.                          |
| Verification tests         | Revision binding and release gates                                   | Tests for an old commit are used to approve a newer change.           |
| Recovery tests             | Backup, restoration, migration and interrupted operations            | A restore completes but loses accepted decisions.                     |
| UI/E2E tests               | Project creation through task acceptance                             | The UI reports completion while backend validation failed.            |
| Packaging tests            | Desktop permissions, startup, upgrade and shutdown                   | The packaged app exposes the local API beyond its intended interface. |

### Minimum regression scenarios

These are release-blocking scenarios, not optional examples.

<img width="597" height="731" alt="image" src="https://github.com/user-attachments/assets/aa8471ab-1048-4408-a107-4fa5582df196" />


### Testing rules

- Unit and integration tests must run without real provider API credentials by default.
- Use deterministic fake adapters to simulate success, failure, throttling, delayed responses, and malformed outputs.
- Keep real-provider smoke tests separate from required offline regression tests.
- Test actual security boundaries, not only mocked permission checks.
- Use temporary directories and disposable repositories for filesystem and Git tests.
- Add a regression test for every confirmed defect.
- Keep test fixtures free of real credentials and private user data.
- Require a tested database upgrade and backup restoration path.
- Run the same critical checks in local development and CI.
- Never disable a failing mandatory test merely to make a release green.

### Example test contract

```
def test_failed_required_check_cannot_verify_task(    task_service,    validation_repository,):    task = task_service.create_task(        project_id="project-test",        title="Add authentication",    )    validation_repository.record(        task_id=task.id,        check_name="required_regression_tests",        status="failed",        artifact_revision="revision-123",    )    result = task_service.try_mark_verified(        task_id=task.id,        artifact_revision="revision-123",    )    assert result.status == "rejected"    assert result.reason == "required_check_failed"    assert task_service.get_task(task.id).status != "verified"
```

This illustrates the intended behavior. The actual test suite must use real domain services and persisted test data, with fixtures ensuring that the test cannot pass simply because a mock returns a predetermined answer.

## 9. Release-blocking quality gates

Define the release pipeline before implementing additional product modules.

Gate 1

Static and dependency checks

Formatting, linting, type checks where applicable, dependency audit and secret scan.

Gate 2

Unit and integrity tests

State transitions, database constraints, revisions, audit records and transaction behavior.

Gate 3

Security regression suite

Authorization, filesystem containment, redaction, untrusted content and command restrictions.

Gate 4

Workflow integration tests

Provider errors, retries, cancellation, checkpoint recovery and idempotency.

Gate 5

Artifact verification

Required tests must match the exact candidate revision and configured environment.

Gate 6

Recovery and migration tests

Backup restoration, database upgrades, failure rollback and startup recovery.

Gate 7

Packaged application checks

Desktop startup, local API exposure, filesystem permissions and clean shutdown.

Gate 8

Release authorization

All mandatory gates pass; any required human approval applies to the final candidate.

### Release decision rules

A release is blocked if any of the following occurs:

- A mandatory test fails, is missing, or is skipped without an explicitly approved policy exception.
- An unauthorized file, tool, network, or API operation succeeds.
- A model response can silently alter canonical approved state.
- A failed required check can be bypassed through the API or UI.
- Validation evidence refers to a different artifact revision than the candidate being approved.
- A sensitive operation lacks the required audit record.
- Secret leakage is detected in a protected output or log.
- A migration, backup, or restore test fails.
- Crash recovery can lose acknowledged canonical state or report false success.
- The packaged application violates its intended local-only security boundary.

A warning is not equivalent to a passed check. If a gate is temporarily inapplicable, encode that explicitly in the release policy rather than silently skipping it.

### Example CI workflow

The exact commands depend on your repository and packaging setup, but the pipeline should follow this structure:

```

name: Engineering Quality Gates

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test-and-verify:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install project and test dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -e ".[dev]"

      - name: Formatting and lint checks
        run: |
          ruff format --check .
          ruff check .

      - name: Unit and integration tests
        run: |
          pytest -q

      - name: Enforce release-gate policy
        run: |
          python scripts/check_release_gates.py

```

This is a pipeline skeleton. The `.[dev]` extra and `scripts/check_release_gates.py` must exist in your project before the workflow will run successfully. Add dedicated dependency, secret-scanning, security, migration, recovery, and packaged-desktop jobs as their checks become available. Pin third-party CI actions to reviewed immutable commit SHAs in the hardened production workflow, rather than relying indefinitely on mutable major-version tags.

## 10. Recommended repository structure

Start with a modular monolith organized around domain boundaries. The layout below is a proposed starting point.

```

ai-workflow-orchestrator/
├── apps/
│   └── desktop/
│       ├── src/
│       ├── src-tauri/
│       └── tests/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── domain/
│   │   │   ├── projects/
│   │   │   ├── requirements/
│   │   │   ├── decisions/
│   │   │   ├── tasks/
│   │   │   ├── approvals/
│   │   │   └── artifacts/
│   │   ├── orchestration/
│   │   ├── integrations/
│   │   │   ├── providers/
│   │   │   ├── coding_agents/
│   │   │   └── mcp/
│   │   ├── context/
│   │   ├── verification/
│   │   ├── security/
│   │   ├── persistence/
│   │   └── audit/
│   ├── migrations/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       ├── security/
│       ├── recovery/
│       └── e2e/
├── workflows/
├── prompts/
├── docs/
│   ├── architecture/
│   ├── security/
│   ├── invariants/
│   └── release-process/
├── scripts/
│   ├── check_release_gates.py
│   ├── verify_backup.py
│   └── validate_migrations.py
├── pyproject.toml
├── README.md
└── .github/
    └── workflows/
        └── quality-gates.yml

```

Keep domain logic independent of FastAPI endpoints and provider SDKs. That makes it possible to test state transitions without launching the desktop application or contacting external AI services.

## 11. Implementation roadmap with approval gates

The order of implementation matters more than the number of features.

## R0.1

Foundation

Canonical state and integrity

Implement projects, requirements, decisions, tasks, revisions, SQLite constraints, migrations, audit records, and state-transition tests.

Exit gate: invalid state transitions and silent decision overwrites are rejected by automated tests.

## R0.2

Context

Context snapshots and manual handoffs

Add versioned prompts, task packet generation, response import, provenance, search, and backup/restore.

Exit gate: a task can move between two AI tools while preserving its approved context and decision history.

## R0.3

Providers

Secure model adapters

Implement a common provider contract, credential storage, timeout handling, bounded retries, and local Ollama integration.

Exit gate: provider failures never become fabricated success, and secrets are not exposed in ordinary logs.

## R0.4

Verification

Git and quality gates

Add revision-aware diffs, test execution, validation evidence, approvals, and release-gate enforcement.

Exit gate: failed mandatory checks and stale artifact revisions cannot be approved through any application path.

## R0.5

Automation

Controlled workflow execution

Add durable jobs, checkpoint recovery, scoped coding-agent execution, isolated worktrees, and MCP permissions.

Exit gate: interrupted workflows recover safely, and tool execution remains within explicit permissions.

## R0.6+

Expansion

Advanced automation and collaboration

Add workflow analytics, additional providers, team synchronization, cloud workers, and subscription features when justified.

Exit gate: the existing integrity and security suite remains green with the new capabilities enabled.

Do not advance to the next release merely because the code is written. Advance only when its exit criteria are met and recorded.

## 12. Definition of done for every feature

Every new feature must include:

- A documented purpose, scope, and explicit acceptance criteria.
- Identified trust boundaries, required permissions, and failure modes.
- Data-model changes and migration behavior, where applicable.
- Unit tests and relevant regression, integration, and security tests.
- Defined error handling, timeout, cancellation, and recovery behavior.
- Audit and provenance requirements for state-changing operations.
- UI/API behavior consistent with backend authorization.
- Documentation and a release-gate update if the feature introduces a new risk.
- Verification evidence tied to the relevant source revision.

A feature is not complete simply because the interface works or a model reports success.

## 13. Initial engineering acceptance checklist

## Release readiness

- [ ] Domain entities, database constraints and permitted state transitions are documented.
- [ ] Canonical decisions and requirements cannot be silently overwritten.
- [ ] Every model run references the correct task, prompt version and context snapshot where applicable.
- [ ] All protected operations enforce backend permissions, regardless of the UI.
- [ ] Filesystem access rejects unauthorized paths and symlink escapes.
- [ ] Secrets are protected from ordinary logs, prompts and exports.
- [ ] Provider errors, retries, timeouts and cancellation have deterministic tested behavior.
- [ ] Validation results and approvals are bound to the relevant artifact revision.
- [ ] Failed mandatory checks cannot be bypassed to mark work verified or release-ready.
- [ ] Workflow recovery, database migration and backup restoration tests pass.
- [ ] All critical regression and security tests run automatically in CI.
- [ ] The packaged desktop application respects the intended local-only security boundary.

## Final architectural recommendation

Build the platform around five non-negotiable foundations:

1. Canonical state and explicit invariants - approved project knowledge must have a clear owner, revision, and lifecycle.
2. Secure integration boundaries - every model, coding agent, MCP server, and external tool receives only the access it needs.
3. Durable orchestration - retries, cancellation, recovery, and partial failures must be recorded and handled explicitly.
4. Independent verification - model output is a proposal; tests, evidence, revision checks, and approvals determine acceptance.
5. Release-blocking automation - no new feature is released when its mandatory security, integrity, regression, or recovery gates fail.

The first milestone should be a trustworthy local project state and a complete manual AI handoff workflow. Once that passes its tests, add provider APIs; once those are reliable, add controlled coding agents. This sequence establishes a defensible architecture before integration complexity begins to grow.
