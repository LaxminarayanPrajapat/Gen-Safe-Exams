/* ============================================================
   GEN SAFE EXAM — DEMO DATASET  (DEMO MODE)
   ------------------------------------------------------------
   This module exists ONLY for the pre-backend integration demo.
   In production every screen is served by the Express API and
   PostgreSQL. See backend/ for the real implementation.
   ============================================================ */
import type {
  User, University, College, Department, StaffMember, Subject, Syllabus,
  Question, QuestionPaper, PaperRelease, AuditEvent, SecurityEvent,
  ActiveSession, AppNotification,
} from '@/types'

export const DEMO_MODE = true
export const DEMO_PASSWORD = 'Password@123'

/* ---------- Organizations ---------- */
export const universities: University[] = [
  { id: 'univ-shivaji', name: 'Shivaji University', code: 'SUK', location: 'Kolhapur, Maharashtra', adminName: 'Dr. Anil Patil', adminEmail: 'registrar@shivaji.edu.in', status: 'ACTIVE', establishedYear: 1962, createdAt: '2024-11-02T09:00:00Z' },
  { id: 'univ-pune', name: 'Savitribai Phule Pune University', code: 'SPPU', location: 'Pune, Maharashtra', adminName: 'Dr. Meera Joshi', adminEmail: 'registrar@unipune.ac.in', status: 'PENDING_APPROVAL', establishedYear: 1949, createdAt: '2026-08-18T07:30:00Z' },
]

export const colleges: College[] = [
  { id: 'col-dkte', universityId: 'univ-shivaji', universityName: 'Shivaji University', name: "D.K.T.E. Society's Textile & Engineering Institute", code: 'DKTE-TEI', location: 'Ichalkaranji, Maharashtra', adminName: 'Prof. S. R. Kulkarni', adminEmail: 'principal@dkte.ac.in', status: 'ACTIVE', createdAt: '2024-12-14T06:00:00Z' },
  { id: 'col-rit', universityId: 'univ-shivaji', universityName: 'Shivaji University', name: 'Rajarambapu Institute of Technology', code: 'RIT-RAJARAMNAGAR', location: 'Islampur, Maharashtra', adminName: 'Dr. V. B. Shinde', adminEmail: 'director@ritindia.edu', status: 'ACTIVE', createdAt: '2025-01-20T05:45:00Z' },
]

export const departments: Department[] = [
  { id: 'dept-cse', collegeId: 'col-dkte', collegeName: "D.K.T.E. Society's Textile & Engineering Institute", universityId: 'univ-shivaji', name: 'Computer Science & Engineering', code: 'CSE', hodName: 'Dr. Priya Deshmukh', hodEmail: 'hod.cse@dkte.ac.in', staffCount: 4, verificationStatus: 'VERIFIED', createdAt: '2025-01-08T04:30:00Z' },
  { id: 'dept-it', collegeId: 'col-dkte', collegeName: "D.K.T.E. Society's Textile & Engineering Institute", universityId: 'univ-shivaji', name: 'Information Technology', code: 'IT', hodName: ' Prof. Ravi Salunkhe', hodEmail: 'hod.it@dkte.ac.in', staffCount: 2, verificationStatus: 'VERIFIED', createdAt: '2025-01-08T04:40:00Z' },
  { id: 'dept-com', collegeId: 'col-dkte', collegeName: "D.K.T.E. Society's Textile & Engineering Institute", universityId: 'univ-shivaji', name: 'Commerce', code: 'COM', hodName: 'Dr. Sunita Mane', hodEmail: 'hod.com@dkte.ac.in', staffCount: 1, verificationStatus: 'UNDER_REVIEW', createdAt: '2025-06-11T05:10:00Z' },
]

/* ---------- Users (demo login accounts) ---------- */
export const users: User[] = [
  { id: 'u-super', name: 'Arjun Mehta', email: 'superadmin@gensexam.io', role: 'SUPER_ADMIN', title: 'Platform Administrator', organizationId: 'platform', organizationName: 'GEN SAFE EXAM Platform', mfaEnabled: true, status: 'ACTIVE', lastLoginAt: '2026-08-25T04:12:00Z' },
  { id: 'u-univ-admin', name: 'Dr. Anil Patil', email: 'registrar@shivaji.edu.in', role: 'UNIVERSITY_ADMIN', title: 'Registrar', organizationId: 'univ-shivaji', organizationName: 'Shivaji University', mfaEnabled: true, status: 'ACTIVE', lastLoginAt: '2026-08-24T10:40:00Z' },
  { id: 'u-univ-exam', name: 'Dr. Nilesh Jadhav', email: 'exam.controller@shivaji.edu.in', role: 'UNIVERSITY_EXAM_CONTROLLER', title: 'Controller of Examinations', organizationId: 'univ-shivaji', organizationName: 'Shivaji University', mfaEnabled: true, status: 'ACTIVE', lastLoginAt: '2026-08-25T03:55:00Z' },
  { id: 'u-col-admin', name: 'Prof. S. R. Kulkarni', email: 'principal@dkte.ac.in', role: 'COLLEGE_ADMIN', title: 'Principal', organizationId: 'col-dkte', organizationName: "D.K.T.E. Society's Textile & Engineering Institute", mfaEnabled: false, status: 'ACTIVE', lastLoginAt: '2026-08-23T08:20:00Z' },
  { id: 'u-col-exam', name: 'Dr. Manisha Khot', email: 'exam.officer@dkte.ac.in', role: 'COLLEGE_EXAM_OFFICER', title: 'College Examination Officer', organizationId: 'col-dkte', organizationName: "D.K.T.E. Society's Textile & Engineering Institute", mfaEnabled: true, status: 'ACTIVE', lastLoginAt: '2026-08-24T12:15:00Z' },
  { id: 'u-hod-cse', name: 'Dr. Priya Deshmukh', email: 'hod.cse@dkte.ac.in', role: 'DEPARTMENT_HEAD', title: 'Head — Computer Science & Engineering', organizationId: 'dept-cse', organizationName: 'Computer Science & Engineering', mfaEnabled: true, status: 'ACTIVE', lastLoginAt: '2026-08-25T05:02:00Z' },
  { id: 'u-staff-cs1', name: 'Prof. Amit Chavan', email: 'amit.chavan@dkte.ac.in', role: 'DEPARTMENT_STAFF', title: 'Assistant Professor', organizationId: 'dept-cse', organizationName: 'Computer Science & Engineering', mfaEnabled: false, status: 'ACTIVE', lastLoginAt: '2026-08-25T04:48:00Z' },
  { id: 'u-staff-cs2', name: 'Prof. Sneha Kadam', email: 'sneha.kadam@dkte.ac.in', role: 'DEPARTMENT_STAFF', title: 'Assistant Professor', organizationId: 'dept-cse', organizationName: 'Computer Science & Engineering', mfaEnabled: true, status: 'ACTIVE', lastLoginAt: '2026-08-22T06:31:00Z' },
  { id: 'u-auditor', name: 'CA Rohit Bhosale', email: 'auditor@shivaji.edu.in', role: 'AUDITOR', title: 'Internal Audit Cell', organizationId: 'univ-shivaji', organizationName: 'Shivaji University', mfaEnabled: true, status: 'ACTIVE', lastLoginAt: '2026-08-21T09:10:00Z' },
]

/* ---------- Staff roster ---------- */
export const staffMembers: StaffMember[] = [
  { id: 'st-1', employeeId: 'DKTE-CSE-014', name: 'Prof. Amit Chavan', email: 'amit.chavan@dkte.ac.in', departmentId: 'dept-cse', departmentName: 'Computer Science & Engineering', designation: 'Assistant Professor', role: 'DEPARTMENT_STAFF', verificationStatus: 'VERIFIED', invitedBy: 'Dr. Priya Deshmukh', invitedAt: '2025-02-03T05:00:00Z', verifiedBy: 'Dr. Priya Deshmukh', verifiedAt: '2025-02-05T09:30:00Z' },
  { id: 'st-2', employeeId: 'DKTE-CSE-019', name: 'Prof. Sneha Kadam', email: 'sneha.kadam@dkte.ac.in', departmentId: 'dept-cse', departmentName: 'Computer Science & Engineering', designation: 'Assistant Professor', role: 'DEPARTMENT_STAFF', verificationStatus: 'VERIFIED', invitedBy: 'Dr. Priya Deshmukh', invitedAt: '2025-02-03T05:05:00Z', verifiedBy: 'Dr. Priya Deshmukh', verifiedAt: '2025-02-06T07:00:00Z' },
  { id: 'st-3', employeeId: 'DKTE-CSE-023', name: 'Prof. Ganesh Pawar', email: 'ganesh.pawar@dkte.ac.in', departmentId: 'dept-cse', departmentName: 'Computer Science & Engineering', designation: 'Assistant Professor (Contract)', role: 'DEPARTMENT_STAFF', verificationStatus: 'PENDING', invitedBy: 'Dr. Priya Deshmukh', invitedAt: '2026-08-14T06:00:00Z' },
  { id: 'st-4', employeeId: 'DKTE-IT-007', name: 'Prof. Ravi Salunkhe', email: 'ravi.salunkhe@dkte.ac.in', departmentId: 'dept-it', departmentName: 'Information Technology', designation: 'Head & Associate Professor', role: 'DEPARTMENT_HEAD', verificationStatus: 'VERIFIED', invitedBy: 'Prof. S. R. Kulkarni', invitedAt: '2025-01-15T05:00:00Z', verifiedBy: 'Prof. S. R. Kulkarni', verifiedAt: '2025-01-16T04:00:00Z' },
  { id: 'st-5', employeeId: 'DKTE-IT-021', name: 'Prof. Vaishnavi More', email: 'vaishnavi.more@dkte.ac.in', departmentId: 'dept-it', departmentName: 'Information Technology', designation: 'Assistant Professor', role: 'DEPARTMENT_STAFF', verificationStatus: 'UNDER_REVIEW', invitedBy: 'Prof. Ravi Salunkhe', invitedAt: '2026-07-28T05:00:00Z' },
  { id: 'st-6', employeeId: 'DKTE-COM-009', name: 'Dr. Sunita Mane', email: 'sunita.mane@dkte.ac.in', departmentId: 'dept-com', departmentName: 'Commerce', designation: 'Head & Associate Professor', role: 'DEPARTMENT_HEAD', verificationStatus: 'PENDING', invitedBy: 'Prof. S. R. Kulkarni', invitedAt: '2026-08-10T05:00:00Z' },
]

/* ---------- Subjects ---------- */
export const subjects: Subject[] = [
  { id: 'sub-ds', code: 'CSC301', name: 'Data Structures', departmentId: 'dept-cse', departmentName: 'Computer Science & Engineering', course: 'B.Tech CSE', semester: 3, academicYear: '2026–27', credits: 4, syllabusStatus: 'APPROVED', questionCount: 42, assignedTo: 'Prof. Amit Chavan' },
  { id: 'sub-dbms', code: 'CSC304', name: 'Database Management Systems', departmentId: 'dept-cse', departmentName: 'Computer Science & Engineering', course: 'B.Tech CSE', semester: 4, academicYear: '2026–27', credits: 4, syllabusStatus: 'APPROVED', questionCount: 38, assignedTo: 'Prof. Sneha Kadam' },
  { id: 'sub-ml', code: 'CSC502', name: 'Machine Learning', departmentId: 'dept-cse', departmentName: 'Computer Science & Engineering', course: 'B.Tech CSE', semester: 5, academicYear: '2026–27', credits: 4, syllabusStatus: 'APPROVED', questionCount: 51, assignedTo: 'Prof. Amit Chavan' },
  { id: 'sub-cn', code: 'ITC401', name: 'Computer Networks', departmentId: 'dept-it', departmentName: 'Information Technology', course: 'B.Tech IT', semester: 4, academicYear: '2026–27', credits: 4, syllabusStatus: 'AI_EXTRACTED', questionCount: 27, assignedTo: 'Prof. Vaishnavi More' },
]

/* ---------- Syllabi ---------- */
export const syllabi: Syllabus[] = [
  {
    id: 'syl-ml', subjectId: 'sub-ml', subjectCode: 'CSC502', version: 3, status: 'APPROVED',
    sourceFile: 'ML_Syllabus_2026_SPPU_Aligned.pdf', extractedAt: '2026-07-02T05:20:00Z', approvedBy: 'Dr. Priya Deshmukh',
    units: [
      { id: 'ml-u1', number: 1, title: 'Introduction to Machine Learning', hours: 8, weightage: 15, topics: [
        { id: 't-ml-11', title: 'Foundations of ML', subtopics: ['Well-posed learning problems', 'Designing a learning system'], learningOutcomes: ['LO1: Formulate learning problems'] },
        { id: 't-ml-12', title: 'Types of Machine Learning', subtopics: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning'], learningOutcomes: ['LO2: Distinguish ML paradigms with examples'] },
      ]},
      { id: 'ml-u2', number: 2, title: 'Regression & Classification', hours: 10, weightage: 20, topics: [
        { id: 't-ml-21', title: 'Linear Regression', subtopics: ['Least squares', 'Gradient descent'], learningOutcomes: ['LO3: Derive and apply least-squares regression'] },
        { id: 't-ml-22', title: 'Classification Basics', subtopics: ['Logistic regression', 'Decision boundaries'], learningOutcomes: ['LO4: Construct simple classifiers'] },
      ]},
      { id: 'ml-u3', number: 3, title: 'Decision Trees & Rule Learning', hours: 8, weightage: 20, topics: [
        { id: 't-ml-31', title: 'Decision Tree Induction', subtopics: ['ID3', 'Entropy & information gain'], learningOutcomes: ['LO5: Compute information gain and build trees'] },
      ]},
      { id: 'ml-u4', number: 4, title: 'Neural Networks', hours: 9, weightage: 20, topics: [
        { id: 't-ml-41', title: 'Perceptrons & MLPs', subtopics: ['Backpropagation', 'Activation functions'], learningOutcomes: ['LO6: Explain backpropagation mathematically'] },
      ]},
      { id: 'ml-u5', number: 5, title: 'Model Evaluation', hours: 7, weightage: 25, topics: [
        { id: 't-ml-51', title: 'Evaluation Metrics', subtopics: ['Precision/recall', 'ROC curves', 'Cross-validation'], learningOutcomes: ['LO7: Select appropriate evaluation methodology'] },
      ]},
    ],
  },
  {
    id: 'syl-ds', subjectId: 'sub-ds', subjectCode: 'CSC301', version: 2, status: 'APPROVED',
    sourceFile: 'DS_Structured_Syllabus.json', extractedAt: '2026-06-10T04:00:00Z', approvedBy: 'Dr. Priya Deshmukh',
    units: [
      { id: 'ds-u1', number: 1, title: 'Arrays & Linked Lists', hours: 9, weightage: 20, topics: [
        { id: 't-ds-11', title: 'Array Operations', subtopics: ['Insertion/deletion', 'Sparse matrices'], learningOutcomes: ['LO1: Implement dynamic arrays'] },
        { id: 't-ds-12', title: 'Linked Lists', subtopics: ['Singly/doubly linked', 'Circular lists'], learningOutcomes: ['LO2: Implement and analyze linked lists'] },
      ]},
      { id: 'ds-u2', number: 2, title: 'Stacks & Queues', hours: 8, weightage: 20, topics: [
        { id: 't-ds-21', title: 'Applications of Stacks', subtopics: ['Expression evaluation', 'Recursion'], learningOutcomes: ['LO3: Evaluate infix/postfix expressions'] },
      ]},
      { id: 'ds-u3', number: 3, title: 'Trees', hours: 10, weightage: 25, topics: [
        { id: 't-ds-31', title: 'Binary Search Trees', subtopics: ['Traversal', 'AVL rotations'], learningOutcomes: ['LO4: Analyze BST operations'] },
      ]},
      { id: 'ds-u4', number: 4, title: 'Graphs', hours: 8, weightage: 20, topics: [
        { id: 't-ds-41', title: 'Graph Algorithms', subtopics: ['BFS/DFS', 'Shortest paths'], learningOutcomes: ['LO5: Apply BFS/DFS to problems'] },
      ]},
      { id: 'ds-u5', number: 5, title: 'Searching & Sorting', hours: 7, weightage: 15, topics: [
        { id: 't-ds-51', title: 'Sorting Techniques', subtopics: ['Quick sort', 'Merge sort', 'Heap sort'], learningOutcomes: ['LO6: Compare sorting complexity'] },
      ]},
    ],
  },
  {
    id: 'syl-dbms', subjectId: 'sub-dbms', subjectCode: 'CSC304', version: 2, status: 'APPROVED',
    sourceFile: 'DBMS_Syllabus.docx', extractedAt: '2026-06-21T06:10:00Z', approvedBy: 'Dr. Priya Deshmukh',
    units: [
      { id: 'db-u1', number: 1, title: 'Introduction to DBMS', hours: 7, weightage: 15, topics: [
        { id: 't-db-11', title: 'Database System Concepts', subtopics: ['Three-schema architecture', 'Data models'], learningOutcomes: ['LO1: Explain database architecture'] },
      ]},
      { id: 'db-u2', number: 2, title: 'Relational Model & SQL', hours: 11, weightage: 25, topics: [
        { id: 't-db-21', title: 'SQL Fundamentals', subtopics: ['DDL/DML/DCL', 'Joins', 'Aggregate functions'], learningOutcomes: ['LO2: Write complex SQL queries'] },
      ]},
      { id: 'db-u3', number: 3, title: 'Normalization', hours: 8, weightage: 20, topics: [
        { id: 't-db-31', title: 'Functional Dependencies', subtopics: ['1NF–BCNF', 'Lossless decomposition'], learningOutcomes: ['LO3: Normalize relations to BCNF'] },
      ]},
      { id: 'db-u4', number: 4, title: 'Transactions & Concurrency', hours: 9, weightage: 20, topics: [
        { id: 't-db-41', title: 'Concurrency Control', subtopics: ['Two-phase locking', 'Deadlocks'], learningOutcomes: ['LO4: Analyze concurrency protocols'] },
      ]},
      { id: 'db-u5', number: 5, title: 'Indexing & Storage', hours: 7, weightage: 20, topics: [
        { id: 't-db-51', title: 'Index Structures', subtopics: ['B+ trees', 'Hashing'], learningOutcomes: ['LO5: Choose suitable indexing strategy'] },
      ]},
    ],
  },
  {
    id: 'syl-cn', subjectId: 'sub-cn', subjectCode: 'ITC401', version: 1, status: 'AI_EXTRACTED',
    sourceFile: 'CN_Syllabus_scan.pdf', extractedAt: '2026-08-19T07:00:00Z',
    units: [
      { id: 'cn-u1', number: 1, title: 'Network Models', hours: 8, weightage: 20, topics: [
        { id: 't-cn-11', title: 'OSI & TCP/IP Models', subtopics: ['Layer functions', 'Encapsulation'], learningOutcomes: ['LO1: Map protocols to layers'] },
      ]},
      { id: 'cn-u2', number: 2, title: 'Data Link Layer', hours: 9, weightage: 20, topics: [
        { id: 't-cn-21', title: 'Error Control', subtopics: ['CRC', 'Sliding window'], learningOutcomes: ['LO2: Compute CRC checksums'] },
      ]},
      { id: 'cn-u3', number: 3, title: 'Network Layer', hours: 9, weightage: 25, topics: [
        { id: 't-cn-31', title: 'Routing', subtopics: ['Distance vector', 'Link state', 'IP addressing'], learningOutcomes: ['LO3: Design subnet addressing plans'] },
      ]},
      { id: 'cn-u4', number: 4, title: 'Transport Layer', hours: 8, weightage: 20, topics: [
        { id: 't-cn-41', title: 'TCP & UDP', subtopics: ['Congestion control', 'Handshakes'], learningOutcomes: ['LO4: Compare TCP/UDP behaviour'] },
      ]},
      { id: 'cn-u5', number: 5, title: 'Application Layer', hours: 6, weightage: 15, topics: [
        { id: 't-cn-51', title: 'Application Protocols', subtopics: ['DNS', 'HTTP', 'Email protocols'], learningOutcomes: ['LO5: Trace end-to-end application flows'] },
      ]},
    ],
  },
]

/* ---------- Question bank (excerpt shown in UI) ---------- */
export const questions: Question[] = [
  // ----- Data Structures -----
  { id: 'q-ds-001', subjectId: 'sub-ds', subjectCode: 'CSC301', unit: 1, unitTitle: 'Arrays & Linked Lists', topic: 'Linked Lists', text: 'Explain the difference between singly and doubly linked lists. Write algorithms for insertion at the beginning and end of each.', type: 'DESCRIPTIVE', difficulty: 'Medium', bloom: 'Understand', marks: 5, learningOutcome: 'LO2: Implement and analyze linked lists', referenceAnswer: 'A singly linked list stores a single pointer (next)...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-06-18T05:00:00Z', version: 2, duplicateScore: 0.12, validationScore: 94, usageCount: 3 },
  { id: 'q-ds-002', subjectId: 'sub-ds', subjectCode: 'CSC301', unit: 2, unitTitle: 'Stacks & Queues', topic: 'Expression evaluation', text: 'Convert the following infix expression to postfix and evaluate it: (A + B) * (C - D) / E', type: 'NUMERICAL', difficulty: 'Medium', bloom: 'Apply', marks: 4, learningOutcome: 'LO3: Evaluate infix/postfix expressions', referenceAnswer: 'AB+CD-*E/', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Prof. Amit Chavan', createdAt: '2026-06-18T05:02:00Z', version: 1, duplicateScore: 0.08, validationScore: 96, usageCount: 2 },
  { id: 'q-ds-003', subjectId: 'sub-ds', subjectCode: 'CSC301', unit: 3, unitTitle: 'Trees', topic: 'Binary Search Trees', text: 'Construct a BST from the sequence 45, 25, 65, 15, 35, 55, 75 and write all three depth-first traversals.', type: 'PROBLEM_SOLVING', difficulty: 'Easy', bloom: 'Apply', marks: 5, learningOutcome: 'LO4: Analyze BST operations', referenceAnswer: 'Inorder: 15 25 35 45 55 65 75 ...', aiGenerated: false, status: 'APPROVED', createdBy: 'Prof. Amit Chavan', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-05-30T04:00:00Z', version: 1, duplicateScore: 0.05, validationScore: 98, usageCount: 5 },
  { id: 'q-ds-004', subjectId: 'sub-ds', subjectCode: 'CSC301', unit: 3, unitTitle: 'Trees', topic: 'AVL Rotations', text: 'Show the step-by-step AVL rotation required after inserting 30, 20, 10 into an empty tree. State the rotation type used.', type: 'PROBLEM_SOLVING', difficulty: 'Hard', bloom: 'Analyze', marks: 6, learningOutcome: 'LO4: Analyze BST operations', referenceAnswer: 'LL case → right rotation at 30...', aiGenerated: true, status: 'PENDING_REVIEW', createdBy: 'AI Service v2', createdAt: '2026-08-20T06:40:00Z', version: 1, duplicateScore: 0.19, validationScore: 88, usageCount: 0 },
  { id: 'q-ds-005', subjectId: 'sub-ds', subjectCode: 'CSC301', unit: 4, unitTitle: 'Graphs', topic: 'Graph Algorithms', text: 'Apply BFS and DFS on the given adjacency graph starting from vertex A; list visit order and the queue/stack states.', type: 'PROBLEM_SOLVING', difficulty: 'Medium', bloom: 'Apply', marks: 6, learningOutcome: 'LO5: Apply BFS/DFS to problems', referenceAnswer: 'BFS: A,B,D,C,E...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-06-18T05:05:00Z', version: 1, duplicateScore: 0.15, validationScore: 92, usageCount: 2 },
  { id: 'q-ds-006', subjectId: 'sub-ds', subjectCode: 'CSC301', unit: 5, unitTitle: 'Searching & Sorting', topic: 'Sorting Techniques', text: 'Compare quick sort and merge sort in terms of time complexity, stability, and space usage. Which is preferable for linked lists and why?', type: 'SHORT_ANSWER', difficulty: 'Medium', bloom: 'Analyze', marks: 4, learningOutcome: 'LO6: Compare sorting complexity', referenceAnswer: 'Merge sort preferred for linked lists due to O(1) list merging...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Prof. Amit Chavan', createdAt: '2026-06-18T05:07:00Z', version: 1, duplicateScore: 0.11, validationScore: 95, usageCount: 4 },
  { id: 'q-ds-007', subjectId: 'sub-ds', subjectCode: 'CSC301', unit: 1, unitTitle: 'Arrays & Linked Lists', topic: 'Array Operations', text: 'Define sparse matrix. Represent the 4x4 matrix with 3 non-zero elements using triplet form.', type: 'SHORT_ANSWER', difficulty: 'Easy', bloom: 'Remember', marks: 3, learningOutcome: 'LO1: Implement dynamic arrays', referenceAnswer: 'Triplet rows store (row, col, value) per non-zero entry...', aiGenerated: false, status: 'APPROVED', createdBy: 'Prof. Sneha Kadam', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-05-28T04:00:00Z', version: 1, duplicateScore: 0.07, validationScore: 97, usageCount: 6 },

  // ----- DBMS -----
  { id: 'q-db-001', subjectId: 'sub-dbms', subjectCode: 'CSC304', unit: 2, unitTitle: 'Relational Model & SQL', topic: 'Joins', text: 'Write SQL queries for the Employee–Department schema: (a) employees earning above average salary, (b) departments with more than 5 employees, (c) employees not assigned to any project.', type: 'DESCRIPTIVE', difficulty: 'Medium', bloom: 'Apply', marks: 6, learningOutcome: 'LO2: Write complex SQL queries', referenceAnswer: '(a) SELECT * FROM emp WHERE sal > (SELECT AVG(sal)...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-06-25T05:00:00Z', version: 2, duplicateScore: 0.10, validationScore: 96, usageCount: 3 },
  { id: 'q-db-002', subjectId: 'sub-dbms', subjectCode: 'CSC304', unit: 3, unitTitle: 'Normalization', topic: 'Functional Dependencies', text: 'Given R(A,B,C,D) with FDs {A→B, B→C, C→A, C→D}, determine the highest normal form of R. Justify your answer and decompose into BCNF if needed.', type: 'PROBLEM_SOLVING', difficulty: 'Hard', bloom: 'Analyze', marks: 6, learningOutcome: 'LO3: Normalize relations to BCNF', referenceAnswer: 'Candidate keys: A, B, C... R is in 3NF but not BCNF...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-06-25T05:03:00Z', version: 1, duplicateScore: 0.14, validationScore: 93, usageCount: 1 },
  { id: 'q-db-003', subjectId: 'sub-dbms', subjectCode: 'CSC304', unit: 1, unitTitle: 'Introduction to DBMS', topic: 'Three-schema architecture', text: 'State whether the following statement is True or False and justify: "The external schema level provides physical data independence."', type: 'TRUE_FALSE', difficulty: 'Easy', bloom: 'Understand', marks: 2, learningOutcome: 'LO1: Explain database architecture', referenceAnswer: 'False — external level provides logical data independence via conceptual/internal separation...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Prof. Sneha Kadam', createdAt: '2026-06-25T05:05:00Z', version: 1, duplicateScore: 0.09, validationScore: 97, usageCount: 4 },
  { id: 'q-db-004', subjectId: 'sub-dbms', subjectCode: 'CSC304', unit: 4, unitTitle: 'Transactions & Concurrency', topic: 'Two-phase locking', text: 'For the given schedule S: R1(X), W2(X), R1(Y), W1(Y), W2(Y), check whether S is conflict-serializable. Draw the precedence graph.', type: 'PROBLEM_SOLVING', difficulty: 'Hard', bloom: 'Evaluate', marks: 6, learningOutcome: 'LO4: Analyze concurrency protocols', referenceAnswer: 'Precedence graph has cycle T1→T2→T1 hence not conflict-serializable...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-06-25T05:07:00Z', version: 1, duplicateScore: 0.16, validationScore: 91, usageCount: 2 },
  { id: 'q-db-005', subjectId: 'sub-dbms', subjectCode: 'CSC304', unit: 5, unitTitle: 'Indexing & Storage', topic: 'Index Structures', text: 'A file contains 20,000 records with block factor 50. Compute the number of block accesses saved by a secondary index (order p=42, leaf capacity pleaf=32) versus linear search.', type: 'NUMERICAL', difficulty: 'Medium', bloom: 'Apply', marks: 5, learningOutcome: 'LO5: Choose suitable indexing strategy', referenceAnswer: 'Linear: 400 blocks; Index height ≈ 3 → 3 + 1 accesses...', aiGenerated: true, status: 'PENDING_REVIEW', createdBy: 'AI Service v2', createdAt: '2026-08-21T05:30:00Z', version: 1, duplicateScore: 0.21, validationScore: 86, usageCount: 0 },

  // ----- Machine Learning -----
  { id: 'q-ml-001', subjectId: 'sub-ml', subjectCode: 'CSC502', unit: 1, unitTitle: 'Introduction to Machine Learning', topic: 'Types of Machine Learning', text: 'Differentiate supervised, unsupervised, and reinforcement learning with one real-world application of each.', type: 'DESCRIPTIVE', difficulty: 'Easy', bloom: 'Understand', marks: 6, learningOutcome: 'LO2: Distinguish ML paradigms with examples', referenceAnswer: 'Supervised learns from labelled pairs..., e.g., spam detection; unsupervised clusters unlabelled data..., e.g., customer segmentation; RL optimizes reward..., e.g., game playing agents.', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-07-04T05:00:00Z', version: 2, duplicateScore: 0.13, validationScore: 95, usageCount: 2 },
  { id: 'q-ml-002', subjectId: 'sub-ml', subjectCode: 'CSC502', unit: 2, unitTitle: 'Regression & Classification', topic: 'Linear Regression', text: 'Derive the least-squares estimates for simple linear regression y = β0 + β1x and compute them for the dataset {(1,2),(2,4),(3,5),(4,4),(5,5)}.', type: 'NUMERICAL', difficulty: 'Medium', bloom: 'Apply', marks: 6, learningOutcome: 'LO3: Derive and apply least-squares regression', referenceAnswer: 'β1 = Σ(x-x̄)(y-ȳ)/Σ(x-x̄)² = 0.6; β0 = 1.8...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Prof. Amit Chavan', createdAt: '2026-07-04T05:03:00Z', version: 1, duplicateScore: 0.11, validationScore: 94, usageCount: 1 },
  { id: 'q-ml-003', subjectId: 'sub-ml', subjectCode: 'CSC502', unit: 3, unitTitle: 'Decision Trees & Rule Learning', topic: 'ID3 / Information Gain', text: 'Using the Play-Tennis dataset, compute entropy and information gain for attribute Humidity and determine the root node among {Outlook, Temperature, Humidity, Wind}.', type: 'PROBLEM_SOLVING', difficulty: 'Medium', bloom: 'Analyze', marks: 6, learningOutcome: 'LO5: Compute information gain and build trees', referenceAnswer: 'H(S)=0.940; Gain(Humidity)=0.151; Outlook gains highest (0.246) so it is root...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-07-04T05:06:00Z', version: 2, duplicateScore: 0.17, validationScore: 92, usageCount: 3 },
  { id: 'q-ml-004', subjectId: 'sub-ml', subjectCode: 'CSC502', unit: 4, unitTitle: 'Neural Networks', topic: 'Backpropagation', text: 'Explain the backpropagation algorithm for a multilayer perceptron with a single hidden layer. Derive the gradient expression for output-layer weights.', type: 'DESCRIPTIVE', difficulty: 'Hard', bloom: 'Analyze', marks: 10, learningOutcome: 'LO6: Explain backpropagation mathematically', referenceAnswer: 'Forward pass computes activations; error δ_k=(y_k−o_k)f′(net); hidden δ_h=f′(net_h)Σδ_k w_kh; Δw=ηδ·input...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-07-04T05:09:00Z', version: 1, duplicateScore: 0.09, validationScore: 93, usageCount: 2 },
  { id: 'q-ml-005', subjectId: 'sub-ml', subjectCode: 'CSC502', unit: 5, unitTitle: 'Model Evaluation', topic: 'Evaluation Metrics', text: 'A classifier produces TP=40, FP=10, FN=5, TN=45 on a test set. Compute accuracy, precision, recall and F1-score, then comment on which metric best reflects performance under class imbalance.', type: 'NUMERICAL', difficulty: 'Medium', bloom: 'Evaluate', marks: 5, learningOutcome: 'LO7: Select appropriate evaluation methodology', referenceAnswer: 'Accuracy=85%, Precision=80%, Recall=88.9%, F1≈84.2%; recall/F1 preferred under imbalance...', aiGenerated: true, status: 'APPROVED', createdBy: 'AI Service v2', reviewedBy: 'Prof. Amit Chavan', createdAt: '2026-07-04T05:12:00Z', version: 1, duplicateScore: 0.12, validationScore: 96, usageCount: 2 },
  { id: 'q-ml-006', subjectId: 'sub-ml', subjectCode: 'CSC502', unit: 1, unitTitle: 'Introduction to Machine Learning', topic: 'Designing a learning system', text: 'Describe the four components Tom Mitchell identifies when designing a learning system, applied to a checkers-learning program.', type: 'SHORT_ANSWER', difficulty: 'Easy', bloom: 'Remember', marks: 4, learningOutcome: 'LO1: Formulate learning problems', referenceAnswer: 'T=play checkers, P=% won, E=games played against itself...', aiGenerated: false, status: 'APPROVED', createdBy: 'Prof. Amit Chavan', reviewedBy: 'Dr. Priya Deshmukh', createdAt: '2026-06-12T04:30:00Z', version: 1, duplicateScore: 0.06, validationScore: 98, usageCount: 5 },
  { id: 'q-ml-007', subjectId: 'sub-ml', subjectCode: 'CSC502', unit: 2, unitTitle: 'Regression & Classification', topic: 'Decision boundaries', text: 'A spam filter must classify emails. Propose appropriate features, justify the choice of logistic regression over linear regression for this task, and sketch the expected decision boundary.', type: 'CASE_STUDY', difficulty: 'Hard', bloom: 'Create', marks: 8, learningOutcome: 'LO4: Construct simple classifiers', referenceAnswer: 'Features: word frequencies...; linear regression outputs unbounded values inappropriate for class probability...', aiGenerated: true, status: 'PENDING_REVIEW', createdBy: 'AI Service v2', createdAt: '2026-08-22T05:15:00Z', version: 1, duplicateScore: 0.18, validationScore: 87, usageCount: 0 },

  // ----- Computer Networks -----
  { id: 'q-cn-001', subjectId: 'sub-cn', subjectCode: 'ITC401', unit: 1, unitTitle: 'Network Models', topic: 'OSI & TCP/IP Models', text: 'List the seven OSI layers in order and state one protocol and one function at each layer.', type: 'SHORT_ANSWER', difficulty: 'Easy', bloom: 'Remember', marks: 4, learningOutcome: 'LO1: Map protocols to layers', referenceAnswer: 'Physical→Data Link→Network→Transport→Session→Presentation→Application...', aiGenerated: true, status: 'PENDING_REVIEW', createdBy: 'AI Service v2', createdAt: '2026-08-20T06:00:00Z', version: 1, duplicateScore: 0.14, validationScore: 90, usageCount: 0 },
  { id: 'q-cn-002', subjectId: 'sub-cn', subjectCode: 'ITC401', unit: 2, unitTitle: 'Data Link Layer', topic: 'Error Control', text: 'Generate the CRC codeword for data 1010101 with generator polynomial x³+x²+1. Show all modulo-2 division steps.', type: 'NUMERICAL', difficulty: 'Medium', bloom: 'Apply', marks: 5, learningOutcome: 'LO2: Compute CRC checksums', referenceAnswer: 'Append 000; remainder = 110 → codeword 1010101110...', aiGenerated: true, status: 'PENDING_REVIEW', createdBy: 'AI Service v2', createdAt: '2026-08-20T06:03:00Z', version: 1, duplicateScore: 0.10, validationScore: 89, usageCount: 0 },
  { id: 'q-cn-003', subjectId: 'sub-cn', subjectCode: 'ITC401', unit: 3, unitTitle: 'Network Layer', topic: 'IP addressing', text: 'An ISP is assigned 200.10.20.0/22. Create subnet addressing for three departments requiring 500, 200 and 60 hosts respectively. Give subnet address, mask and host range for each.', type: 'PROBLEM_SOLVING', difficulty: 'Hard', bloom: 'Apply', marks: 6, learningOutcome: 'LO3: Design subnet addressing plans', referenceAnswer: '/23 supports 510 hosts → dept1 uses /23; dept2 /24; dept3 /26...', aiGenerated: true, status: 'PENDING_REVIEW', createdBy: 'AI Service v2', createdAt: '2026-08-20T06:06:00Z', version: 1, duplicateScore: 0.15, validationScore: 88, usageCount: 0 },
];

/* ---------- Question papers ---------- */
const mlApprovals: QuestionPaper['approvals'] = [
  { approvalId: 'APR-2026-0412', stage: 'STAFF_SUBMISSION', actorName: 'Prof. Amit Chavan', actorRole: 'DEPARTMENT_STAFF', decision: 'SUBMITTED', comment: 'Sets generated against blueprint BP-CSC502-03.', timestamp: '2026-08-12T05:30:00Z' },
  { approvalId: 'APR-2026-0415', stage: 'DEPARTMENT_HEAD_REVIEW', actorName: 'Dr. Priya Deshmukh', actorRole: 'DEPARTMENT_HEAD', decision: 'APPROVED', comment: 'Unit distribution matches approved weightage. Q7 wording tightened in v2.', timestamp: '2026-08-13T06:10:00Z' },
  { approvalId: 'APR-2026-0418', stage: 'COLLEGE_REVIEW', actorName: 'Dr. Manisha Khot', actorRole: 'COLLEGE_EXAM_OFFICER', decision: 'APPROVED', comment: 'Verified set equivalence report and validation score.', timestamp: '2026-08-15T07:45:00Z' },
  { approvalId: 'APR-2026-0421', stage: 'UNIVERSITY_APPROVAL', actorName: 'Dr. Nilesh Jadhav', actorRole: 'UNIVERSITY_EXAM_CONTROLLER', decision: 'APPROVED', comment: 'Approved for Winter 2026 examination. Vaulted with digital signature.', timestamp: '2026-08-18T04:20:00Z' },
]

const dbmsApprovals: QuestionPaper['approvals'] = [
  { approvalId: 'APR-2026-0430', stage: 'STAFF_SUBMISSION', actorName: 'Prof. Sneha Kadam', actorRole: 'DEPARTMENT_STAFF', decision: 'SUBMITTED', comment: 'Draft sets A/B/C ready for HOD review.', timestamp: '2026-08-22T05:00:00Z' },
  { approvalId: 'APR-2026-0433', stage: 'DEPARTMENT_HEAD_REVIEW', actorName: 'Dr. Priya Deshmukh', actorRole: 'DEPARTMENT_HEAD', decision: 'CHANGES_REQUESTED', comment: 'Section C hard-question share is below blueprint target. Regenerate Set B Q3.', timestamp: '2026-08-23T06:30:00Z' },
]

export const papers: QuestionPaper[] = [
  {
    id: 'pap-1001', code: 'QP-CSC502-W26-A', title: 'Machine Learning — End Semester Examination', subjectId: 'sub-ml', subjectCode: 'CSC502', blueprintId: 'bp-csc502-03',
    examDate: '2026-09-30', durationMinutes: 180, totalMarks: 70,
    sets: [
      { label: 'A', equivalenceGroup: 'eq-1', questions: [] },
      { label: 'B', equivalenceGroup: 'eq-1', questions: [] },
      { label: 'C', equivalenceGroup: 'eq-1', questions: [] },
    ],
    status: 'IN_VAULT', currentVersion: 3,
    versions: [
      { version: 1, label: 'Draft', changedBy: 'Prof. Amit Chavan', changedAt: '2026-08-11T05:00:00Z', reason: 'Initial generation from blueprint BP-CSC502-03.' },
      { version: 2, label: 'Version 2', changedBy: 'Prof. Amit Chavan', changedAt: '2026-08-13T06:30:00Z', reason: 'HOD feedback: tightened Q7 wording, replaced Set B Q3.' },
      { version: 3, label: 'Final', changedBy: 'Dr. Nilesh Jadhav', changedAt: '2026-08-18T04:20:00Z', reason: 'University approval — frozen for vaulting.' },
    ],
    qualitySummary: {
      syllabusCoveragePct: 96,
      difficultyDistribution: { Easy: 29, Medium: 51, Hard: 20 },
      bloomDistribution: { Remember: 14, Understand: 29, Apply: 34, Analyze: 17, Evaluate: 6 },
      unitDistribution: { 1: 15, 2: 20, 3: 20, 4: 20, 5: 25 },
      duplicateScore: 0.09,
      validationScore: 94.5,
      setEquivalenceScore: 0.97,
    },
    approvals: mlApprovals,
    createdBy: 'Prof. Amit Chavan', createdAt: '2026-08-11T05:00:00Z', updatedAt: '2026-08-18T04:25:00Z',
    vault: {
      vaultedAt: '2026-08-18T04:30:00Z', encryption: 'AES-256-GCM',
      documentHash: 'sha256:9f2c…e81a', signedBy: 'Dr. Nilesh Jadhav', signedAt: '2026-08-18T04:35:00Z',
      accessLogCount: 3, releaseLocked: true,
    },
  },
  {
    id: 'pap-1002', code: 'QP-CSC304-W26-A', title: 'Database Management Systems — End Semester Examination', subjectId: 'sub-dbms', subjectCode: 'CSC304', blueprintId: 'bp-csc304-02',
    examDate: '2026-09-26', durationMinutes: 180, totalMarks: 70,
    sets: [
      { label: 'A', equivalenceGroup: 'eq-2', questions: [] },
      { label: 'B', equivalenceGroup: 'eq-2', questions: [] },
      { label: 'C', equivalenceGroup: 'eq-2', questions: [] },
    ],
    status: 'SUBMITTED', currentVersion: 1,
    versions: [
      { version: 1, label: 'Draft', changedBy: 'Prof. Sneha Kadam', changedAt: '2026-08-21T05:00:00Z', reason: 'Generated from blueprint BP-CSC304-02.' },
    ],
    qualitySummary: {
      syllabusCoveragePct: 91,
      difficultyDistribution: { Easy: 27, Medium: 53, Hard: 20 },
      bloomDistribution: { Remember: 12, Understand: 26, Apply: 36, Analyze: 18, Evaluate: 8 },
      unitDistribution: { 1: 15, 2: 25, 3: 20, 4: 20, 5: 20 },
      duplicateScore: 0.12,
      validationScore: 91.0,
      setEquivalenceScore: 0.95,
    },
    approvals: dbmsApprovals,
    createdBy: 'Prof. Sneha Kadam', createdAt: '2026-08-21T05:00:00Z', updatedAt: '2026-08-23T06:30:00Z',
  },
  {
    id: 'pap-0901', code: 'QP-CSC301-S26-A', title: 'Data Structures — Summer 2026 Examination (Archived)', subjectId: 'sub-ds', subjectCode: 'CSC301', blueprintId: 'bp-csc301-01',
    examDate: '2026-05-14', durationMinutes: 180, totalMarks: 70,
    sets: [{ label: 'A', equivalenceGroup: 'eq-0', questions: [] }, { label: 'B', equivalenceGroup: 'eq-0', questions: [] }],
    status: 'ARCHIVED', currentVersion: 3,
    versions: [
      { version: 1, label: 'Draft', changedBy: 'Prof. Amit Chavan', changedAt: '2026-03-30T04:00:00Z', reason: 'Initial draft.' },
      { version: 2, label: 'Version 2', changedBy: 'Prof. Amit Chavan', changedAt: '2026-04-02T04:00:00Z', reason: 'College review corrections.' },
      { version: 3, label: 'Final', changedBy: 'Dr. Nilesh Jadhav', changedAt: '2026-04-05T05:00:00Z', reason: 'Approved and released for May 2026 exam.' },
    ],
    qualitySummary: {
      syllabusCoveragePct: 94, difficultyDistribution: { Easy: 30, Medium: 50, Hard: 20 },
      bloomDistribution: { Remember: 15, Understand: 28, Apply: 33, Analyze: 16, Evaluate: 8 },
      unitDistribution: { 1: 20, 2: 20, 3: 25, 4: 20, 5: 15 }, duplicateScore: 0.10, validationScore: 95.2, setEquivalenceScore: 0.96,
    },
    approvals: [
      { approvalId: 'APR-2026-0201', stage: 'STAFF_SUBMISSION', actorName: 'Prof. Amit Chavan', actorRole: 'DEPARTMENT_STAFF', decision: 'SUBMITTED', timestamp: '2026-03-31T05:00:00Z' },
      { approvalId: 'APR-2026-0204', stage: 'DEPARTMENT_HEAD_REVIEW', actorName: 'Dr. Priya Deshmukh', actorRole: 'DEPARTMENT_HEAD', decision: 'APPROVED', comment: 'Approved after minor edits.', timestamp: '2026-04-01T06:00:00Z' },
      { approvalId: 'APR-2026-0207', stage: 'COLLEGE_REVIEW', actorName: 'Dr. Manisha Khot', actorRole: 'COLLEGE_EXAM_OFFICER', decision: 'APPROVED', timestamp: '2026-04-02T07:00:00Z' },
      { approvalId: 'APR-2026-0209', stage: 'UNIVERSITY_APPROVAL', actorName: 'Dr. Nilesh Jadhav', actorRole: 'UNIVERSITY_EXAM_CONTROLLER', decision: 'APPROVED', comment: 'Released 09:55 AM, exam 10:00 AM 14-May-2026.', timestamp: '2026-04-05T05:00:00Z' },
    ],
    createdBy: 'Prof. Amit Chavan', createdAt: '2026-03-30T04:00:00Z', updatedAt: '2026-05-14T04:30:00Z',
  },
]

/* ---------- Releases ---------- */
export const releases: PaperRelease[] = [
  { id: 'rel-3001', paperId: 'pap-1001', paperCode: 'QP-CSC502-W26-A', setTitle: 'All Sets (A–C)', examDate: '2026-09-30', examTime: '10:00 AM', releaseAt: '2026-09-30T04:25:00Z', status: 'SCHEDULED', deliveredTo: 'Chief Custodian — DKTE Exam Cell (offline delivery)' },
  { id: 'rel-3002', paperId: 'pap-0901', paperCode: 'QP-CSC301-S26-A', setTitle: 'Set A + Set B', examDate: '2026-05-14', examTime: '10:00 AM', releaseAt: '2026-05-14T04:25:00Z', status: 'DELIVERED', deliveredTo: 'Chief Custodian — DKTE Exam Cell', activatedBy: 'Dr. Nilesh Jadhav', activatedAt: '2026-05-14T04:25:00Z' },
]

/* ---------- Audit trail ---------- */
const T = (day: string, time: string) => `2026-${day}T${time}:00Z`

export const auditEvents: AuditEvent[] = [
  ev('evt-9001', 'Arjun Mehta', 'SUPER_ADMIN', 'PLATFORM', 'USER_LOGIN', 'session', 'sess-7712', '08-25', '04:12', 'SUCCESS'),
  ev('evt-9002', 'Dr. Nilesh Jadhav', 'UNIVERSITY_EXAM_CONTROLLER', 'univ-shivaji', 'MFA_SUCCESS', 'user', 'u-univ-exam', '08-25', '03:55', 'SUCCESS'),
  ev('evt-9003', 'Prof. Amit Chavan', 'DEPARTMENT_STAFF', 'dept-cse', 'PAPER_VIEWED', 'question_paper', 'pap-1002', '08-25', '04:50', 'SUCCESS'),
  ev('evt-9004', 'Prof. Ganesh Pawar', 'DEPARTMENT_STAFF', 'dept-cse', 'LOGIN_FAILED', 'user', 'u-staff-new', '08-25', '04:41', 'FAILURE'),
  ev('evt-9005', 'Prof. Ganesh Pawar', 'DEPARTMENT_STAFF', 'dept-cse', 'ACCOUNT_LOCKED', 'user', 'st-3', '08-25', '04:44', 'SUCCESS'),
  ev('evt-9006', 'Dr. Priya Deshmukh', 'DEPARTMENT_HEAD', 'dept-cse', 'PAPER_SUBMITTED', 'question_paper', 'pap-1002', '08-23', '06:30', 'SUCCESS'),
  ev('evt-9007', 'Dr. Manisha Khot', 'COLLEGE_EXAM_OFFICER', 'col-dkte', 'VAULT_ACCESS', 'vault_record', 'pap-1001', '08-22', '09:10', 'SUCCESS'),
  ev('evt-9008', 'Unknown Actor', '—', '—', 'SECURITY_ALERT', 'security_rule', 'rule-bulk-download', '08-22', '08:55', 'DENIED'),
  ev('evt-9009', 'Prof. Sneha Kadam', 'DEPARTMENT_STAFF', 'dept-cse', 'QUESTION_GENERATED', 'question_batch', 'batch-118', '08-22', '05:15', 'SUCCESS'),
  ev('evt-9010', 'Prof. Amit Chavan', 'DEPARTMENT_STAFF', 'dept-cse', 'SYLLABUS_UPLOADED', 'syllabus', 'syl-cn', '08-19', '07:00', 'SUCCESS'),
  ev('evt-9011', 'Dr. Priya Deshmukh', 'DEPARTMENT_HEAD', 'dept-cse', 'SYLLABUS_APPROVED', 'syllabus', 'syl-cn', '08-20', '05:40', 'SUCCESS'),
  ev('evt-9012', 'Dr. Nilesh Jadhav', 'UNIVERSITY_EXAM_CONTROLLER', 'univ-shivaji', 'PAPER_RELEASED', 'release', 'rel-3002', '05-14', '04:25', 'SUCCESS'),
  ev('evt-9013', 'Prof. Vaishnavi More', 'DEPARTMENT_STAFF', 'dept-it', 'PAPER_ACCESS_DENIED', 'question_paper', 'pap-1001', '08-21', '10:02', 'DENIED'),
  ev('evt-9014', 'CA Rohit Bhosale', 'AUDITOR', 'univ-shivaji', 'AUDIT_EXPORTED', 'audit_log', 'range-jul-aug', '08-21', '09:30', 'SUCCESS'),
  ev('evt-9015', 'Prof. S. R. Kulkarni', 'COLLEGE_ADMIN', 'col-dkte', 'STAFF_INVITED', 'staff', 'st-6', '08-10', '05:00', 'SUCCESS'),
  ev('evt-9016', 'Dr. Anil Patil', 'UNIVERSITY_ADMIN', 'univ-shivaji', 'UNIVERSITY_REGISTERED', 'university', 'univ-pune', '08-18', '07:30', 'SUCCESS'),
  ev('evt-9017', 'Arjun Mehta', 'SUPER_ADMIN', 'PLATFORM', 'SETTINGS_CHANGED', 'config', 'ai-provider', '08-15', '06:00', 'SUCCESS'),
  ev('evt-9018', 'Dr. Priya Deshmukh', 'DEPARTMENT_HEAD', 'dept-cse', 'QUESTION_APPROVED', 'question', 'q-ml-007', '08-23', '07:10', 'SUCCESS'),
  ev('evt-9019', 'Prof. Amit Chavan', 'DEPARTMENT_STAFF', 'dept-cse', 'BLUEPRINT_CREATED', 'blueprint', 'bp-csc502-03', '08-10', '04:30', 'SUCCESS'),
  ev('evt-9020', 'Dr. Nilesh Jadhav', 'UNIVERSITY_EXAM_CONTROLLER', 'univ-shivaji', 'PAPER_DOWNLOADED', 'question_paper', 'pap-1001', '08-18', '04:40', 'SUCCESS'),
]

function ev(
  id: string, actorName: string, actorRole: string, orgId: string, action: AuditEvent['action'],
  targetType: string, targetId: string, day: string, time: string, result: AuditEvent['result'],
): AuditEvent {
  const orgNames: Record<string, string> = {
    PLATFORM: 'GEN SAFE EXAM Platform', 'univ-shivaji': 'Shivaji University', 'col-dkte': "D.K.T.E. TEI",
    'dept-cse': 'Computer Science & Engineering', 'dept-it': 'Information Technology', '—': 'External',
  }
  return {
    id, actorId: `actor-${id}`, actorName,
    actorRole: actorRole as AuditEvent['actorRole'],
    organizationId: orgId, organizationName: orgNames[orgId] ?? orgId,
    action, targetType, targetId, timestamp: T(day, time),
    ip: result === 'DENIED' ? '203.129.44.71' : `10.24.${(parseInt(id.slice(-2)) % 250)}.12`,
    device: action === 'LOGIN_FAILED' ? 'Chrome 139 / Linux (unknown device)' : 'Edge 138 / Windows 11',
    result,
  }
}

/* ---------- Security events ---------- */
export const securityEvents: SecurityEvent[] = [
  { id: 'sec-501', type: 'Bulk download attempt', description: 'User requested download of 12 vault records within 4 minutes. Rate rule triggered; session requires review before further downloads.', riskLevel: 'HIGH', actorName: 'Prof. Vaishnavi More', ip: '10.24.66.31', timestamp: '2026-08-22T08:55:00Z', status: 'INVESTIGATING', relatedEntity: 'Vault record batch #VB-88' },
  { id: 'sec-502', type: 'Multiple failed logins', description: '5 consecutive failed password attempts for account st-3 (Prof. Ganesh Pawar). Account temporarily locked per policy LOCK-5.', riskLevel: 'MEDIUM', actorName: 'Prof. Ganesh Pawar', ip: '49.36.181.204', timestamp: '2026-08-25T04:44:00Z', status: 'RESOLVED', relatedEntity: 'Account st-3' },
  { id: 'sec-503', type: 'Access outside release window', description: 'Attempt to open vaulted paper QP-CSC502-W26-A before scheduled release. Access denied and logged as high-risk event.', riskLevel: 'HIGH', actorName: 'Prof. Vaishnavi More', ip: '10.24.66.31', timestamp: '2026-08-21T10:02:00Z', status: 'RESOLVED', relatedEntity: 'pap-1001' },
  { id: 'sec-504', type: 'New device sign-in', description: 'Successful sign-in from unrecognized device (Firefox 141 / macOS) for account u-col-admin. MFA challenge passed.', riskLevel: 'LOW', actorName: 'Prof. S. R. Kulkarni', ip: '103.25.128.9', timestamp: '2026-08-20T07:12:00Z', status: 'DISMISSED' },
  { id: 'sec-505', type: 'Off-hours paper access', description: 'Vault metadata viewed at 23:47 local time outside typical activity window. Flagged for routine review.', riskLevel: 'LOW', actorName: 'Dr. Manisha Khot', ip: '10.24.12.8', timestamp: '2026-08-19T18:17:00Z', status: 'DISMISSED' },
  { id: 'sec-506', type: 'Impossible travel', description: 'Sign-in pattern indicates two distant IPs within 40 minutes for the same account. Session invalidated automatically; user re-authenticated successfully.', riskLevel: 'CRITICAL', actorName: 'test.account@dkte.ac.in', ip: '185.220.101.5', timestamp: '2026-08-12T03:20:00Z', status: 'RESOLVED', relatedEntity: 'Account disabled pending investigation' },
]

export const sessions: ActiveSession[] = [
  { id: 'sess-7712', userName: 'Arjun Mehta', role: 'SUPER_ADMIN', device: 'Chrome 139 / Windows 11', ip: '10.24.1.12', startedAt: '2026-08-25T04:10:00Z', lastActiveAt: '2026-08-25T05:05:00Z', mfa: true, current: true },
  { id: 'sess-7709', userName: 'Dr. Nilesh Jadhav', role: 'UNIVERSITY_EXAM_CONTROLLER', device: 'Edge 138 / Windows 11', ip: '10.24.3.44', startedAt: '2026-08-25T03:52:00Z', lastActiveAt: '2026-08-25T05:01:00Z', mfa: true },
  { id: 'sess-7698', userName: 'Dr. Priya Deshmukh', role: 'DEPARTMENT_HEAD', device: 'Chrome 139 / macOS', ip: '10.24.8.21', startedAt: '2026-08-25T05:00:00Z', lastActiveAt: '2026-08-25T05:04:00Z', mfa: true },
  { id: 'sess-7681', userName: 'Prof. Amit Chavan', role: 'DEPARTMENT_STAFF', device: 'Chrome 139 / Windows 10', ip: '10.24.8.57', startedAt: '2026-08-25T04:45:00Z', lastActiveAt: '2026-08-25T04:59:00Z', mfa: false },
  { id: 'sess-7675', userName: 'Dr. Manisha Khot', role: 'COLLEGE_EXAM_OFFICER', device: 'Edge 138 / Windows 11', ip: '10.24.12.8', startedAt: '2026-08-24T12:10:00Z', lastActiveAt: '2026-08-24T16:40:00Z', mfa: true },
  { id: 'sess-7660', userName: 'CA Rohit Bhosale', role: 'AUDITOR', device: 'Firefox 141 / Ubuntu', ip: '10.24.2.19', startedAt: '2026-08-21T09:05:00Z', lastActiveAt: '2026-08-21T11:30:00Z', mfa: true },
]

export const notifications: AppNotification[] = [
  { id: 'n-1', title: 'Approval required', body: 'QP-CSC304-W26-A awaits your review at Department Head stage.', time: '12 min ago', kind: 'approval', read: false },
  { id: 'n-2', title: 'Security alert', body: 'Bulk download attempt flagged (HIGH). Investigation open as sec-501.', time: '3 days ago', kind: 'security', read: false },
  { id: 'n-3', title: 'Release locked', body: 'QP-CSC502-W26-A is protected in the Secure Vault until 30 Sep, 09:55 AM.', time: '1 week ago', kind: 'system', read: true },
  { id: 'n-4', title: 'Syllabus extracted', body: 'Computer Networks structure ready for your verification.', time: '1 week ago', kind: 'syllabus', read: true },
]

/* ---------- Platform stats used by dashboards ---------- */
export const platformStats = {
  activeUniversities: 1, pendingUniversities: 1,
  activeColleges: 2, departments: 3,
  staffTotal: staffMembers.length, staffVerified: staffMembers.filter(s => s.verificationStatus === 'VERIFIED').length,
  subjects: subjects.length, questionBankSize: 158, papersThisYear: papers.length,
  pendingApprovals: 2, securityEventsOpen: securityEvents.filter(e => e.status === 'OPEN' || e.status === 'INVESTIGATING').length,
  mfaCoveragePct: 78, failedLogins24h: 5, activeSessions: sessions.length,
}
