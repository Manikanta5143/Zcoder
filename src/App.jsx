import React, { useState, useEffect, Suspense } from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import useLocalStorage from 'use-local-storage'
import Home from './pages/Home/Home'
import Login from './pages/LoginPage/Login'
import Nav from './components/Nav/Nav'
import Signup from './pages/SignupPage/Signup'
import Footer from './components/Footer/Footer'
import Toggle from './components/Toggle/Toggle'
// import RequireAuth from './components/RequireAuth'
import Contests from './pages/ContestPage/Contests'
import BookmarkedSolutions from './pages/BookmarksPage/BookmarkedSolutions'
import SubmittedSolutions from './pages/SubmissionsPage/SubmittedSolutions'

// Lazy-loaded pages for optimized bundle size and rendering speed
const Profile = React.lazy(() => import('./pages/ProfilePage/Profile'));
const Questions = React.lazy(() => import('./pages/PracticePage/Questions'));
const ProblemStatement = React.lazy(() => import('./pages/PracticePage/ProblemStatement'));
const Bookmarks = React.lazy(() => import('./pages/BookmarksPage/Bookmarks'));
const Submissions = React.lazy(() => import('./pages/SubmissionsPage/Submissions'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const EmailVerified = React.lazy(() => import('./pages/EmailVerified/EmailVerified'));
const VerificationEmailSent = React.lazy(() => import('./pages/VerificationEmailSent/VerificationEmailSent'));
const SubmissionDetails = React.lazy(() => import('./pages/SubmissionsPage/SubmissionDetails'));
const Leaderboard = React.lazy(() => import('./pages/LeaderboardPage/Leaderboard'));

import './App.css'
import { useAuthContext } from './hooks/useAuthContext'
import UserList from './components/Chat/UserList'
import GroupList from './components/Chat/GroupList'

const mockUsers = ['alice', 'bob', 'charlie', 'dave']
const mockGroups = [
  { id: 'general', name: 'General' },
  { id: 'devs', name: 'Developers' }
]

const App = () => {
  const { user, isAuthenticated } = useAuthContext()
  const [isLight,setIsLight] = useLocalStorage("isLight",false)
  const [chatPartner, setChatPartner] = useState(null)
  const [group, setGroup] = useState(null)

  // Reset chat state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setChatPartner(null)
      setGroup(null)
    }
  }, [isAuthenticated])

  const toggleTheme = () => {
    setIsLight(!isLight)
  }

  return (
    <BrowserRouter>
    {/* cutom id-preferences for app */}
      <div className="App" data-theme={isLight ? "light" : "dark"} >
      <Toggle handleChange = {toggleTheme} isChecked ={isLight}/>
      <Nav/>
      
      <Suspense fallback={<div className="loading">Loading page...</div>}>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/contests' element={<Contests/>}/>
          <Route path='/practice' element={<Questions/>}/>
          <Route path='/practice/:titleSlug' element={<ProblemStatement/>}/>
          <Route path='/bookmarks' element={<Bookmarks/>}/>
          <Route path='/bookmarks/:titleSlug' element={<BookmarkedSolutions/>}/>
          {/* <RequireAuth path='/bookmarks/:titleSlug' element={Bookmarks} isAuthenticated={isAuthenticated}/> */}
          <Route path='/submissions' element={<Submissions/>}/>
          <Route path='/submissions/:titleSlug' element={<SubmittedSolutions/>}/>
          <Route path='/submission/:submissionId' element={<SubmissionDetails/>}/>
          <Route path='/leaderboard' element={<Leaderboard/>}/>
          <Route path='/login' element={<Login/>}/> 
          <Route path='/signup' element={<Signup />}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/chat' element={<ChatPage/>}/>
          <Route path="/email-verified" element={<EmailVerified/>}/>
          <Route path="/verification-email-sent" element={<VerificationEmailSent/>}/>
        </Routes>
      </Suspense>
      
      {/* Remove always-visible chat UI. Chat is now only accessible via /chat route. */}
      {/*
      {isAuthenticated && user && (
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <UserList users={mockUsers} onSelectUser={u => { setChatPartner(u); setGroup(null); }} currentUser={user.username} />
            <GroupList groups={mockGroups} onSelectGroup={g => { setGroup(g); setChatPartner(null); }} />
          </div>
          <div>
            {chatPartner && (
              <Chat currentUser={user.username} chatPartner={chatPartner} isGroup={false} />
            )}
            {group && (
              <Chat currentUser={user.username} groupId={group.id} isGroup={true} />
            )}
            {!chatPartner && !group && <div>Select a user or group to chat.</div>}
          </div>
        </div>
      )}
      */}
      
        <Footer />
         
        
        
      </div>
    
    </BrowserRouter>
  
  )
}

export default App

