import {
  type AskUserCardData,
  type ChatAttachmentSummary,
  type ChatMessageItem,
  type ContextReferenceItem,
  type DeepQuestionFormConfig,
  type DeepResearchFormConfig,
  type FilePreviewSource,
  type LLMOption,
  type LLMSelection,
  type MasteryTopicLabel,
  type QuizQuestionItem,
  type ReadingCollectionLabel,
  type ResearchCardState,
  type SessionSummary,
  rebalanceQuizCounts,
} from './model';

export const INITIAL_LLM_OPTIONS: LLMOption[] = [
  {
    id: 'llm-claude-sonnet',
    provider: 'anthropic',
    provider_label: 'Anthropic',
    model: 'claude-3-7-sonnet',
    model_name: 'claude-3-7-sonnet',
    is_active_default: true,
    context_window: 200_000,
  },
  {
    id: 'llm-gpt-4-1',
    provider: 'openai',
    provider_label: 'OpenAI',
    model: 'gpt-4.1',
    model_name: 'gpt-4.1',
    is_active_default: false,
    context_window: 128_000,
  },
  {
    id: 'llm-gemini-2-5-pro',
    provider: 'google',
    provider_label: 'Google',
    model: 'gemini-2.5-pro',
    model_name: 'gemini-2.5-pro',
    is_active_default: false,
    context_window: 1_000_000,
  },
  {
    id: 'llm-deepseek-r1',
    provider: 'deepseek',
    provider_label: 'DeepSeek',
    model: 'deepseek-r1',
    model_name: 'deepseek-r1',
    is_active_default: false,
    context_window: 64_000,
  },
];

export const DEFAULT_LLM_SELECTION: LLMSelection = {
  provider: 'anthropic',
  model: 'claude-3-7-sonnet',
};

export const MASTERY_TOPICS_BY_WORKSPACE: Record<string, MasteryTopicLabel[]> = {
  '': [
    { id: 'path-general', title: 'Linear Algebra Foundations' },
  ],
  'fixture-ws-a': [
    { id: 'path-a', title: 'Mathematics Path' },
  ],
  'fixture-ws-b': [
    { id: 'path-b', title: 'Geometry Path' },
  ],
};

export const READING_COLLECTIONS_BY_WORKSPACE: Record<string, ReadingCollectionLabel[]> = {
  '': [
    { id: 'reading-general', title: 'Applied Mathematics Papers' },
  ],
  'fixture-ws-a': [
    { id: 'collection-a', title: 'Mathematics Reading' },
  ],
  'fixture-ws-b': [
    { id: 'collection-b', title: 'Geometry Reading' },
  ],
};

export const PERSONAL_SUGGESTION_SETS: string[][] = [
  [
    'Walk me through why the Fourier transform decomposes signals into orthogonal sinusoids.',
    'Give me 3 progressively harder eigenvalues problems and check my steps.',
    'Summarize how singular value decomposition connects to low-rank matrix approximation.',
  ],
  [
    'Compare geometric multiplicity and algebraic multiplicity with a 2×2 counterexample.',
    'Help me build a 5-day revision plan for multivariable chain rule and gradients.',
    'Explain Parseval’s theorem using an energy conservation analogy.',
  ],
];

export const SAMPLE_ATTACHMENT_CANDIDATES: ChatAttachmentSummary[] = [
  {
    id: 'att-calculus-pdf',
    name: 'calculus-notes.pdf',
    sizeLabel: '420 KB',
    mimeType: 'application/pdf',
    status: 'ready',
  },
  {
    id: 'att-diagram-png',
    name: 'diagram-board.png',
    sizeLabel: '180 KB',
    mimeType: 'image/png',
    status: 'ready',
  },
  {
    id: 'att-oversized-video',
    name: 'lecture-recording.mp4',
    sizeLabel: '32 MB',
    mimeType: 'video/mp4',
    status: 'invalid',
    errorReason: 'Attachments must be between 1 byte and 25 MB',
  },
  {
    id: 'att-unsupported-bin',
    name: 'archive-dump.exe',
    sizeLabel: '12 KB',
    mimeType: 'application/octet-stream',
    status: 'invalid',
    errorReason: 'Unsupported attachment type',
  },
];

export const WORKSPACE_KNOWLEDGE_BASES: ContextReferenceItem[] = [
  {
    id: 'ref-kb-linear-algebra',
    kind: 'kb',
    label: 'Gilbert Strang — Linear Algebra KB',
    subtitle: '48 indexed sections · Eigenvalues, SVD, Projections',
    sourceId: 'kb-linear-algebra',
    status: 'valid',
  },
  {
    id: 'ref-kb-signals',
    kind: 'kb',
    label: 'Oppenheim — Signals & Systems KB',
    subtitle: '36 indexed sections · Fourier, Laplace, Sampling',
    sourceId: 'kb-signals',
    status: 'valid',
  },
  {
    id: 'ref-kb-stale',
    kind: 'kb',
    label: 'Archived Differential Equations KB',
    subtitle: 'Unavailable in current workspace',
    sourceId: 'kb-diff-eq-archived',
    status: 'unavailable',
  },
];

export const WORKSPACE_NOTE_BOOK_REFS: ContextReferenceItem[] = [
  {
    id: 'ref-note-spectral-summary',
    kind: 'note',
    label: 'Spectral Theorem & Symmetric Matrices Note',
    subtitle: 'Study note · Updated 2 days ago',
    sourceId: 'note-spectral-summary',
    status: 'valid',
  },
  {
    id: 'ref-note-fft-cheatsheet',
    kind: 'note',
    label: 'DFT & FFT Windowing Reference',
    subtitle: 'Reading pack · 6 pages',
    sourceId: 'note-fft-cheatsheet',
    status: 'valid',
  },
];

export const SAMPLE_PREVIEW_FILES: FilePreviewSource[] = [
  {
    id: 'file-fourier-md',
    filename: 'fourier_derivation.md',
    mimeType: 'text/markdown',
    sizeBytes: 4_820,
    origin: 'artifact',
    ownerSessionId: 'session-general-1',
    status: 'ready',
    content: [
      '# Fourier Series & Discrete Transform Derivation',
      '',
      'For a discrete signal $x[n]$ of length $N = 256$, the DFT coefficients are:',
      '',
      '```python',
      'import numpy as np',
      'def dft_matrix(N: int) -> np.ndarray:',
      '    k = np.arange(N).reshape((N, 1))',
      '    n = np.arange(N).reshape((1, N))',
      '    return np.exp(-2j * np.pi * k * n / N)',
      '```',
      '',
      '- Orthogonal basis columns satisfy $W^* W = N \\cdot I$.',
      '- Fast Fourier Transform reduces complexity from $O(N^2)$ to $O(N \\log N)$.',
    ].join('\n'),
  },
  {
    id: 'file-fft-py',
    filename: 'fft_verification.py',
    mimeType: 'text/x-python',
    sizeBytes: 1_940,
    origin: 'artifact',
    ownerSessionId: 'session-general-1',
    status: 'ready',
    content: [
      'import numpy as np',
      '',
      'def verify_orthogonality(n_samples: int = 256) -> float:',
      '    t = np.linspace(0.0, 1.0, n_samples, endpoint=False)',
      '    mode_5 = np.cos(2 * np.pi * 5 * t)',
      '    mode_12 = np.sin(2 * np.pi * 12 * t)',
      '    inner_product = float(np.dot(mode_5, mode_12) / n_samples)',
      '    return round(abs(inner_product), 8)',
      '',
      'if __name__ == "__main__":',
      '    print("Orthogonality residual:", verify_orthogonality())',
    ].join('\n'),
  },
  {
    id: 'file-calculus-pdf',
    filename: 'calculus-notes.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 430_080,
    origin: 'attachment',
    ownerSessionId: 'session-general-1',
    pageNumber: 14,
    status: 'ready',
    content: [
      'Chapter 4 — Orthogonal Projections & Least Squares (Page 14)',
      '',
      'Theorem 4.2: Let V be a subspace of R^n with orthonormal basis {q_1, ..., q_k}.',
      'The orthogonal projection of any vector b onto V is given by:',
      '  proj_V(b) = Q Q^T b',
      'where Q is the n × k matrix whose columns are q_1, ..., q_k.',
    ].join('\n'),
  },
  {
    id: 'file-diagram-svg',
    filename: 'phasor_projection.svg',
    mimeType: 'image/svg+xml',
    sizeBytes: 3_120,
    origin: 'artifact',
    ownerSessionId: 'session-general-1',
    status: 'ready',
    content:
      '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><!-- Unit circle phasor projection diagram --></svg>',
  },
  {
    id: 'file-board-png',
    filename: 'diagram-board.png',
    mimeType: 'image/png',
    sizeBytes: 184_320,
    origin: 'attachment',
    ownerSessionId: 'session-general-2',
    status: 'ready',
    content: 'Whiteboard capture: Eigenvalue geometric stretching along principal axes v1 and v2.',
  },
  {
    id: 'file-spectral-xlsx',
    filename: 'spectral_table.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeBytes: 18_400,
    origin: 'artifact',
    ownerSessionId: 'session-general-1',
    status: 'ready',
    tableRows: [
      ['Bin (k)', 'Frequency (Hz)', 'Magnitude |X[k]|', 'Phase (rad)'],
      ['0', '0.0', '0.00', '0.00'],
      ['5', '5.0', '128.00', '0.00'],
      ['12', '12.0', '64.00', '-1.57'],
      ['24', '24.0', '4.20', '0.31'],
    ],
  },
  {
    id: 'file-syllabus-docx',
    filename: 'linear_algebra_study_guide.docx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sizeBytes: 28_672,
    origin: 'workspace',
    ownerSessionId: 'session-general-2',
    status: 'ready',
    content: [
      'Linear Algebra Midterm Study Guide (DOCX Extract)',
      '1. Characteristic polynomial det(A - λI) = 0 and trace/determinant invariants.',
      '2. Diagonalization A = S Λ S^{-1} when n linearly independent eigenvectors exist.',
      '3. Orthogonal diagonalization A = Q Λ Q^T for real symmetric matrices.',
    ].join('\n'),
  },
  {
    id: 'file-binary-fallback',
    filename: 'model_checkpoint.bin',
    mimeType: 'application/octet-stream',
    sizeBytes: 1_048_576,
    origin: 'artifact',
    ownerSessionId: 'session-general-2',
    status: 'ready',
  },
];

export const DEFAULT_QUIZ_CONFIG: DeepQuestionFormConfig = {
  mode: 'custom',
  totalCount: 4,
  difficulty: 'medium',
  selectedTypes: ['choice', 'true_false', 'written'],
  typeCounts: rebalanceQuizCounts(4, ['choice', 'true_false', 'written']),
  mimicPaperTitle: 'MIT 18.06 Quiz 2 Reference Paper',
};

export const DEFAULT_RESEARCH_CONFIG: DeepResearchFormConfig = {
  mode: 'study_notes',
  depth: 'standard',
  subtopics: 3,
  iterations: 2,
};

export function createSampleAskUserCard(): AskUserCardData {
  return {
    id: 'ask-eigen-diagnostic',
    title: 'Before generating your tailored Eigenvalues drill, clarify your study focus:',
    status: 'pending',
    questions: [
      {
        id: 'q-goal',
        header: 'Target Depth',
        prompt: 'Which aspect of eigenvalues and eigenvectors do you want to prioritize right now?',
        multiSelect: false,
        allowFreeText: true,
        options: [
          {
            id: 'opt-compute',
            label: 'Hand computation (2×2 & 3×3)',
            description: 'Solving det(A - λI) = 0 and null-space basis vectors step by step.',
          },
          {
            id: 'opt-geometric',
            label: 'Geometric intuition & invariants',
            description: 'Understanding trace, determinant, and eigenspace stretching.',
          },
          {
            id: 'opt-spectral',
            label: 'Symmetric matrices & SVD bridge',
            description: 'Orthogonal eigenvectors and spectral decomposition A = QΛQ^T.',
          },
        ],
      },
      {
        id: 'q-format',
        header: 'Practice Style',
        prompt: 'Which verification formats help you most? (Select one or more)',
        multiSelect: true,
        allowFreeText: true,
        options: [
          {
            id: 'opt-worked',
            label: 'Step-by-step worked algebra',
            description: 'Show intermediate row reductions.',
          },
          {
            id: 'opt-counterexample',
            label: 'Defective matrix counterexamples',
            description: 'Contrast algebraic vs. geometric multiplicity.',
          },
          {
            id: 'opt-python',
            label: 'NumPy verification snippets',
            description: 'Include runnable np.linalg.eig checks.',
          },
        ],
      },
    ],
    answers: {},
  };
}

export function createSampleQuizQuestions(): QuizQuestionItem[] {
  return [
    {
      id: 'quiz-q1',
      index: 1,
      type: 'choice',
      difficulty: 'easy',
      prompt: 'For the matrix A = [[4, 1], [2, 3]], what is the sum of its eigenvalues λ₁ + λ₂?',
      options: ['5', '7', '10', '12'],
      correctAnswer: '7',
      referenceExplanation:
        'The sum of the eigenvalues of any square matrix equals its trace: tr(A) = 4 + 3 = 7 (since λ₁ = 5 and λ₂ = 2).',
      aiJudgmentHint:
        'Checks whether the learner uses trace(A) = 4 + 3 = 7 or solves (4-λ)(3-λ)-2 = 0.',
    },
    {
      id: 'quiz-q2',
      index: 2,
      type: 'true_false',
      difficulty: 'medium',
      prompt: 'Every real symmetric matrix A = A^T can be diagonalized by an orthogonal matrix Q.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      referenceExplanation:
        'By the Real Spectral Theorem, every real symmetric matrix has real eigenvalues and a complete orthonormal basis of eigenvectors.',
      aiJudgmentHint:
        'Verifies recall of the Real Spectral Theorem (A = Q Λ Q^T).',
    },
    {
      id: 'quiz-q3',
      index: 3,
      type: 'written',
      difficulty: 'hard',
      prompt:
        'Explain why a matrix with repeated eigenvalues might fail to be diagonalizable, and name the multiplicity condition required.',
      correctAnswer: 'geometric multiplicity',
      referenceExplanation:
        'A matrix is diagonalizable if and only if the geometric multiplicity (dimension of null(A - λI)) equals the algebraic multiplicity for every eigenvalue.',
      aiJudgmentHint:
        'Looks for comparison between geometric multiplicity (eigenspace dimension) and algebraic multiplicity.',
    },
  ];
}

export function createSampleResearchCard(
  topic = 'Spectral Decomposition & Low-Rank Matrix Approximation',
): ResearchCardState {
  return {
    id: 'research-spectral-card',
    topic,
    status: 'editing',
    outline: [
      {
        id: 'sub-1',
        title: '1. Spectral Theorem for Symmetric Matrices',
        overview:
          'Analyze orthogonal eigenspaces, Rayleigh quotients, and energy interpretation of principal modes.',
      },
      {
        id: 'sub-2',
        title: '2. Eckart–Young–Mirsky Low-Rank Approximation',
        overview:
          'Connect eigenvalues of A^T A to singular values σ_i and optimal Frobenius/spectral norm truncation.',
      },
      {
        id: 'sub-3',
        title: '3. Numerical Stability & Power Iteration',
        overview:
          'Compare direct characteristic polynomial roots against QR iteration and Lanczos methods.',
      },
    ],
    reportMarkdown: [
      '### Synthesized Study Report: Spectral Decomposition & Low-Rank Approximation',
      '',
      '#### 1. Orthogonal Eigenspaces (`A = Q Λ Q^T`)',
      'When $A \\in \\mathbb{R}^{n \\times n}$ is symmetric, eigenvectors corresponding to distinct eigenvalues are automatically orthogonal `[1]`. The quadratic form $x^T A x$ is maximized along the dominant eigenvector $q_1$ with value $\\lambda_{\\max}$.',
      '',
      '#### 2. Bridge to Singular Value Decomposition (`A = U Σ V^T`)',
      'For rectangular or non-symmetric matrices, the eigenvalues of $A^T A$ are $\\sigma_i^2 \\ge 0$. By the **Eckart–Young theorem**, truncating to the top $k$ singular triplets yields the best rank-$k$ approximation in both spectral and Frobenius norms `[2]`.',
      '',
      '#### 3. Practical Numerical Rule',
      'Never compute eigenvalues of $n > 4$ matrices by expanding $\\det(A - \\lambda I) = 0$; root-finding on high-degree polynomials is ill-conditioned (Wilkinson’s polynomial) `[3]`. Use `np.linalg.eigh` for symmetric matrices.',
    ].join('\n'),
    citations: [
      {
        id: 'cit-1',
        index: 1,
        title: 'Strang — Introduction to Linear Algebra, Ch. 6 (Symmetric Matrices)',
        source: 'Gilbert Strang — Linear Algebra KB',
        snippet: 'Every real symmetric matrix has real eigenvalues and perpendicular eigenvectors.',
      },
      {
        id: 'cit-2',
        index: 2,
        title: 'Eckart–Young–Mirsky Low-Rank Theorem Notes',
        source: 'Saved Favorites · Linear Algebra & Spectral Theory',
        snippet: 'The rank-k truncation A_k minimizes ||A - B||_F over all rank-k matrices B.',
      },
      {
        id: 'cit-3',
        index: 3,
        title: 'Trefethen & Bau — Numerical Linear Algebra, Lecture 24',
        source: 'Applied Mathematics Papers',
        snippet: 'QR iteration with Wilkinson shifts converges cubically for symmetric tridiagonal matrices.',
      },
    ],
  };
}

export function createInitialSessions(): SessionSummary[] {
  return [
    {
      session_id: 'session-general-1',
      title: 'Fourier transform intuition',
      created_at: '2026-04-20T08:30:00Z',
      updated_at: '2026-04-20T14:20:00Z',
      message_count: 4,
      last_message_preview:
        'Each frequency component acts like an inner product projecting the signal onto a complex exponential basis.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: '',
      workspace_mode: 'chat',
      preferences: {
        pinned: true,
        archived: false,
        workspace_id: '',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
        selected_branches: { 'null': 101 },
      },
    },
    {
      session_id: 'session-general-tutor-1',
      title: 'Clarifying orthogonality',
      created_at: '2026-04-20T09:15:00Z',
      updated_at: '2026-04-20T13:10:00Z',
      message_count: 2,
      last_message_preview:
        'Two basis functions are orthogonal when their integral product over a full period equals zero.',
      session_type: 'selection_tutor',
      parent_session_id: 'session-general-1',
      workspace_id: '',
      workspace_mode: 'chat',
      preferences: {
        pinned: false,
        archived: false,
        workspace_id: '',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      },
    },
    {
      session_id: 'session-general-2',
      title: 'Eigenvalues & eigenvectors practice',
      created_at: '2026-04-19T11:00:00Z',
      updated_at: '2026-04-19T16:45:00Z',
      message_count: 2,
      last_message_preview:
        'Start by solving det(A - λI) = 0 to find the characteristic polynomial.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: '',
      workspace_mode: 'chat',
      preferences: {
        pinned: false,
        archived: false,
        workspace_id: '',
        llm: { provider: 'openai', model: 'gpt-4.1' },
      },
    },
    {
      session_id: 'session-general-mastery-1',
      title: 'Diagnostic check: Linear transformations',
      created_at: '2026-04-18T10:00:00Z',
      updated_at: '2026-04-18T17:30:00Z',
      message_count: 2,
      last_message_preview:
        'You correctly identified the kernel dimension; next let us verify the rank-nullity balance.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: '',
      workspace_mode: 'mastery_path',
      preferences: {
        pinned: false,
        archived: false,
        workspace_id: '',
        mastery_path_id: 'path-general',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      },
    },
    {
      session_id: 'session-general-reading-1',
      title: 'Notes on Strang Ch. 4',
      created_at: '2026-04-18T08:00:00Z',
      updated_at: '2026-04-18T12:15:00Z',
      message_count: 2,
      last_message_preview:
        'Projection matrices P = A(A^T A)^{-1}A^T satisfy P^2 = P and P^T = P.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: '',
      workspace_mode: 'immersive_reading',
      preferences: {
        pinned: false,
        archived: false,
        workspace_id: '',
        reading_workspace_id: 'reading-general',
        llm: { provider: 'google', model: 'gemini-2.5-pro' },
      },
    },
    {
      session_id: 'session-general-archived-1',
      title: 'Laplace transform table review',
      created_at: '2026-04-14T09:00:00Z',
      updated_at: '2026-04-15T10:00:00Z',
      message_count: 2,
      last_message_preview:
        'Shifting in the s-domain corresponds to exponential damping in the time domain.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: '',
      workspace_mode: 'chat',
      preferences: {
        pinned: false,
        archived: true,
        archived_at: '2026-04-15T10:00:00Z',
        workspace_id: '',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      },
    },
    {
      session_id: 'session-general-archived-mastery',
      title: 'Completed checkpoint: Matrix rank',
      created_at: '2026-04-13T09:00:00Z',
      updated_at: '2026-04-14T09:00:00Z',
      message_count: 2,
      last_message_preview:
        'Checkpoint mastered: row rank always equals column rank.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: '',
      workspace_mode: 'mastery_path',
      preferences: {
        pinned: false,
        archived: true,
        archived_at: '2026-04-14T09:00:00Z',
        workspace_id: '',
        mastery_path_id: 'path-general',
      },
    },
    {
      session_id: 'session-general-archived-reading',
      title: 'Archived paper summary: Spectral Graph Theory',
      created_at: '2026-04-11T09:00:00Z',
      updated_at: '2026-04-12T16:00:00Z',
      message_count: 2,
      last_message_preview:
        'The second smallest eigenvalue of the graph Laplacian measures algebraic connectivity.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: '',
      workspace_mode: 'immersive_reading',
      preferences: {
        pinned: false,
        archived: true,
        archived_at: '2026-04-12T16:00:00Z',
        workspace_id: '',
        reading_workspace_id: 'reading-general',
      },
    },
    {
      session_id: 'session-a',
      title: 'Mathematics Conversation',
      created_at: '2026-04-20T07:00:00Z',
      updated_at: '2026-04-20T15:00:00Z',
      message_count: 2,
      last_message_preview:
        'Integration by parts follows directly from the product rule for derivatives.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: 'fixture-ws-a',
      workspace_mode: 'chat',
      preferences: {
        pinned: true,
        archived: false,
        workspace_id: 'fixture-ws-a',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      },
    },
    {
      session_id: 'session-a-tutor',
      title: 'Integration by parts step',
      created_at: '2026-04-20T08:00:00Z',
      updated_at: '2026-04-20T12:30:00Z',
      message_count: 2,
      last_message_preview:
        'Choose u = x so that du = dx simplifies the remaining integral.',
      session_type: 'selection_tutor',
      parent_session_id: 'session-a',
      workspace_id: 'fixture-ws-a',
      workspace_mode: 'chat',
      preferences: {
        pinned: false,
        archived: false,
        workspace_id: 'fixture-ws-a',
      },
    },
    {
      session_id: 'session-a-mastery',
      title: 'Mastery Path · Calculus Diagnostics',
      created_at: '2026-04-19T09:00:00Z',
      updated_at: '2026-04-19T18:00:00Z',
      message_count: 2,
      last_message_preview:
        'Module 1 diagnostic complete: limits and continuity.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: 'fixture-ws-a',
      workspace_mode: 'mastery_path',
      preferences: {
        pinned: false,
        archived: false,
        workspace_id: 'fixture-ws-a',
        mastery_path_id: 'path-a',
      },
    },
    {
      session_id: 'session-a-archived',
      title: 'Early limits worksheet',
      created_at: '2026-04-10T10:00:00Z',
      updated_at: '2026-04-11T12:00:00Z',
      message_count: 2,
      last_message_preview:
        'Reviewed epsilon-delta definition on rational functions.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: 'fixture-ws-a',
      workspace_mode: 'chat',
      preferences: {
        pinned: false,
        archived: true,
        archived_at: '2026-04-11T12:00:00Z',
        workspace_id: 'fixture-ws-a',
      },
    },
    {
      session_id: 'session-b',
      title: 'Geometry Conversation',
      created_at: '2026-04-19T14:00:00Z',
      updated_at: '2026-04-19T15:30:00Z',
      message_count: 2,
      last_message_preview:
        'Inscribed angles subtending the same arc are equal.',
      session_type: 'chat',
      parent_session_id: null,
      workspace_id: 'fixture-ws-b',
      workspace_mode: 'chat',
      preferences: {
        pinned: false,
        archived: false,
        workspace_id: 'fixture-ws-b',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      },
    },
  ];
}

export function createInitialMessagesBySession(): Record<string, ChatMessageItem[]> {
  return {
    'session-general-1': [
      {
        id: 101,
        parentMessageId: null,
        role: 'user',
        content: 'Explain how the Fourier transform decomposes a signal using an everyday analogy and a code snippet.',
        createdAt: '2026-04-20T08:30:00Z',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
        references: [
          WORKSPACE_KNOWLEDGE_BASES[1],
          WORKSPACE_NOTE_BOOK_REFS[1],
        ],
      },
      {
        id: 102,
        parentMessageId: 101,
        role: 'assistant',
        content: [
          '### Intuitive Analogy: Unmixing a Musical Chord',
          'Imagine hearing a piano chord played all at once. Your ear hears a single combined pressure wave over time, yet a trained musician can pick out the individual notes (C, E, G) and how loud each note is.',
          '- **Time domain (`x(t)`)**: The combined waveform at each instant.',
          '- **Frequency domain (`X(f)`)**: The recipe of pure sinusoids and phases that sum back to the original signal.',
          '',
          '### Discrete Fourier Transform in Python',
          '```python',
          'import numpy as np',
          '',
          't = np.linspace(0, 1, 256, endpoint=False)',
          'signal = np.cos(2 * np.pi * 5 * t) + 0.5 * np.sin(2 * np.pi * 12 * t)',
          'spectrum = np.fft.rfft(signal)',
          'freqs = np.fft.rfftfreq(len(t), d=1/256)',
          'print(freqs[np.abs(spectrum) > 10])  # [ 5. 12.]',
          '```',
          '',
          '### Common Misconception',
          'The standard Fourier transform tells you *which* frequencies exist across the entire window, not *when* a brief frequency burst occurred. For time-localized frequency analysis, use a Short-Time Fourier Transform (STFT) or wavelets.',
        ].join('\n'),
        createdAt: '2026-04-20T08:30:12Z',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
        toolsUsed: ['kb_search', 'python_sandbox'],
        artifacts: [
          SAMPLE_PREVIEW_FILES[0],
          SAMPLE_PREVIEW_FILES[1],
          SAMPLE_PREVIEW_FILES[5],
        ],
        usage: {
          totalTokens: 482,
          latencySeconds: 1.4,
          model: 'claude-3-7-sonnet',
          providerLabel: 'Anthropic',
        },
      },
      {
        id: 103,
        parentMessageId: null,
        role: 'user',
        content: 'Give me a concise 3-bullet summary of the Fourier transform without code.',
        createdAt: '2026-04-20T08:35:00Z',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      },
      {
        id: 104,
        parentMessageId: 103,
        role: 'assistant',
        content: [
          '### Three-Point Summary of the Fourier Transform',
          '- **Projection onto sinusoids**: Each frequency bin measures how strongly the signal correlates with a sine and cosine wave at frequency `f`.',
          '- **Invertibility**: No information is lost — summing the weighted sinusoids via the inverse transform reconstructs the original waveform.',
          '- **Energy preservation**: By Parseval’s theorem, total signal energy in time equals total spectral energy in frequency.',
        ].join('\n'),
        createdAt: '2026-04-20T08:35:08Z',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
        usage: {
          totalTokens: 215,
          latencySeconds: 0.9,
          model: 'claude-3-7-sonnet',
          providerLabel: 'Anthropic',
        },
      },
    ],
    'session-general-tutor-1': [
      {
        id: 201,
        parentMessageId: null,
        role: 'user',
        content: 'Why do other frequencies cancel out when computing a single Fourier coefficient?',
        createdAt: '2026-04-20T09:15:00Z',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      },
      {
        id: 202,
        parentMessageId: 201,
        role: 'assistant',
        content:
          'Two distinct harmonic sinusoids complete a whole number of relative cycles over the fundamental period. Positive lobes and negative lobes of their product have equal area and opposite sign, so their integral over a full period is zero.',
        createdAt: '2026-04-20T09:15:06Z',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
        usage: {
          totalTokens: 194,
          latencySeconds: 0.8,
          model: 'claude-3-7-sonnet',
          providerLabel: 'Anthropic',
        },
      },
    ],
    'session-general-2': [
      {
        id: 301,
        parentMessageId: null,
        role: 'user',
        content: 'How do I find the eigenvalues of A = [[4, 1], [2, 3]]?',
        createdAt: '2026-04-19T11:00:00Z',
        llm: { provider: 'openai', model: 'gpt-4.1' },
      },
      {
        id: 302,
        parentMessageId: 301,
        role: 'assistant',
        content: [
          '### Step-by-Step Characteristic Equation',
          '1. Subtract `λ` from the diagonal entries: `A - λI = [[4 - λ, 1], [2, 3 - λ]]`.',
          '2. Set the determinant to zero:',
          '```text',
          '(4 - λ)(3 - λ) - (1)(2) = λ² - 7λ + 10 = (λ - 5)(λ - 2) = 0',
          '```',
          '3. The eigenvalues are **`λ₁ = 5`** and **`λ₂ = 2`**.',
        ].join('\n'),
        createdAt: '2026-04-19T11:00:09Z',
        llm: { provider: 'openai', model: 'gpt-4.1' },
        usage: {
          totalTokens: 260,
          latencySeconds: 1.1,
          model: 'gpt-4.1',
          providerLabel: 'OpenAI',
        },
      },
    ],
    'session-general-mastery-1': [
      {
        id: 401,
        parentMessageId: null,
        role: 'user',
        content: 'If a 3×5 matrix has rank 2, what is the dimension of its null space?',
        createdAt: '2026-04-18T10:00:00Z',
      },
      {
        id: 402,
        parentMessageId: 401,
        role: 'assistant',
        content:
          'By the **Rank-Nullity Theorem**, `rank(A) + nullity(A) = n` (number of columns = 5). Since `rank(A) = 2`, the null space has dimension `5 - 2 = 3`.',
        createdAt: '2026-04-18T10:00:07Z',
        usage: {
          totalTokens: 168,
          latencySeconds: 0.7,
          model: 'claude-3-7-sonnet',
          providerLabel: 'Anthropic',
        },
      },
    ],
    'session-general-reading-1': [
      {
        id: 501,
        parentMessageId: null,
        role: 'user',
        content: 'Why must a projection matrix satisfy P² = P?',
        createdAt: '2026-04-18T08:00:00Z',
      },
      {
        id: 502,
        parentMessageId: 501,
        role: 'assistant',
        content:
          'Once a vector `b` is projected onto a subspace (`p = Pb`), `p` already lies inside that subspace. Projecting it a second time leaves it unchanged: `P(Pb) = Pb`, so `P² = P`.',
        createdAt: '2026-04-18T08:00:05Z',
      },
    ],
    'session-general-archived-1': [
      {
        id: 601,
        parentMessageId: null,
        role: 'user',
        content: 'Remind me of the s-shift rule for Laplace transforms.',
        createdAt: '2026-04-15T10:00:00Z',
      },
      {
        id: 602,
        parentMessageId: 601,
        role: 'assistant',
        content:
          'Multiplying `f(t)` by `e^(at)` shifts its Laplace transform `F(s)` to `F(s - a)` for `s > a`.',
        createdAt: '2026-04-15T10:00:05Z',
      },
    ],
    'session-a': [
      {
        id: 701,
        parentMessageId: null,
        role: 'user',
        content: 'Show me how integration by parts works on ∫ x e^x dx.',
        createdAt: '2026-04-20T07:00:00Z',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      },
      {
        id: 702,
        parentMessageId: 701,
        role: 'assistant',
        content: [
          '### Integration by Parts: `∫ u dv = u v - ∫ v du`',
          '- Let `u = x` so `du = dx`.',
          '- Let `dv = e^x dx` so `v = e^x`.',
          '',
          '```text',
          '∫ x e^x dx = x e^x - ∫ e^x dx = x e^x - e^x + C = (x - 1)e^x + C',
          '```',
        ].join('\n'),
        createdAt: '2026-04-20T07:00:08Z',
        llm: { provider: 'anthropic', model: 'claude-3-7-sonnet' },
        usage: {
          totalTokens: 240,
          latencySeconds: 1.0,
          model: 'claude-3-7-sonnet',
          providerLabel: 'Anthropic',
        },
      },
    ],
    'session-a-tutor': [
      {
        id: 801,
        parentMessageId: null,
        role: 'user',
        content: 'What happens if I pick u = e^x and dv = x dx instead?',
        createdAt: '2026-04-20T08:00:00Z',
      },
      {
        id: 802,
        parentMessageId: 801,
        role: 'assistant',
        content:
          'Then `v = x²/2`, turning the remaining integral into `∫ (x²/2) e^x dx`, which has a higher power of `x` and is harder than the original integral.',
        createdAt: '2026-04-20T08:00:06Z',
      },
    ],
    'session-b': [
      {
        id: 901,
        parentMessageId: null,
        role: 'user',
        content: 'Why is an angle inscribed in a semicircle always a right angle?',
        createdAt: '2026-04-19T14:00:00Z',
      },
      {
        id: 902,
        parentMessageId: 901,
        role: 'assistant',
        content:
          'By Thales’s theorem, the central angle subtending a diameter is `180°`, and any inscribed angle subtending the same arc is half the central angle (`90°`).',
        createdAt: '2026-04-19T14:00:07Z',
      },
    ],
  };
}

export function buildSimulatedAssistantChunks(
  prompt: string,
  selection: LLMSelection,
  attachments: ChatAttachmentSummary[] = [],
): { chunks: string[]; usage: ChatMessageItem['usage']; suggestedTitle: string } {
  const cleanPrompt = prompt.trim() || 'Analyze the attached learning material';
  const words = cleanPrompt.replace(/[^\w\s-]/g, ' ').trim().split(/\s+/).slice(0, 6);
  const suggestedTitle =
    words.length > 0
      ? words.join(' ').slice(0, 48)
      : 'Study session';

  const providerMap: Record<string, string> = {
    anthropic: 'Anthropic',
    openai: 'OpenAI',
    google: 'Google',
    deepseek: 'DeepSeek',
  };
  const providerLabel = providerMap[selection.provider] ?? selection.provider;
  const attachmentLine =
    attachments.length > 0
      ? `\n- **Attached context**: ${attachments.map((a) => `\`${a.name}\``).join(', ')}`
      : '';

  const fullText = [
    `### Structured Walkthrough (${selection.model})`,
    `Here is a clear breakdown for **${cleanPrompt.slice(0, 80)}**:${attachmentLine}`,
    '- **Core principle**: Start from the underlying invariant before manipulating symbols.',
    '- **Verification check**: Test the boundary case (`n = 0` or `t = 0`) to confirm scaling.',
    '',
    '```python',
    '# Quick verification snippet',
    'def check_step(x: float) -> float:',
    '    return round(x * 2.0 + 1.0, 4)',
    '',
    'print(check_step(3.5))  # 8.0',
    '```',
    '',
    'Tell me which step you would like to test next or edit your message above to explore an alternative branch.',
  ].join('\n');

  const third = Math.max(40, Math.floor(fullText.length / 3));
  const chunks = [
    fullText.slice(0, third),
    fullText.slice(0, third * 2),
    fullText,
  ];

  return {
    chunks,
    suggestedTitle,
    usage: {
      totalTokens: 312 + attachments.length * 64,
      latencySeconds: 1.2,
      model: selection.model,
      providerLabel,
    },
  };
}
