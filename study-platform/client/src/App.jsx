import React from 'react'

const translations = {
  en: {
    welcome: "Welcome",
    videos: "Videos",
    quizzes: "Quizzes",
    messages: "Messages",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    name: "Name",
    role: "Role",
    teacher: "Teacher",
    student: "Student",
    createAccount: "Create Account",
    welcomeBack: "Welcome Back",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    uploadVideo: "Upload Video",
    title: "Title",
    description: "Description",
    videoFile: "Video File",
    uploading: "Uploading...",
    noVideosYet: "No videos yet",
    delete: "Delete",
    createQuiz: "Create Quiz",
    questions: "Questions",
    addQuestion: "Add Question",
    option: "Option",
    correctAnswer: "Correct Answer",
    submit: "Submit",
    noQuizzesYet: "No quizzes yet",
    notAttempted: "Not attempted",
    score: "Score",
    viewResults: "View Results",
    sendMessage: "Send Message",
    recipient: "Recipient",
    selectRecipient: "Select recipient",
    message: "Message",
    broadcastToAll: "Broadcast to all students",
    inbox: "Inbox",
    noMessages: "No messages",
    broadcast: "Broadcast",
    quizCompleted: "Quiz Completed!",
    youGot: "You got",
    outOf: "out of",
    correct: "correct",
    backToQuizzes: "Back to Quizzes",
    quizResults: "Quiz Results",
    noSubmissionsYet: "No submissions yet",
    darkMode: "Dark Mode",
    language: "Language",
    english: "English",
    arabic: "Arabic",
    aiAssistant: "AI Assistant",
    askMeAnything: "Ask me anything...",
    send: "Send",
    watchVideos: "Watch educational videos",
    testKnowledge: "Test your knowledge",
    communicate: "Communicate with",
    students: "students",
    teachers: "teachers",
    by: "By",
    allFieldsRequired: "All fields are required",
    error: "Error",
    success: "Success",
    uploadSuccess: "Video uploaded successfully",
    quizCreated: "Quiz created successfully",
    messageSent: "Message sent successfully"
  },
  ar: {
    welcome: "مرحباً",
    videos: "الفيديوهات",
    quizzes: "الاختبارات",
    messages: "الرسائل",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    name: "الاسم",
    role: "الدور",
    teacher: "معلم",
    student: "طالب",
    createAccount: "إنشاء حساب",
    welcomeBack: "مرحباً بعودتك",
    dontHaveAccount: "ليس لديك حساب؟",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    uploadVideo: "رفع فيديو",
    title: "العنوان",
    description: "الوصف",
    videoFile: "ملف الفيديو",
    uploading: "جاري الرفع...",
    noVideosYet: "لا توجد فيديوهات بعد",
    delete: "حذف",
    createQuiz: "إنشاء اختبار",
    questions: "الأسئلة",
    addQuestion: "إضافة سؤال",
    option: "الخيار",
    correctAnswer: "الإجابة الصحيحة",
    submit: "إرسال",
    noQuizzesYet: "لا توجد اختبارات بعد",
    notAttempted: "لم يتم الحل",
    score: "النتيجة",
    viewResults: "عرض النتائج",
    sendMessage: "إرسال رسالة",
    recipient: "المستلم",
    selectRecipient: "اختر المستلم",
    message: "الرسالة",
    broadcastToAll: "إرسال للجميع",
    inbox: "صندوق الوارد",
    noMessages: "لا توجد رسائل",
    broadcast: "إذاعة",
    quizCompleted: "اكتمل الاختبار!",
    youGot: "حصلت على",
    outOf: "من",
    correct: "صحيح",
    backToQuizzes: "العودة للاختبارات",
    quizResults: "نتائج الاختبار",
    noSubmissionsYet: "لا توجد مشاركات بعد",
    darkMode: "الوضع الداكن",
    language: "اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
    aiAssistant: "المساعد الذكي",
    askMeAnything: "اسألني أي شيء...",
    send: "إرسال",
    watchVideos: "شاهد الفيديوهات التعليمية",
    testKnowledge: "اختبر معرفتك",
    communicate: "تواصل مع",
    students: "الطلاب",
    teachers: "المعلمين",
    by: "بواسطة",
    allFieldsRequired: "جميع الحقول مطلوبة",
    error: "خطأ",
    success: "نجاح",
    uploadSuccess: "تم رفع الفيديو بنجاح",
    quizCreated: "تم إنشاء الاختبار بنجاح",
    messageSent: "تم إرسال الرسالة بنجاح"
  }
};

import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'

const API_URL = '/api'

const AppContext = createContext(null)

function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('en')
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedLanguage = localStorage.getItem('language') || 'en'
    
    setDarkMode(savedDarkMode)
    setLanguage(savedLanguage)
    
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) setUser(data)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : ''
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const t = (key) => translations[language][key] || key

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (email, password, name, role) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AppContext.Provider value={{ 
      user, loading, login, register, logout, 
      darkMode, setDarkMode, 
      language, setLanguage,
      t, aiOpen, setAiOpen 
    }}>
      {children}
    </AppContext.Provider>
  )
}

function useApp() {
  return useContext(AppContext)
}

function ProtectedRoute({ children }) {
  const { user, loading } = useApp()
  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

function Navbar() {
  const { user, logout, t, setAiOpen, language } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          {language === 'ar' ? 'منصة الدراسة' : 'Study Platform'}
        </Link>
        <div className="navbar-links">
          <Link to="/videos">{t('videos')}</Link>
          <Link to="/quizzes">{t('quizzes')}</Link>
          <Link to="/messages">{t('messages')}</Link>
          <Link to="/settings">{t('settings')}</Link>
          <button onClick={() => setAiOpen(true)} className="btn btn-ai">🤖 {t('aiAssistant')}</button>
          <span>{user.name} ({t(user.role.toLowerCase())})</span>
          <button onClick={handleLogout} className="btn btn-secondary">{t('logout')}</button>
        </div>
      </div>
    </nav>
  )
}

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [error, setError] = useState('')
  const { login, register, t } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        await register(email, password, name, role)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h1 className="auth-title">{isRegister ? t('createAccount') : t('welcomeBack')}</h1>
        {error && <p style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">{t('name')}</label>
                <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('role')}</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="STUDENT">{t('student')}</option>
                  <option value="TEACHER">{t('teacher')}</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {isRegister ? t('createAccount') : t('login')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16 }}>
          {isRegister ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
          <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
            {isRegister ? t('login') : t('register')}
          </button>
        </p>
      </div>
    </div>
  )
}

function Videos() {
  const { user, t } = useApp()
  const [videos, setVideos] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [useUrl, setUseUrl] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/videos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setVideos(data)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!title) {
      setError(t('allFieldsRequired'))
      return
    }
    if (!useUrl && !file) {
      setError('Please select a video file')
      return
    }
    if (useUrl && !videoUrl) {
      setError('Please enter a video URL')
      return
    }

    setUploading(true)
    setError('')

    const token = localStorage.getItem('token')

    if (useUrl) {
      const res = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, videoUrl })
      })
      const data = await res.json()
      if (res.ok) {
        setShowUpload(false)
        setTitle('')
        setDescription('')
        setVideoUrl('')
        fetchVideos()
      } else {
        setError(data.error || 'Upload failed')
      }
    } else {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('video', file)

      const res = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setShowUpload(false)
        setTitle('')
        setDescription('')
        setFile(null)
        fetchVideos()
      } else {
        setError(data.error || 'Upload failed')
      }
    }
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchVideos()
  }

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between mb-4">
          <h1 className="page-title">{t('videos')}</h1>
          {user.role === 'TEACHER' && (
            <button onClick={() => setShowUpload(true)} className="btn btn-primary">
              {t('uploadVideo')}
            </button>
          )}
        </div>

        {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

        {videos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <p>{t('noVideosYet')}</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {videos.map(video => (
              <div key={video.id} className="card video-card">
                {video.cloudinaryUrl.includes('youtube') || video.cloudinaryUrl.includes('youtu.be') ? (
                  <iframe className="video-player" src={video.cloudinaryUrl.replace('watch?v=', 'embed/')} allowFullScreen />
                ) : video.cloudinaryUrl.startsWith('http') && !video.cloudinaryUrl.includes('cloudinary') ? (
                  <video controls className="video-player" src={video.cloudinaryUrl}>Your browser does not support video</video>
                ) : (
                  <video controls className="video-player" src={video.cloudinaryUrl}>Your browser does not support video</video>
                )}
                <h3 className="video-title">{video.title}</h3>
                <p className="video-meta">{video.description || ''}</p>
                <p className="video-meta">{t('by')}: {video.teacher?.name}</p>
                {user.role === 'TEACHER' && video.teacherId === user.id && (
                  <button onClick={() => handleDelete(video.id)} className="btn btn-danger mt-4">
                    {t('delete')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {showUpload && (
          <div className="modal-overlay" onClick={() => setShowUpload(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{t('uploadVideo')}</h2>
                <button onClick={() => setShowUpload(false)} className="modal-close">&times;</button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label className="form-label">{t('title')}</label>
                  <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('description')}</label>
                  <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <input type="checkbox" checked={useUrl} onChange={e => { setUseUrl(e.target.checked); setFile(null); setVideoUrl(''); }} />
                    {' '}Use Video URL (YouTube, direct link)
                  </label>
                </div>
                {useUrl ? (
                  <div className="form-group">
                    <label className="form-label">Video URL</label>
                    <input type="url" className="form-input" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">{t('videoFile')}</label>
                    <input type="file" accept="video/*" className="form-input" onChange={e => setFile(e.target.files[0])} />
                  </div>
                )}
                <button type="submit" className="btn btn-primary" disabled={uploading} style={{ width: '100%' }}>
                  {uploading ? t('uploading') : t('uploadVideo')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Quizzes() {
  const { user, t } = useApp()
  const [quizzes, setQuizzes] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }])

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/quizzes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setQuizzes(data)
  }

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }])
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = value
    setQuestions(updated)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: quizTitle, description: quizDescription, questions })
    })

    if (res.ok) {
      setShowCreate(false)
      setQuizTitle('')
      setQuizDescription('')
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }])
      fetchQuizzes()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/quizzes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchQuizzes()
  }

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between mb-4">
          <h1 className="page-title">{t('quizzes')}</h1>
          {user.role === 'TEACHER' && (
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              {t('createQuiz')}
            </button>
          )}
        </div>

        {quizzes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>{t('noQuizzesYet')}</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {quizzes.map(quiz => (
              <Link to={`/quiz/${quiz.id}`} key={quiz.id} className="card quiz-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 className="quiz-title">{quiz.title}</h3>
                <p className="video-meta">{quiz.description || ''}</p>
                <div className="quiz-meta mt-4">
                  <span>{t('by')}: {quiz.teacher?.name}</span>
                  <span>{quiz.questions?.length || 0} {t('questions')}</span>
                  {user.role === 'STUDENT' && (
                    <>
                      {quiz.attempted ? (
                        <span className="badge badge-success">{t('score')}: {quiz.bestScore}%</span>
                      ) : (
                        <span className="badge badge-warning">{t('notAttempted')}</span>
                      )}
                    </>
                  )}
                </div>
                {user.role === 'TEACHER' && (
                  <div className="mt-4" onClick={e => e.preventDefault()}>
                    <Link to={`/quiz/${quiz.id}/results`} className="btn btn-secondary">{t('viewResults')}</Link>
                    <button onClick={() => handleDelete(quiz.id)} className="btn btn-danger" style={{ marginLeft: 8 }}>{t('delete')}</button>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
              <div className="modal-header">
                <h2 className="modal-title">{t('createQuiz')}</h2>
                <button onClick={() => setShowCreate(false)} className="modal-close">&times;</button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">{t('title')}</label>
                  <input type="text" className="form-input" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('description')}</label>
                  <textarea className="form-input" value={quizDescription} onChange={e => setQuizDescription(e.target.value)} />
                </div>
                <h3 style={{ marginBottom: 16 }}>{}</h3>
t('questions')                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="question-card">
                    <div className="form-group">
                      <label className="form-label">{t('questions')} {qIndex + 1}</label>
                      <input type="text" className="form-input" value={q.questionText} onChange={e => updateQuestion(qIndex, 'questionText', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('option')}s ({t('correctAnswer')})</label>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <input type="radio" name={`q${qIndex}`} checked={q.correctAnswer === oIndex} onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)} />
                          <input type="text" className="form-input" placeholder={`${t('option')} ${oIndex + 1}`} value={opt} onChange={e => updateOption(qIndex, oIndex, e.target.value)} required />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addQuestion} className="btn btn-secondary mb-4">{t('addQuestion')}</button>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('createQuiz')}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QuizDetail() {
  const { t } = useApp()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const pathParts = window.location.pathname.split('/')
  const quizId = pathParts[pathParts.length - 1]
  const isResults = window.location.pathname.includes('/results')

  useEffect(() => {
    if (isResults) {
      fetchResults()
    } else {
      fetchQuiz()
    }
  }, [])

  const fetchQuiz = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/quizzes/${quizId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setQuiz(data)
    setAnswers(new Array(data.questions?.length || 0).fill(0))
  }

  const fetchResults = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/quizzes/${quizId}/results`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setQuiz({ attempts: data })
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers })
    })
    const data = await res.json()
    setResult(data)
    setSubmitted(true)
  }

  if (!quiz) return <div className="page"><div className="container">Loading...</div></div>

  if (isResults) {
    return (
      <div className="page">
        <div className="container">
          <Link to="/quizzes" className="btn btn-secondary mb-4">← {t('backToQuizzes')}</Link>
          <h1 className="page-title">{t('quizResults')}</h1>
          {quiz.attempts?.length === 0 ? (
            <p>{t('noSubmissionsYet')}</p>
          ) : (
            <div className="grid grid-2">
              {quiz.attempts?.map(attempt => (
                <div key={attempt.id} className="card">
                  <h3>{attempt.student?.name}</h3>
                  <p>{attempt.student?.email}</p>
                  <p className="mt-4">{t('score')}: <strong>{attempt.score}%</strong></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="page">
        <div className="container">
          <div className="card results-card">
            <h2>{t('quizCompleted')}</h2>
            <div className="results-score">{result.score}%</div>
            <p>{t('youGot')} {result.correctAnswers} {t('outOf')} {result.totalQuestions} {t('correct')}</p>
            <Link to="/quizzes" className="btn btn-primary mt-4">{t('backToQuizzes')}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <Link to="/quizzes" className="btn btn-secondary mb-4">← {t('backToQuizzes')}</Link>
        <h1 className="page-title">{quiz.title}</h1>
        <p className="mb-4">{quiz.description}</p>

        {quiz.questions?.map((q, qIndex) => (
          <div key={q.id} className="question-card">
            <p className="question-text">{qIndex + 1}. {q.questionText}</p>
            {q.options?.map((opt, oIndex) => (
              <label key={oIndex} className={`option-label ${answers[qIndex] === oIndex ? 'selected' : ''}`}>
                <input type="radio" name={`q${qIndex}`} checked={answers[qIndex] === oIndex} onChange={() => {
                  const newAnswers = [...answers]
                  newAnswers[qIndex] = oIndex
                  setAnswers(newAnswers)
                }} />
                {opt}
              </label>
            ))}
          </div>
        ))}

        <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
          {t('submit')}
        </button>
      </div>
    </div>
  )
}

function Messages() {
  const { user, t } = useApp()
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [recipientId, setRecipientId] = useState('')
  const [content, setContent] = useState('')
  const [isBroadcast, setIsBroadcast] = useState(false)

  useEffect(() => {
    fetchMessages()
    fetchUsers()
  }, [])

  const fetchMessages = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setMessages(data)
  }

  const fetchUsers = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/messages/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setUsers(data)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content) return

    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, recipientId: recipientId || null, isBroadcast })
    })

    if (res.ok) {
      setContent('')
      setRecipientId('')
      setIsBroadcast(false)
      fetchMessages()
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('messages')}</h1>

        <div className="grid grid-2">
          <div>
            <div className="card mb-4">
              <h3 className="mb-4">{t('sendMessage')}</h3>
              <form onSubmit={handleSend}>
                {user.role === 'TEACHER' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <input type="checkbox" checked={isBroadcast} onChange={e => setIsBroadcast(e.target.checked)} />
                        {' '}{t('broadcastToAll')}
                      </label>
                    </div>
                    {!isBroadcast && (
                      <div className="form-group">
                        <label className="form-label">{t('recipient')}</label>
                        <select className="form-select" value={recipientId} onChange={e => setRecipientId(e.target.value)}>
                          <option value="">{t('selectRecipient')}</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
                {user.role === 'STUDENT' && (
                  <div className="form-group">
                    <label className="form-label">{t('recipient')} ({t('teacher')})</label>
                    <select className="form-select" value={recipientId} onChange={e => setRecipientId(e.target.value)} required>
                      <option value="">{t('selectRecipient')}</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{t('message')}</label>
                  <textarea className="form-input" value={content} onChange={e => setContent(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('send')}</button>
              </form>
            </div>
          </div>

          <div>
            <div className="card">
              <h3 className="mb-4">{t('inbox')}</h3>
              {messages.length === 0 ? (
                <p className="empty-state">{t('noMessages')}</p>
              ) : (
                <div className="message-list">
                  {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.senderId === user.id ? 'message-sent' : 'message-received'}`}>
                      <div className="message-header">
                        <span className="message-sender">
                          {msg.senderId === user.id ? 'You' : msg.sender?.name}
                          {msg.isBroadcast && <span className="badge badge-primary" style={{ marginLeft: 8 }}>{t('broadcast')}</span>}
                        </span>
                        <span className="message-time">{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="message-content">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Settings() {
  const { t, darkMode, setDarkMode, language, setLanguage } = useApp()

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('settings')}</h1>

        <div className="card" style={{ maxWidth: 500 }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {t('darkMode')}
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={(e) => setDarkMode(e.target.checked)}
                style={{ width: 20, height: 20 }}
              />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">{t('language')}</label>
            <select 
              className="form-select" 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">{t('english')}</option>
              <option value="ar">{t('arabic')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

function AIAssistant() {
  const { t, aiOpen, setAiOpen } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = React.useRef(null)

  const closeAI = () => {
    setAiOpen(false)
    setMessages([])
  }

  const getSmartResponse = (question) => {
    const q = question.toLowerCase()
    const responses = [
      { keywords: ['hello', 'hi', 'hey', 'greetings'], response: 'Hello there! How can I assist you with your learning today?' },
      { keywords: ['help', 'what can you do'], response: 'I can help you with: studying tips, explaining concepts, answering questions about any subject, test preparation, and more!' },
      { keywords: ['math', 'mathematics', 'algebra', 'calculus'], response: 'Math tip: Break problems into smaller steps. For algebra, isolate the variable. For calculus, remember the basics: derivatives are about rates of change, integrals are about areas under curves. What specific topic do you need help with?' },
      { keywords: ['science', 'physics', 'chemistry', 'biology'], response: 'Science is amazing! Which branch interests you? Physics studies matter and energy, Chemistry explores substances, Biology studies living organisms. What would you like to learn?' },
      { keywords: ['history', 'historical'], response: 'History gives us wisdom from the past. What era or event would you like to explore? Ancient civilizations, medieval times, modern history?' },
      { keywords: ['study', 'studying', 'tips'], response: 'Study Tips: 1) Create a study schedule 2) Take regular breaks (25 min study, 5 min break) 3) Use active recall 4) Teach what you learned to someone else 5) Get enough sleep!' },
      { keywords: ['exam', 'test', 'quiz'], response: 'Exam Prep: Review your notes thoroughly, practice with past questions, don\'t cram - spread your studying, eat well, sleep well, and arrive early!' },
      { keywords: ['video', 'videos'], response: 'Videos are great for learning! You can find educational videos on YouTube, Khan Academy, Coursera, and many other platforms. What subject interests you?' },
      { keywords: ['teacher', 'teacher'], response: 'Your teachers are there to help you succeed! Make sure to ask questions when you don\'t understand something. They appreciate engaged students!' },
      { keywords: ['student'], response: 'Being a student is a wonderful opportunity to learn and grow. Stay curious, ask questions, and make the most of your education!' },
      { keywords: ['learn'], response: 'Learning is a journey! Start with what interests you, set small goals, practice consistently, and don\'t be afraid to make mistakes - they help you grow!' },
      { keywords: ['homework', 'assignment'], response: 'For homework: Start with the hardest tasks first (when you\'re fresh), take breaks, ask for help if needed, and always review before submitting!' },
      { keywords: ['motivation', 'motivated', 'lazy'], response: 'Stay motivated by setting small achievable goals, rewarding yourself for completing tasks, reminding yourself of your goals, and taking care of your physical and mental health!' },
      { keywords: ['memory', 'remember', 'memorize'], response: 'Memory tips: Use spaced repetition, create flashcards, make associations, teach others, use mnemonics, and get plenty of sleep!' },
      { keywords: ['programming', 'code', 'coding'], response: 'Programming tip: Practice daily, start with basics, build projects, read documentation, don\'t fear bugs - they\'re learning opportunities! What language are you learning?' },
      { keywords: ['language', 'english', 'arabic'], response: 'Language learning: Practice speaking daily, watch movies/shows in that language, use flashcards for vocabulary, and don\'t be afraid to make mistakes!' },
      { keywords: ['thank', 'thanks'], response: 'You\'re welcome! Good luck with your studies! Feel free to ask more questions anytime!' },
      { keywords: ['bye', 'goodbye', 'see you'], response: 'Goodbye! Keep studying and never stop learning! See you next time!' }
    ]
    
    for (const item of responses) {
      for (const keyword of item.keywords) {
        if (q.includes(keyword)) return item.response
      }
    }
    return `That's a great question about "${question}"! While I don't have specific information on that topic, I'd suggest: 1) Search online resources 2) Check your textbooks 3) Ask your teacher 4) Try educational websites. What subject is this related to?`
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && aiOpen) {
        closeAI()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aiOpen])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleOllama = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: [
            { role: 'system', content: 'You are a helpful educational assistant. Keep responses concise and friendly.' },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          stream: false
        })
      })
      if (response.ok) {
        const data = await response.json()
        return data.message?.content || null
      }
    } catch (e) {
      console.log('Ollama not available')
    }
    return null
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    let response = null
    
    try {
      response = await handleOllama()
    } catch (e) {
      console.log('AI error')
    }
    
    if (!response) {
      response = getSmartResponse(input)
    }
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }])
    setLoading(false)
  }

  if (!aiOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }} onClick={closeAI}>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '450px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>🤖 {t('aiAssistant')}</h3>
          <button onClick={closeAI} style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--text-light)',
            padding: '0',
            lineHeight: 1
          }}>✕</button>
        </div>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
              {t('askMeAnything')}
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              maxWidth: '85%',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--background)',
              color: msg.role === 'user' ? 'white' : 'var(--text)',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
              borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '12px'
            }}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              maxWidth: '85%',
              alignSelf: 'flex-start',
              backgroundColor: 'var(--background)',
              color: 'var(--text-light)'
            }}>
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '16px',
          borderTop: '1px solid var(--border)'
        }}>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder={t('askMeAnything')}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'var(--background)',
              color: 'var(--text)'
            }}
          />
          <button onClick={handleSend} className="btn btn-primary">{t('send')}</button>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user, t } = useApp()
  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('welcome')}, {user?.name}!</h1>
        <div className="grid grid-3">
          <Link to="/videos" className="card" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48 }}>🎬</div>
            <h3 className="mt-4">{t('videos')}</h3>
            <p className="video-meta">{t('watchVideos')}</p>
          </Link>
          <Link to="/quizzes" className="card" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48 }}>📝</div>
            <h3 className="mt-4">{t('quizzes')}</h3>
            <p className="video-meta">{t('testKnowledge')}</p>
          </Link>
          <Link to="/messages" className="card" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <h3 className="mt-4">{t('messages')}</h3>
            <p className="video-meta">{t('communicate')} {user?.role === 'TEACHER' ? t('students') : t('teachers')}</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
          <Route path="/videos" element={<ProtectedRoute><Navbar /><Videos /></ProtectedRoute>} />
          <Route path="/quizzes" element={<ProtectedRoute><Navbar /><Quizzes /></ProtectedRoute>} />
          <Route path="/quiz/:id" element={<ProtectedRoute><Navbar /><QuizDetail /></ProtectedRoute>} />
          <Route path="/quiz/:id/results" element={<ProtectedRoute><Navbar /><QuizDetail /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Navbar /><Messages /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Navbar /><Settings /></ProtectedRoute>} />
        </Routes>
        <AIAssistant />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
