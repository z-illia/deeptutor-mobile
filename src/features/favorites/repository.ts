import type { NotebookRecordItem, NotebookSummary } from './model';

/**
 * Deterministic M3.2 Favorites / Saved Originals fixtures.
 * Pure TypeScript module with zero transport or runtime dependencies.
 */

export function createInitialNotebooks(): NotebookSummary[] {
  return [
    {
      id: 'nb-linear-algebra',
      name: 'Linear Algebra Originals',
      description:
        'Saved conversations, quiz items, and spectral theorem derivations.',
      color: '#6366F1',
      record_count: 3,
      updated_at: 1776681600,
      workspace_id: '',
    },
    {
      id: 'nb-signals',
      name: 'Signals & Laplace Reference',
      description:
        'Key Fourier, Z-transform, and region-of-convergence snapshots.',
      color: '#1FB5A8',
      record_count: 2,
      updated_at: 1776595200,
      workspace_id: '',
    },
    {
      id: 'nb-corrupt',
      name: 'Legacy Imported Archive',
      description: 'Damaged collection snapshot retained for recovery inspection.',
      color: '#E8577A',
      record_count: 0,
      updated_at: 1776422400,
      unreadable: true,
      workspace_id: '',
    },
  ];
}

export function createInitialNotebookRecords(): Record<
  string,
  NotebookRecordItem[]
> {
  return {
    'nb-linear-algebra': [
      {
        id: 'fav-rec-101',
        notebook_id: 'nb-linear-algebra',
        type: 'chat',
        title: 'Fourier transform intuition & orthogonality',
        user_query:
          'Can you give me an intuitive explanation of the Fourier transform before we dive into the integral formula?',
        summary:
          'Musical chord decomposition into pure sinusoids and inner-product projection.',
        output: [
          '### Intuitive View of the Fourier Transform',
          'Think of the Fourier transform as **unmixing a musical chord** into the individual pure notes (sinusoids) that make it up.',
          '- **Time domain (`x(t)`)**: Tracks how the combined signal amplitude changes moment by moment.',
          '- **Frequency domain (`X(f)`)**: Reveals which frequencies are present and their relative strengths and phases.',
        ].join('\n'),
        created_at: 1776681000,
        metadata: {
          session_id: 'session-general-1',
          message_count: 2,
        },
      },
      {
        id: 'fav-rec-102',
        notebook_id: 'nb-linear-algebra',
        type: 'question',
        title: 'Spectral Theorem for Real Symmetric Matrices',
        user_query:
          'Why are eigenvectors of distinct eigenvalues of a real symmetric matrix A guaranteed to be orthogonal?',
        summary:
          'Self-adjoint inner product proof: <Ax, y> = <x, Ay> implies (lambda_1 - lambda_2)<x, y> = 0.',
        output: [
          'For a real symmetric matrix `A = A^T`, consider `A v_1 = λ_1 v_1` and `A v_2 = λ_2 v_2`:',
          '```text',
          'λ_1 (v_1^T v_2) = (A v_1)^T v_2 = v_1^T A^T v_2 = v_1^T (A v_2) = λ_2 (v_1^T v_2)',
          '```',
          'Since `λ_1 ≠ λ_2`, we must have `v_1^T v_2 = 0`.',
        ].join('\n'),
        created_at: 1776670000,
        metadata: {
          question_type: 'short_answer',
          difficulty: 'medium',
        },
      },
      {
        id: 'fav-rec-103',
        notebook_id: 'nb-linear-algebra',
        type: 'research',
        title: 'Low-Rank Matrix Approximations & Eckart–Young Theorem',
        user_query:
          'Compare truncated SVD and randomized subspace iteration for low-rank matrix approximation.',
        summary:
          'Eckart–Young optimality in spectral/Frobenius norms vs. O(mn log k) randomized passes.',
        output: [
          '### Executive Research Summary',
          '1. **Optimality (Eckart–Young–Mirsky)**: Truncating the Singular Value Decomposition at rank `k` achieves the minimum possible error `σ_{k+1}` in spectral norm.',
          '2. **Randomized SVD**: By projecting onto a `k + p` dimensional Gaussian sketch, randomized subspace iteration achieves `(1 + ε)` error in two passes over the matrix.',
        ].join('\n'),
        created_at: 1776650000,
        metadata: {
          mode: 'comparison',
          depth: 'standard',
        },
      },
    ],
    'nb-signals': [
      {
        id: 'fav-rec-201',
        notebook_id: 'nb-signals',
        type: 'solve',
        title: 'Region of Convergence for Bilateral Laplace Transform',
        user_query:
          'Determine the ROC of x(t) = e^{-2t} u(t) + e^{t} u(-t) and check stability.',
        summary:
          'Vertical strip -2 < Re(s) < 1; includes the jω-axis so the system is BIBO stable.',
        output: [
          '- Causal right-sided term `e^{-2t} u(t)` converges for `Re(s) > -2`.',
          '- Anti-causal left-sided term `e^{t} u(-t)` converges for `Re(s) < 1`.',
          '- **Intersection ROC**: `-2 < Re(s) < 1` (contains `Re(s) = 0`, so Fourier transform converges).',
        ].join('\n'),
        created_at: 1776595000,
        metadata: {
          session_id: 'session-general-1',
        },
      },
      {
        id: 'fav-rec-202',
        notebook_id: 'nb-signals',
        type: 'reading',
        title: 'Oppenheim Ch. 3 — Convolution Property Highlight',
        user_query: 'Highlight from Signals & Systems Reading Collection',
        summary:
          'Time-domain convolution maps to frequency-domain multiplication X(jω)H(jω).',
        output:
          'For any LTI system with impulse response `h(t)` and input `x(t)`, the output spectrum is `Y(jω) = X(jω) H(jω)` whenever both transforms share a common Region of Convergence.',
        created_at: 1776580000,
        metadata: {
          source_surface: 'reading',
          workspace_id: 'reading-ws-1',
        },
      },
    ],
    'nb-corrupt': [],
  };
}
