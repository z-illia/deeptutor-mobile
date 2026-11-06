import {
  BASELINE_INTERVALS,
  type LearningRecentItem,
  type LearningTodoBook,
  type MapModule,
  type MasteryCheckpointQuestion,
  type MasteryTopic,
  type ObjectiveReport,
  type ReviewStrategy,
  type TopicReview,
  type TopicSession,
  type TopicSourceCandidate,
} from './model';

const NOW_EPOCH = 1_776_765_600; // Deterministic reference epoch (2026-04-21)

export function createInitialMasteryTopics(): MasteryTopic[] {
  return [
    {
      path_id: 'path-general',
      name: 'Linear Algebra Foundations',
      updated_at: '2026-04-20T17:30:00Z',
      path_revision: 3,
      session_count: 2,
      content_workspace_id: '',
      metadata: {
        goal: 'Master linear transformations, eigenvalue decomposition, and SVD with geometric intuition and NumPy verification.',
        description:
          'A structured progression from column-space geometry and orthogonal projections to spectral decomposition and low-rank matrix approximation.',
        icon: '📐',
        sources: [
          {
            type: 'kb',
            id: 'kb-linear-algebra',
            label: 'Gilbert Strang — Linear Algebra KB',
            child_ids: ['kb-doc-ch3', 'kb-doc-ch6'],
          },
          {
            type: 'notebook',
            id: 'nb-linear-algebra',
            label: 'Linear Algebra Originals',
          },
        ],
      },
      map: {
        complete: false,
        counts: {
          mastered: 2,
          learning: 1,
          new_count: 3,
          total: 6,
        },
        modules: [
          {
            id: 'mod-la-1',
            name: 'Vector Spaces & Orthogonal Projections',
            objective:
              'Decompose vectors across fundamental subspaces and compute least-squares projections.',
            order: 0,
            mastered: 2,
            learning: 0,
            new_count: 0,
            total: 2,
            knowledge_points: [
              {
                id: 'kp-la-1',
                name: 'Column space & rank-nullity theorem',
                description:
                  'Relate pivot columns to dim C(A) and free variables to dim N(A).',
                type: 'concept',
                status: 'mastered',
                mastery_level: 0.92,
                mastery_source: 'tutor',
                prerequisites: [],
                module_id: 'mod-la-1',
                next_review_at: NOW_EPOCH - 3_600,
              },
              {
                id: 'kp-la-2',
                name: 'Orthogonal projections & least squares (P = A(AᵀA)⁻¹Aᵀ)',
                description:
                  'Project b onto C(A) and solve normal equations AᵀAx̂ = Aᵀb.',
                type: 'procedure',
                status: 'mastered',
                mastery_level: 0.88,
                mastery_source: 'tutor',
                prerequisites: ['kp-la-1'],
                module_id: 'mod-la-1',
                next_review_at: NOW_EPOCH + 86_400 * 3,
              },
            ],
          },
          {
            id: 'mod-la-2',
            name: 'Eigenvalues & Spectral Decomposition',
            objective:
              'Analyze invariant directions of linear operators and diagonalize symmetric matrices.',
            order: 1,
            mastered: 0,
            learning: 1,
            new_count: 1,
            total: 2,
            knowledge_points: [
              {
                id: 'kp-la-3',
                name: 'Characteristic polynomial & eigenspace geometry',
                description:
                  'Connect det(A - λI) = 0, trace/determinant invariants, and geometric vs. algebraic multiplicity.',
                type: 'concept',
                status: 'learning',
                mastery_level: 0.65,
                mastery_source: null,
                prerequisites: ['kp-la-1'],
                module_id: 'mod-la-2',
                next_review_at: null,
              },
              {
                id: 'kp-la-4',
                name: 'Symmetric matrices & Real Spectral Theorem (A = QΛQᵀ)',
                description:
                  'Prove why real symmetric matrices yield orthogonal eigenvectors and real eigenvalues.',
                type: 'concept',
                status: 'new',
                mastery_level: 0,
                mastery_source: null,
                prerequisites: ['kp-la-3'],
                module_id: 'mod-la-2',
                next_review_at: null,
              },
            ],
          },
          {
            id: 'mod-la-3',
            name: 'Singular Value Decomposition & Low-Rank Approximation',
            objective:
              'Factor arbitrary matrices into orthogonal rotations and rank-1 outer products.',
            order: 2,
            mastered: 0,
            learning: 0,
            new_count: 2,
            total: 2,
            knowledge_points: [
              {
                id: 'kp-la-5',
                name: 'SVD geometry (A = UΣVᵀ)',
                description:
                  'Map orthonormal right singular vectors v_i to stretched left singular vectors σ_i u_i.',
                type: 'concept',
                status: 'new',
                mastery_level: 0,
                mastery_source: null,
                prerequisites: ['kp-la-4'],
                module_id: 'mod-la-3',
                next_review_at: null,
              },
              {
                id: 'kp-la-6',
                name: 'Eckart–Young low-rank matrix approximation',
                description:
                  'Truncate singular triplets to minimize Frobenius and spectral reconstruction error.',
                type: 'design',
                status: 'new',
                mastery_level: 0,
                mastery_source: null,
                prerequisites: ['kp-la-5'],
                module_id: 'mod-la-3',
                next_review_at: null,
              },
            ],
          },
        ],
      },
      next: {
        action: 'study',
        knowledge_point_id: 'kp-la-3',
        knowledge_point_name: 'Characteristic polynomial & eigenspace geometry',
        module_name: 'Eigenvalues & Spectral Decomposition',
        reason:
          'You have 1/2 attempts correct on eigenspace multiplicity — one more discriminating check will clear the gate.',
      },
      reviews: [
        {
          id: 'rev-la-1',
          knowledge_point_id: 'kp-la-1',
          knowledge_point_name: 'Column space & rank-nullity theorem',
          due: true,
          due_at: NOW_EPOCH - 3_600,
          retrievability: 0.78,
          stability: 6.4,
          forgetting_risk: 0.22,
          lapse_count: 0,
          recent_failure: false,
          reason:
            'Scheduled 7-day spacing checkpoint reached; quick recall keeps stability growing.',
          desired_retention: 0.9,
        },
        {
          id: 'rev-la-2',
          knowledge_point_id: 'kp-la-2',
          knowledge_point_name:
            'Orthogonal projections & least squares (P = A(AᵀA)⁻¹Aᵀ)',
          due: false,
          due_at: NOW_EPOCH + 86_400 * 3,
          retrievability: 0.94,
          stability: 11.2,
          forgetting_risk: 0.06,
          lapse_count: 1,
          recent_failure: false,
          reason: 'Next spaced check in 3 days based on 90% recall target.',
          desired_retention: 0.9,
        },
      ],
      review_settings: {
        desired_retention: 0.9,
        strategy: {
          template_id: 'strat-balanced',
          name: 'Balanced FSRS',
        },
      },
      learner_profile: {
        background_summary:
          'Strong Python/NumPy intuition; prefers geometric diagrams before algebraic proofs.',
        strengths: [
          'Subspace dimension counting',
          'Normal equation setup',
        ],
        recurring_gaps: [
          'Distinguishing geometric vs. algebraic multiplicity on defective matrices',
        ],
        preferred_style: 'Worked 2×2 examples followed by invariant proofs',
      },
    },
    {
      path_id: 'path-signals-fourier',
      name: 'Fourier & Spectral Signal Analysis',
      updated_at: '2026-04-19T15:10:00Z',
      path_revision: 2,
      session_count: 1,
      content_workspace_id: '',
      metadata: {
        goal: 'Understand continuous and discrete Fourier transforms, spectral leakage under finite windows, and FFT butterfly stages.',
        description:
          'Connect inner-product orthogonality on complex exponentials to practical DFT bin resolution and window design.',
        icon: '🧭',
        sources: [
          {
            type: 'kb',
            id: 'kb-signals',
            label: 'Oppenheim — Signals & Systems KB',
          },
          {
            type: 'session',
            id: 'session-general-1',
            label: 'Fourier transform intuition',
          },
        ],
      },
      map: {
        complete: false,
        counts: {
          mastered: 1,
          learning: 1,
          new_count: 2,
          total: 4,
        },
        modules: [
          {
            id: 'mod-sig-1',
            name: 'Orthogonal Harmonics & Parseval Energy',
            objective:
              'Project signals onto complex exponential bases and verify energy conservation.',
            order: 0,
            mastered: 1,
            learning: 1,
            new_count: 0,
            total: 2,
            knowledge_points: [
              {
                id: 'kp-sig-1',
                name: 'Orthogonal complex exponential basis',
                description:
                  'Show that inner products of distinct harmonics vanish over one full period.',
                type: 'concept',
                status: 'mastered',
                mastery_level: 0.9,
                mastery_source: 'tutor',
                prerequisites: [],
                module_id: 'mod-sig-1',
                next_review_at: NOW_EPOCH - 7_200,
              },
              {
                id: 'kp-sig-2',
                name: 'Parseval energy identity across time and frequency',
                description:
                  'Compute total signal power from time samples vs. DFT magnitude squares.',
                type: 'procedure',
                status: 'learning',
                mastery_level: 0.55,
                mastery_source: null,
                prerequisites: ['kp-sig-1'],
                module_id: 'mod-sig-1',
                next_review_at: null,
              },
            ],
          },
          {
            id: 'mod-sig-2',
            name: 'Windowing, Spectral Leakage & FFT',
            objective:
              'Control sidelobe leakage with Hann/Hamming windows and trace radix-2 FFT.',
            order: 1,
            mastered: 0,
            learning: 0,
            new_count: 2,
            total: 2,
            knowledge_points: [
              {
                id: 'kp-sig-3',
                name: 'Dirichlet kernel & rectangular vs. Hann window leakage',
                description:
                  'Trade main-lobe width against sidelobe roll-off when truncating signals.',
                type: 'concept',
                status: 'new',
                mastery_level: 0,
                mastery_source: null,
                prerequisites: ['kp-sig-2'],
                module_id: 'mod-sig-2',
                next_review_at: null,
              },
              {
                id: 'kp-sig-4',
                name: 'Cooley–Tukey radix-2 decimation in time',
                description:
                  'Split N-point DFT into even/odd halves to achieve O(N log N) operations.',
                type: 'procedure',
                status: 'new',
                mastery_level: 0,
                mastery_source: null,
                prerequisites: ['kp-sig-3'],
                module_id: 'mod-sig-2',
                next_review_at: null,
              },
            ],
          },
        ],
      },
      next: {
        action: 'review',
        knowledge_point_id: 'kp-sig-1',
        knowledge_point_name: 'Orthogonal complex exponential basis',
        module_name: 'Orthogonal Harmonics & Parseval Energy',
        reason: '1 spaced review is due now before continuing to Parseval energy.',
      },
      reviews: [
        {
          id: 'rev-sig-1',
          knowledge_point_id: 'kp-sig-1',
          knowledge_point_name: 'Orthogonal complex exponential basis',
          due: true,
          due_at: NOW_EPOCH - 7_200,
          retrievability: 0.74,
          stability: 4.8,
          forgetting_risk: 0.26,
          lapse_count: 0,
          recent_failure: false,
          reason: 'Due 2 hours ago; refreshing discrete orthogonality.',
          desired_retention: 0.9,
        },
      ],
      review_settings: {
        desired_retention: 0.9,
        strategy: {
          template_id: 'strat-balanced',
          name: 'Balanced FSRS',
        },
      },
      learner_profile: {
        background_summary: 'Comfortable with Python/NumPy signal plots.',
        strengths: ['Complex phasor visualization'],
        recurring_gaps: ['1/N normalization factor in discrete Parseval theorem'],
      },
    },
    {
      path_id: 'path-a',
      name: 'Mathematics Path',
      updated_at: '2026-04-18T11:00:00Z',
      path_revision: 1,
      session_count: 1,
      content_workspace_id: 'fixture-ws-a',
      metadata: {
        goal: 'Master multivariable calculus chain rule and directional derivatives.',
        description: 'Gradient fields, Jacobian matrices, and constrained optimization.',
        icon: '🏔️',
        sources: [],
      },
      map: {
        complete: false,
        counts: { mastered: 1, learning: 0, new_count: 1, total: 2 },
        modules: [
          {
            id: 'mod-ws-a-1',
            name: 'Gradient & Jacobian Foundations',
            objective: 'Compute linear approximations of vector-valued functions.',
            order: 0,
            mastered: 1,
            learning: 0,
            new_count: 1,
            total: 2,
            knowledge_points: [
              {
                id: 'kp-ws-a-1',
                name: 'Directional derivatives & steepest ascent',
                type: 'concept',
                status: 'mastered',
                mastery_level: 0.9,
                mastery_source: 'tutor',
                prerequisites: [],
                module_id: 'mod-ws-a-1',
              },
              {
                id: 'kp-ws-a-2',
                name: 'Multivariable chain rule via Jacobian matrix',
                type: 'procedure',
                status: 'new',
                mastery_level: 0,
                mastery_source: null,
                prerequisites: ['kp-ws-a-1'],
                module_id: 'mod-ws-a-1',
              },
            ],
          },
        ],
      },
      next: {
        action: 'study',
        knowledge_point_id: 'kp-ws-a-2',
        knowledge_point_name: 'Multivariable chain rule via Jacobian matrix',
        module_name: 'Gradient & Jacobian Foundations',
        reason: 'Continue to the next waypoint.',
      },
      reviews: [],
      review_settings: { desired_retention: 0.9, strategy: null },
      learner_profile: { strengths: ['Partial derivatives'], recurring_gaps: [] },
    },
    {
      path_id: 'path-b',
      name: 'Geometry Path',
      updated_at: '2026-04-17T09:00:00Z',
      path_revision: 1,
      session_count: 1,
      content_workspace_id: 'fixture-ws-b',
      metadata: {
        goal: 'Differential geometry of curves and surfaces.',
        description: 'Frenet–Serret frames and Gaussian curvature.',
        icon: '🌌',
        sources: [],
      },
      map: {
        complete: false,
        counts: { mastered: 0, learning: 1, new_count: 0, total: 1 },
        modules: [
          {
            id: 'mod-ws-b-1',
            name: 'Curvature & Torsion',
            objective: 'Parameterize curves by arc length.',
            order: 0,
            mastered: 0,
            learning: 1,
            new_count: 0,
            total: 1,
            knowledge_points: [
              {
                id: 'kp-ws-b-1',
                name: 'Frenet–Serret apparatus',
                type: 'concept',
                status: 'learning',
                mastery_level: 0.5,
                mastery_source: null,
                prerequisites: [],
                module_id: 'mod-ws-b-1',
              },
            ],
          },
        ],
      },
      next: {
        action: 'study',
        knowledge_point_id: 'kp-ws-b-1',
        knowledge_point_name: 'Frenet–Serret apparatus',
        module_name: 'Curvature & Torsion',
        reason: 'Resume active waypoint.',
      },
      reviews: [],
      review_settings: { desired_retention: 0.9, strategy: null },
      learner_profile: { strengths: [], recurring_gaps: [] },
    },
  ];
}

export function createInitialObjectiveReports(): Record<
  string,
  ObjectiveReport
> {
  return {
    'kp-la-1': {
      id: 'kp-la-1',
      name: 'Column space & rank-nullity theorem',
      type: 'concept',
      gate: 'quantitative',
      mastery: 0.92,
      threshold: 0.8,
      mastered: true,
      assessed_mastered: true,
      mastery_source: 'tutor',
      explained: {
        summary:
          'Learner explained why rank(A) + dim(null(A)) = n using pivot and free column partitioning.',
      },
      attempts: [
        {
          question_id: 'att-la-101',
          prompt:
            'If a 4×6 matrix A has 3 pivot columns, what is the dimension of its null space N(A)?',
          answer: 'dim N(A) = 6 - 3 = 3 free variables.',
          is_correct: true,
          at: NOW_EPOCH - 86_400 * 6,
          independent: true,
        },
        {
          question_id: 'att-la-102',
          prompt:
            'Does adding a dependent row change dim C(A) or the dimension of N(A)?',
          answer:
            'Neither — row rank equals column rank, so pivot count and nullity stay invariant.',
          is_correct: true,
          at: NOW_EPOCH - 86_400 * 5,
          independent: true,
        },
      ],
      correct_count: 2,
      errors: [],
      evidence: [
        {
          timestamp: NOW_EPOCH - 86_400 * 5,
          turn_id: 'turn-102',
          result: 'Passed gate',
          assessment_type: 'Conceptual check',
          quality: 0.95,
        },
      ],
      evidence_count: 1,
      review: {
        due_at: NOW_EPOCH - 3_600,
        retrievability: 0.78,
        stability: 6.4,
        forgetting_risk: 0.22,
        lapse_count: 0,
        reason:
          'Scheduled 7-day spacing checkpoint reached; quick recall keeps stability growing.',
      },
    },
    'kp-la-2': {
      id: 'kp-la-2',
      name: 'Orthogonal projections & least squares (P = A(AᵀA)⁻¹Aᵀ)',
      type: 'procedure',
      gate: 'quantitative',
      mastery: 0.88,
      threshold: 0.8,
      mastered: true,
      assessed_mastered: true,
      mastery_source: 'tutor',
      explained: {
        summary:
          'Derived the error orthogonality condition Aᵀ(b - Ax̂) = 0 and verified P² = P.',
      },
      attempts: [
        {
          question_id: 'att-la-201',
          prompt:
            'Why is the residual vector e = b - Ax̂ perpendicular to every column of A?',
          answer:
            'Because x̂ minimizes ||b - Ax||², making the error orthogonal to the column space C(A).',
          is_correct: true,
          at: NOW_EPOCH - 86_400 * 3,
          independent: true,
        },
      ],
      correct_count: 1,
      errors: [],
      evidence: [
        {
          timestamp: NOW_EPOCH - 86_400 * 3,
          turn_id: 'turn-201',
          result: 'Passed gate',
          assessment_type: 'Derivation check',
          quality: 0.88,
        },
      ],
      evidence_count: 1,
      review: {
        due_at: NOW_EPOCH + 86_400 * 3,
        retrievability: 0.94,
        stability: 11.2,
        forgetting_risk: 0.06,
        lapse_count: 1,
        reason: 'Next spaced check in 3 days based on 90% recall target.',
      },
    },
    'kp-la-3': {
      id: 'kp-la-3',
      name: 'Characteristic polynomial & eigenspace geometry',
      type: 'concept',
      gate: 'quantitative',
      mastery: 0.65,
      threshold: 0.8,
      mastered: false,
      assessed_mastered: false,
      mastery_source: null,
      explained: {
        summary:
          'Identified trace and determinant invariants; working through defective matrix multiplicity.',
      },
      attempts: [
        {
          question_id: 'att-la-301',
          prompt:
            'For A = [[4, 1], [2, 3]], find λ₁ + λ₂ and λ₁·λ₂ without factoring the quadratic.',
          answer: 'λ₁ + λ₂ = tr(A) = 7 and λ₁·λ₂ = det(A) = 10.',
          is_correct: true,
          at: NOW_EPOCH - 86_400,
          independent: true,
        },
        {
          question_id: 'att-la-302',
          prompt:
            'If λ = 2 has algebraic multiplicity 2 in a 2×2 shear matrix [[2, 1], [0, 2]], how many independent eigenvectors exist?',
          answer: 'Two independent eigenvectors.',
          is_correct: false,
          at: NOW_EPOCH - 43_200,
          independent: true,
        },
      ],
      correct_count: 1,
      errors: [
        {
          id: 'err-la-301',
          error_type: 'Multiplicity conflation',
          retries: 1,
          status: 'open',
        },
      ],
      evidence: [
        {
          timestamp: NOW_EPOCH - 43_200,
          turn_id: 'turn-302',
          result: 'Needs practice',
          assessment_type: 'Diagnostic question',
          quality: 0.55,
        },
      ],
      evidence_count: 1,
      review: null,
    },
    'kp-sig-1': {
      id: 'kp-sig-1',
      name: 'Orthogonal complex exponential basis',
      type: 'concept',
      gate: 'quantitative',
      mastery: 0.9,
      threshold: 0.8,
      mastered: true,
      assessed_mastered: true,
      mastery_source: 'tutor',
      attempts: [
        {
          question_id: 'att-sig-101',
          prompt:
            'Evaluate the discrete inner product Σ_{n=0}^{N-1} e^{j2πkn/N} e^{-j2πmn/N} when k ≠ m (mod N).',
          answer: '0 by the geometric series root-of-unity sum.',
          is_correct: true,
          at: NOW_EPOCH - 86_400 * 4,
          independent: true,
        },
      ],
      correct_count: 1,
      errors: [],
      evidence: [
        {
          timestamp: NOW_EPOCH - 86_400 * 4,
          turn_id: 'turn-sig-1',
          result: 'Passed gate',
          assessment_type: 'Concept check',
          quality: 0.9,
        },
      ],
      evidence_count: 1,
      review: {
        due_at: NOW_EPOCH - 7_200,
        retrievability: 0.74,
        stability: 4.8,
        forgetting_risk: 0.26,
        lapse_count: 0,
        reason: 'Due 2 hours ago; refreshing discrete orthogonality.',
      },
    },
  };
}

export function buildFallbackObjectiveReport(
  pointId: string,
  pointName: string,
  pointType: 'concept' | 'memory' | 'procedure' | 'design' = 'concept',
  status: 'mastered' | 'learning' | 'new' = 'new',
  masteryLevel = 0,
  masterySource: 'tutor' | 'learner' | null = null,
): ObjectiveReport {
  return {
    id: pointId,
    name: pointName,
    type: pointType,
    gate: pointType === 'design' ? 'qualitative' : 'quantitative',
    mastery: status === 'mastered' ? Math.max(0.88, masteryLevel) : masteryLevel,
    threshold: 0.8,
    mastered: status === 'mastered',
    assessed_mastered: status === 'mastered' && masterySource !== 'learner',
    mastery_source: masterySource,
    attempts: [],
    correct_count: 0,
    errors: [],
    evidence: [],
    evidence_count: 0,
    review: null,
  };
}

export function createInitialTopicSessions(): Record<string, TopicSession[]> {
  return {
    'path-general': [
      {
        session_id: 'session-general-mastery-1',
        path_id: 'path-general',
        title: 'Diagnostic check: Linear transformations',
        mode: 'study',
        status: 'idle',
        message_count: 2,
        updated_at: NOW_EPOCH - 7_200,
        last_message:
          'You correctly identified the kernel dimension; next let us verify the rank-nullity balance.',
      },
      {
        session_id: 'session-general-mastery-outline',
        path_id: 'path-general',
        title: 'Route design: Strang chapters 3–7',
        mode: 'outline',
        status: 'idle',
        message_count: 4,
        updated_at: NOW_EPOCH - 86_400 * 2,
        last_message:
          'Added 3 modules covering Fundamental Subspaces, Spectral Theorem, and SVD.',
      },
    ],
    'path-signals-fourier': [
      {
        session_id: 'session-signals-study-1',
        path_id: 'path-signals-fourier',
        title: 'Harmonic orthogonality & DFT matrix',
        mode: 'study',
        status: 'idle',
        message_count: 3,
        updated_at: NOW_EPOCH - 86_400,
        last_message:
          'Cleared the orthogonality gate; ready for Parseval energy normalization.',
      },
    ],
    'path-a': [],
    'path-b': [],
  };
}

export function createInitialReviewStrategies(): ReviewStrategy[] {
  return [
    {
      template_id: 'strat-balanced',
      name: 'Balanced FSRS',
      builtin: true,
      intervals: {
        memory: [...BASELINE_INTERVALS.memory],
        concept: [...BASELINE_INTERVALS.concept],
        procedure: [...BASELINE_INTERVALS.procedure],
        design: [...BASELINE_INTERVALS.design],
      },
      desired_retention: 0.9,
    },
    {
      template_id: 'strat-exam',
      name: 'Exam Sprint (High Recall)',
      builtin: true,
      intervals: {
        memory: [0, 1, 2, 4, 7, 14],
        concept: [1, 3, 7, 14],
        procedure: [1, 3, 7],
        design: [3, 7, 14],
      },
      desired_retention: 0.95,
    },
  ];
}

export function createInitialSourceCandidates(): TopicSourceCandidate[] {
  return [
    {
      key: 'kb:kb-linear-algebra',
      id: 'kb-linear-algebra',
      type: 'kb',
      title: 'Gilbert Strang — Linear Algebra KB',
      subtitle: '48 indexed sections · Ready',
      detail: 'Vector spaces, projections, determinants, eigenvalues, SVD',
      workspace_id: '',
      children: [
        {
          id: 'kb-doc-ch3',
          title: 'Ch. 3 — Vector Spaces and Subspaces',
          detail: '14 chunks · Column space & nullspace',
        },
        {
          id: 'kb-doc-ch4',
          title: 'Ch. 4 — Orthogonality & Least Squares',
          detail: '12 chunks · Projection matrices & Gram–Schmidt',
        },
        {
          id: 'kb-doc-ch6',
          title: 'Ch. 6 — Eigenvalues and Eigenvectors',
          detail: '15 chunks · Diagonalization & symmetric matrices',
        },
        {
          id: 'kb-doc-ch7',
          title: 'Ch. 7 — Singular Value Decomposition (SVD)',
          detail: '7 chunks · Polar decomposition & Eckart–Young',
        },
      ],
    },
    {
      key: 'kb:kb-signals',
      id: 'kb-signals',
      type: 'kb',
      title: 'Oppenheim — Signals & Systems KB',
      subtitle: '36 indexed sections · Ready',
      detail: 'Fourier series, CTFT, DTFT, DFT, and sampling theorem',
      workspace_id: '',
      children: [
        {
          id: 'kb-sig-ch4',
          title: 'Ch. 4 — Continuous-Time Fourier Transform',
          detail: '18 chunks · Convergence & convolution property',
        },
        {
          id: 'kb-sig-ch7',
          title: 'Ch. 7 — Sampling & Aliasing Reconstruction',
          detail: '18 chunks · Nyquist rate & bandlimited interpolation',
        },
      ],
    },
    {
      key: 'notebook:nb-linear-algebra',
      id: 'nb-linear-algebra',
      type: 'notebook',
      title: 'Linear Algebra Originals',
      subtitle: 'Saved Favorites · 3 items',
      detail: 'Immutable saved turns on spectral decomposition and quizzes',
      workspace_id: '',
      children: [
        {
          id: 'fav-rec-101',
          title: 'Spectral Theorem & Low-Rank SVD Synthesis',
          detail: 'Saved research report',
        },
        {
          id: 'fav-rec-102',
          title: 'Eigenvalue Trace & Multiplicity Quiz Set',
          detail: 'Saved quiz snapshot',
        },
      ],
    },
    {
      key: 'notebook:nb-signals-fourier',
      id: 'nb-signals-fourier',
      type: 'notebook',
      title: 'Signals & Fourier Pack',
      subtitle: 'Saved Favorites · 1 item',
      detail: 'Saved reading explanations on windowing and spectral leakage',
      workspace_id: '',
    },
    {
      key: 'book:book-matrix-computation',
      id: 'book-matrix-computation',
      type: 'book',
      title: 'Numerical Matrix Computations Companion',
      subtitle: '6 chapters · 4 compiled',
      detail: 'Householder QR, conditioning, and iterative eigensolvers',
      workspace_id: '',
      children: [
        {
          id: 'ch-qr',
          title: 'Chapter 1 — Orthogonal Triangularization (QR)',
          detail: 'Compiled · 18 min read',
        },
        {
          id: 'ch-svd',
          title: 'Chapter 2 — Golub–Kahan SVD Bidiagonalization',
          detail: 'Compiled · 22 min read',
        },
      ],
    },
    {
      key: 'question_bank:qb-mit-1806',
      id: 'qb-mit-1806',
      type: 'question_bank',
      title: 'MIT 18.06 Midterm & Final Question Bank',
      subtitle: '24 questions · Choice, True/False, Written',
      detail: 'Subspaces, projections, determinants, and spectral theory',
      workspace_id: '',
    },
    {
      key: 'session:session-general-1',
      id: 'session-general-1',
      type: 'session',
      title: 'Fourier transform intuition',
      subtitle: '4 messages · Updated yesterday',
      detail: 'Inner product projection onto complex exponential basis',
      workspace_id: '',
    },
    {
      key: 'session:session-general-2',
      id: 'session-general-2',
      type: 'session',
      title: 'Eigenvalues & eigenvectors practice',
      subtitle: '2 messages · Updated 2 days ago',
      detail: 'Characteristic polynomial det(A - λI) = 0',
      workspace_id: '',
    },
    {
      key: 'co_writer:cw-spectral-notes',
      id: 'cw-spectral-notes',
      type: 'co_writer',
      title: 'Spectral Theorem & PCA Derivation Draft',
      subtitle: 'Co-Writer document · 1,420 words',
      detail: 'Covariance matrix eigen-directions and variance maximization',
      workspace_id: '',
    },
  ];
}

export function createInitialTodoBooks(): LearningTodoBook[] {
  return [
    {
      book_id: 'book-matrix-computation',
      title: 'Numerical Matrix Computations Companion',
      status: 'paused',
      resume_chapter_id: 'ch-svd',
      status_hint: 'Paused at Chapter 4 of 6 — resume compilation in Books (M5)',
    },
  ];
}

export function createInitialLearningRecent(): LearningRecentItem[] {
  return [
    {
      id: 'rec-mastery-la',
      kind: 'mastery',
      title: 'Linear Algebra Foundations',
      subtitle: 'Mastery Path · 2/6 knowledge points mastered',
      href: '/learning/mastery/path-general',
      updated_at: '2026-04-20T17:30:00Z',
      progress: 2 / 6,
      workspace_id: '',
    },
    {
      id: 'rec-mastery-signals',
      kind: 'mastery',
      title: 'Fourier & Spectral Signal Analysis',
      subtitle: 'Mastery Path · 1/4 knowledge points mastered · 1 review due',
      href: '/learning/mastery/path-signals-fourier',
      updated_at: '2026-04-19T15:10:00Z',
      progress: 1 / 4,
      workspace_id: '',
    },
    {
      id: 'rec-practice-eigen',
      kind: 'practice',
      title: 'MIT 18.06 Eigenvalues & Projections Drill',
      subtitle: 'Practice · 18 questions · 83% accuracy',
      href: '/learning/practice',
      updated_at: '2026-04-18T19:00:00Z',
      progress: 0.83,
      workspace_id: '',
    },
    {
      id: 'rec-book-matrix',
      kind: 'books',
      title: 'Numerical Matrix Computations Companion',
      subtitle: 'Books · 4/6 chapters compiled',
      href: '/learning/books',
      updated_at: '2026-04-18T14:20:00Z',
      progress: 4 / 6,
      workspace_id: '',
    },
    {
      id: 'rec-reading-papers',
      kind: 'reading',
      title: 'Applied Mathematics Papers',
      subtitle: 'Immersive Reading · 3 documents · 5 annotations',
      href: '/learning/reading',
      updated_at: '2026-04-17T16:40:00Z',
      progress: 0.6,
      workspace_id: '',
    },
    {
      id: 'rec-mastery-ws-a',
      kind: 'mastery',
      title: 'Mathematics Path',
      subtitle: 'Mastery Path · 1/2 knowledge points mastered',
      href: '/learning/mastery/path-a',
      updated_at: '2026-04-18T11:00:00Z',
      progress: 0.5,
      workspace_id: 'fixture-ws-a',
    },
    {
      id: 'rec-mastery-ws-b',
      kind: 'mastery',
      title: 'Geometry Path',
      subtitle: 'Mastery Path · 0/1 knowledge points mastered',
      href: '/learning/mastery/path-b',
      updated_at: '2026-04-17T09:00:00Z',
      progress: 0,
      workspace_id: 'fixture-ws-b',
    },
  ];
}

export function buildGeneratedModulesForGoal(
  goal: string,
  pathId: string,
): MapModule[] {
  const shortTitle =
    goal.trim().split(/[.;\n]/)[0]?.slice(0, 48) || 'Core Subject';
  const mod1Id = `mod-${pathId}-1`;
  const mod2Id = `mod-${pathId}-2`;
  const kp1Id = `kp-${pathId}-1`;
  const kp2Id = `kp-${pathId}-2`;
  const kp3Id = `kp-${pathId}-3`;
  const kp4Id = `kp-${pathId}-4`;

  return [
    {
      id: mod1Id,
      name: `Foundations of ${shortTitle}`,
      objective: `Establish core definitions, invariants, and geometric intuition for ${shortTitle}.`,
      order: 0,
      mastered: 0,
      learning: 1,
      new_count: 1,
      total: 2,
      knowledge_points: [
        {
          id: kp1Id,
          name: 'Core definitions & structural invariants',
          description:
            'Identify the primary mathematical objects, assumptions, and conservation laws.',
          type: 'concept',
          status: 'learning',
          mastery_level: 0.25,
          mastery_source: null,
          prerequisites: [],
          module_id: mod1Id,
          next_review_at: null,
        },
        {
          id: kp2Id,
          name: 'Canonical worked derivation & boundary cases',
          description:
            'Work through a low-dimensional concrete example and test degenerate inputs.',
          type: 'procedure',
          status: 'new',
          mastery_level: 0,
          mastery_source: null,
          prerequisites: [kp1Id],
          module_id: mod1Id,
          next_review_at: null,
        },
      ],
    },
    {
      id: mod2Id,
      name: 'Synthesis, Verification & Applications',
      objective:
        'Connect theoretical properties to practical computation and diagnostic checks.',
      order: 1,
      mastered: 0,
      learning: 0,
      new_count: 2,
      total: 2,
      knowledge_points: [
        {
          id: kp3Id,
          name: 'Computational verification & error bounds',
          description:
            'Verify analytical predictions against numerical experiments.',
          type: 'procedure',
          status: 'new',
          mastery_level: 0,
          mastery_source: null,
          prerequisites: [kp2Id],
          module_id: mod2Id,
          next_review_at: null,
        },
        {
          id: kp4Id,
          name: 'End-to-end synthesis & transfer problem',
          description:
            'Design and justify a complete solution strategy on an unseen scenario.',
          type: 'design',
          status: 'new',
          mastery_level: 0,
          mastery_source: null,
          prerequisites: [kp3Id],
          module_id: mod2Id,
          next_review_at: null,
        },
      ],
    },
  ];
}

export function getCheckpointQuestionForWaypoint(
  pointId: string,
  pointName: string,
): MasteryCheckpointQuestion {
  if (pointId === 'kp-la-3') {
    return {
      id: `chk-${pointId}`,
      knowledgePointId: pointId,
      knowledgePointName: pointName,
      header: 'Mastery Gate Check',
      prompt:
        'Suppose a 3×3 matrix A has characteristic polynomial -(λ - 2)²(λ - 5). Which condition guarantees that A is diagonalizable?',
      options: [
        {
          id: 'opt-nullity-2',
          label: 'dim N(A - 2I) = 2 (geometric multiplicity equals 2)',
          description:
            'The eigenspace for λ = 2 spans a 2D plane, providing 2 independent eigenvectors plus 1 for λ = 5.',
          isCorrect: true,
        },
        {
          id: 'opt-det-non-zero',
          label: 'det(A) = 20 ≠ 0 (the matrix is invertible)',
          description:
            'Invertibility only guarantees λ ≠ 0; defective matrices like [[2,1,0],[0,2,0],[0,0,5]] are still invertible.',
          isCorrect: false,
        },
        {
          id: 'opt-trace-9',
          label: 'tr(A) = 2 + 2 + 5 = 9',
          description:
            'Trace always equals the sum of algebraic eigenvalues regardless of diagonalizability.',
          isCorrect: false,
        },
      ],
      explanation:
        'A matrix with repeated eigenvalue λ = 2 (algebraic multiplicity 2) is diagonalizable if and only if its eigenspace N(A - 2I) has dimension 2.',
    };
  }

  if (pointId === 'kp-la-1') {
    return {
      id: `chk-${pointId}`,
      knowledgePointId: pointId,
      knowledgePointName: pointName,
      header: 'Spaced Review Check',
      prompt:
        'A 5×8 matrix A has rank 3. What are the dimensions of its column space C(A) and null space N(A)?',
      options: [
        {
          id: 'opt-3-and-5',
          label: 'dim C(A) = 3 and dim N(A) = 5',
          description:
            '3 pivot columns span C(A) in ℝ⁵, leaving 8 - 3 = 5 free variables for N(A) in ℝ⁸.',
          isCorrect: true,
        },
        {
          id: 'opt-3-and-2',
          label: 'dim C(A) = 3 and dim N(A) = 2',
          description:
            '5 - 3 = 2 is the dimension of the left nullspace N(Aᵀ), not N(A).',
          isCorrect: false,
        },
      ],
      explanation:
        'By the Rank–Nullity Theorem, rank(A) + dim N(A) = number of columns (n = 8), so dim N(A) = 8 - 3 = 5.',
    };
  }

  return {
    id: `chk-${pointId}`,
    knowledgePointId: pointId,
    knowledgePointName: pointName,
    header: 'Waypoint Mastery Check',
    prompt: `To verify your mastery of "${pointName}", which statement best captures the core invariant and verification step?`,
    options: [
      {
        id: 'opt-invariant-correct',
        label:
          'Verify the structural invariant on a concrete basis and confirm boundary conditions hold.',
        description:
          'Connects the formal definition directly to an independent check.',
        isCorrect: true,
      },
      {
        id: 'opt-memorize-formula',
        label:
          'Apply the surface formula without checking dimensional or orthogonality preconditions.',
        description:
          'Skipping precondition checks fails on degenerate or rank-deficient cases.',
        isCorrect: false,
      },
    ],
    explanation: `Mastering "${pointName}" requires verifying both the structural invariant and its preconditions on concrete examples.`,
  };
}

export function buildReviewEntryForMasteredPoint(
  pointId: string,
  pointName: string,
  desiredRetention = 0.9,
): TopicReview {
  return {
    id: `rev-${pointId}`,
    knowledge_point_id: pointId,
    knowledge_point_name: pointName,
    due: false,
    due_at: NOW_EPOCH + 86_400 * 3,
    retrievability: 0.96,
    stability: 7.5,
    forgetting_risk: 0.04,
    lapse_count: 0,
    recent_failure: false,
    reason: 'Cleared mastery gate — first spaced review scheduled in 3 days.',
    desired_retention: desiredRetention,
  };
}
