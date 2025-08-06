import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import LoginForm from './pages/Login/Login';
import { ForgotPassword } from './pages/Login/ForgotPassword';
import { UserDashboard } from './pages/Dashboard/User';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { SubUserDashboard } from './pages/Dashboard/subUser';
import ProtectedRoute from './routes/ProtectedRoute';
import { AdminAnalytics } from './pages/Admin/AdminAnalytics';
import { AdminMachine } from './pages/Admin/AdminMachine';
import { AdminUsers } from './pages/Admin/AdminUser';
import { AdminSetting } from './pages/Admin/AdminSetting';
import { UserProfile } from './pages/User/Userprofile';
import { UserMachines } from './pages/User/UserMachines';
import { AdminSolution } from './pages/Admin/AdminSolutions';
import { ToastContainer } from 'react-toastify';
import MachineView from './pages/User/MachineView';
import 'react-toastify/dist/ReactToastify.css';
import { MachineReadingAnalysis } from './pages/User/MachineReadingAnalysis';
import { UserAnalytics } from './pages/User/Analytics';
import { AnalysisMachineView } from './pages/User/AnalysisMachineView';
import { DataVisualiser } from './pages/User/MachineDataVisualizer';
import { Anamoly } from './pages/User/Anamoly';

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
                <UserDashboard />
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
              path='analytics'
              element={
                <ProtectedRoute>
                  <UserAnalytics />
                </ProtectedRoute>
              }
            />
            <Route path='anamoly' element={
              <ProtectedRoute>
                <Anamoly />
              </ProtectedRoute>
            } />
            <Route path='analytics/:solution' element={<ProtectedRoute>
              <AnalysisMachineView />
            </ProtectedRoute>} />
            <Route path='analytics/:solution/:deviceName' element={<ProtectedRoute>
              <DataVisualiser />
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
                  <UserMachines />
                </ProtectedRoute>
              }
            />
            <Route path="machines" element={<ProtectedRoute><UserMachines /></ProtectedRoute>} />

            <Route path="machines/:solution" element={<ProtectedRoute><MachineView /></ProtectedRoute>} />

            <Route path='machines/:solution/:deviceName' element={<ProtectedRoute>
              <MachineReadingAnalysis />
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
