import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import './App.css';
import LoginForm from './pages/Login/Login';
import ForgotPassword from './pages/Login/ForgotPassword';
import { UserDashboard } from './pages/Dashboard/User';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { SubUserDashboard } from './pages/Dashboard/subUser';
import ProtectedRoute from './routes/ProtectedRoute';
import { AdminAnalytics } from './pages/Admin/AdminAnalytics';
import { AdminMachine } from './pages/Admin/AdminMachine';
import { AdminUsers } from './pages/Admin/AdminUser';
import { AdminSetting } from './pages/Admin/AdminSetting';
import { UserProfile } from './pages/User/Userprofile';
import { AdminSolution } from './pages/Admin/AdminSolutions';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Anamoly } from './pages/User/Anamoly';
import { SolutionsPage } from './pages/User/SolutionsPage';
import { MachinesListPage } from './pages/User/MachinesListPage';
import { MachineDetailPage } from './pages/User/MachineDetailPage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<LoginForm />} />
          <Route path='/forgotPassword' element={<ForgotPassword />} />

          <Route
            path='/user/:userId'
            element={
              <ProtectedRoute>
                <Navigate to="solutions" replace />
              </ProtectedRoute>
            }
          />

          <Route path='/admin/:adminId'>
            <Route
              path='home'
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='users'
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path='solutions'
              element={
                <ProtectedRoute>
                  <AdminSolution />
                </ProtectedRoute>
              }
            />
            <Route
              path='machines'
              element={
                <ProtectedRoute>
                  <AdminMachine />
                </ProtectedRoute>
              }
            />
            <Route
              path='analytics'
              element={
                <ProtectedRoute>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path='settings'
              element={
                <ProtectedRoute>
                  <AdminSetting />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path='/sub-user/:subUserId/:userId'
            element={
              <ProtectedRoute>
                <SubUserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/user/:userId" >
            <Route
              path='home'
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='solutions'
              element={
                <ProtectedRoute>
                  <SolutionsPage />
                </ProtectedRoute>
              }
            />
            <Route path='solutions/:solution' element={
              <ProtectedRoute>
                <MachinesListPage />
              </ProtectedRoute>
            } />
            <Route path='solutions/:solution/:deviceName' element={
              <ProtectedRoute>
                <MachineDetailPage />
              </ProtectedRoute>
            } />
            <Route path='anamoly' element={
              <ProtectedRoute>
                <Anamoly/>
              </ProtectedRoute>
            } />
            {/* Legacy routes - keeping for backward compatibility */}
            <Route
              path='analytics'
              element={
                <ProtectedRoute>
                  <SolutionsPage />
                </ProtectedRoute>
              }
            />
            <Route path='analytics/:solution' element={<ProtectedRoute>
              <MachinesListPage />
            </ProtectedRoute>} />
            <Route path='analytics/:solution/:deviceName' element={<ProtectedRoute>
              <MachineDetailPage />
            </ProtectedRoute>} />
            <Route
              path='profile'
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path='machines'
              element={
                <ProtectedRoute>
                  <SolutionsPage />
                </ProtectedRoute>
              }
            />
            <Route path="machines/:solution" element={<ProtectedRoute><MachinesListPage /></ProtectedRoute>} />
            <Route path='machines/:solution/:Name' element={<ProtectedRoute>
              <MachineDetailPage />
            </ProtectedRoute>} />

          </Route>

        </Routes>
      </Router>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
