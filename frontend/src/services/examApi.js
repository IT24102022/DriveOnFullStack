import api from './api';

// ── Theory Exams ────────────────────────────────────────────────────────────────
export const getTheoryExams = (params) => api.get('/exams/theory', { params });
export const getTheoryExamById = (id) => api.get(`/exams/theory/${id}`);
export const getUpcomingTheoryExams = () => api.get('/exams/theory/upcoming');
export const getAssignableStudents = (examId) => api.get(`/exams/theory/${examId}/assignable-students`);
export const assignStudentToTheoryExam = (examId, studentId) => 
  api.post(`/exams/theory/${examId}/assign-student`, { studentId });
export const unassignStudentFromTheoryExam = (examId, studentId) => 
  api.post(`/exams/theory/${examId}/unassign-student`, { studentId });
export const importTheoryExams = (exams) => api.post('/exams/theory/import', { exams });

// ── Practical Exams ──────────────────────────────────────────────────────────────
export const getPracticalExams = (params) => api.get('/exams/practical', { params });
export const getPracticalExamById = (id) => api.get(`/exams/practical/${id}`);
export const getUpcomingPracticalExams = () => api.get('/exams/practical/upcoming');
export const getAssignablePracticalStudents = (examId) => api.get(`/exams/practical/${examId}/assignable-students`);
export const assignStudentToPracticalExam = (examId, studentId) => 
  api.post(`/exams/practical/${examId}/assign-student`, { studentId });
export const unassignStudentFromPracticalExam = (examId, studentId) => 
  api.post(`/exams/practical/${examId}/unassign-student`, { studentId });
export const importPracticalExams = (exams) => api.post('/exams/practical/import', { exams });

// ── Progress Tracking ─────────────────────────────────────────────────────────────
export const getAllStudentProgress = (params) => api.get('/exam-progress/students', { params });
export const getStudentProgress = (studentId) => api.get(`/exam-progress/students/${studentId}`);
export const updateStudentProgress = (studentId, data) => 
  api.post(`/exam-progress/students/${studentId}/update`, data);
export const getProgressStats = () => api.get('/exam-progress/stats');

// ── Attendance ────────────────────────────────────────────────────────────────────
export const getAttendanceRecords = (params) => api.get('/exam-attendance', { params });
export const createAttendanceRecord = (data) => api.post('/exam-attendance', data);
export const getAttendanceAnalytics = (params) => api.get('/exam-attendance/analytics', { params });
export const getAttendanceReports = (params) => api.get('/exam-attendance/reports', { params });
export const getStudentAttendance = (studentId, params) => 
  api.get(`/exam-attendance/student/${studentId}`, { params });

// ── Exam Results ───────────────────────────────────────────────────────────────────
export const createExamResult = (data) => api.post('/exam-results', data);
export const getStudentResults = (studentId, params) => 
  api.get(`/exam-results/student/${studentId}`, { params });
export const getExamResults = (examType, examId) => 
  api.get(`/exam-results/exam/${examType}/${examId}`);
export const getResultStats = (params) => api.get('/exam-results/stats', { params });

// ── Combined API Calls ─────────────────────────────────────────────────────────────
export const getUpcomingExams = () => {
  return Promise.all([
    getUpcomingTheoryExams(),
    getUpcomingPracticalExams()
  ]).then(([theory, practical]) => ({
    theory: theory.data,
    practical: practical.data
  }));
};

export const getExamDetails = (examType, examId) => {
  if (examType === 'theory') {
    return getTheoryExamById(examId);
  } else {
    return getPracticalExamById(examId);
  }
};

export const getStudentExamStatus = (studentId) => {
  return Promise.all([
    getStudentProgress(studentId),
    getStudentResults(studentId)
  ]).then(([progress, results]) => ({
    progress: progress.data,
    results: results.data
  }));
};
