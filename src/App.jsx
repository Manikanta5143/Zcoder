import React, { useState, useEffect } from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import useLocalStorage from 'use-local-storage'
import Profile from './pages/ProfilePage/Profile'
import Home from './pages/Home/Home'
import Login from './pages/LoginPage/Login'
import Nav from './components/Nav/Nav'
import Signup from './pages/SignupPage/Signup'
import Footer from './components/Footer/Footer'
import Toggle from './components/Toggle/Toggle'
// import RequireAuth from './components/RequireAuth'
import Contests from './pages/ContestPage/Contests'
import Questions from './pages/PracticePage/Questions'
import ProblemStatement from './pages/PracticePage/ProblemStatement'
import Bookmarks from './pages/BookmarksPage/Bookmarks'
import BookmarkedSolutions from './pages/BookmarksPage/BookmarkedSolutions'
import Submissions from './pages/SubmissionsPage/Submissions'
import SubmittedSolutions from './pages/SubmissionsPage/SubmittedSolutions'
import './App.css'
import { useAuthContext } from './hooks/useAuthContext'
import ChatPage from './pages/ChatPage'
import UserList from './components/Chat/UserList'
import GroupList from './components/Chat/GroupList'
import EmailVerified from './pages/EmailVerified/EmailVerified'
import VerificationEmailSent from './pages/VerificationEmailSent/VerificationEmailSent'

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
        <Route path='/login' element={<Login/>}/> 
        <Route path='/signup' element={<Signup />}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/chat' element={<ChatPage/>}/>
        <Route path="/email-verified" element={<EmailVerified/>}/>
        <Route path="/verification-email-sent" element={<VerificationEmailSent/>}/>
      </Routes>
      
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

