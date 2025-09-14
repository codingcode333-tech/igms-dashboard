import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { 
  UserIcon, 
  LockClosedIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import httpService from "@/services/httpService";
import axios from "axios";
import { login, setUser } from "@/context/UserContext";
import { ToastContainer, toast } from "react-toastify";

export function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      toast("Invalid credentials!", {
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/3 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/2 rounded-full"></div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              IGMS Portal
            </h1>
            <p className="text-xl text-blue-100 font-light">
              Intelligent Grievance Management System
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-blue-200 text-sm">
                <ChartBarIcon className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
              <div className="flex items-center gap-1 text-blue-200 text-sm">
                <CogIcon className="w-4 h-4" />
                <span>Smart Analytics</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Information */}
            <div className="hidden md:block space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Advanced Grievance Management
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <h3 className="text-white font-medium">Real-time Processing</h3>
                      <p className="text-blue-100 text-sm">
                        Instant grievance categorization and priority assessment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <h3 className="text-white font-medium">AI-Driven Insights</h3>
                      <p className="text-blue-100 text-sm">
                        Machine learning powered analytics and recommendations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h3 className="text-white font-medium">Comprehensive Dashboard</h3>
                      <p className="text-blue-100 text-sm">
                        Complete overview with interactive visualizations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full">
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-white/20">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-8 rounded-t-xl">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <ArrowRightOnRectangleIcon className="w-8 h-8" />
                    <Typography variant="h4" className="font-bold">
                      Sign In
                    </Typography>
                  </div>
                  <Typography variant="small" className="opacity-90">
                    Access your dashboard to manage grievances
                  </Typography>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                  <CardBody className="p-8 space-y-6">
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Username
                      </Typography>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          size="lg"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.toLowerCase())}
                          className="pl-10 !border-gray-300 focus:!border-blue-500"
                          labelProps={{
                            className: "hidden",
                          }}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Password
                      </Typography>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="password"
                          size="lg"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 !border-gray-300 focus:!border-blue-500"
                          labelProps={{
                            className: "hidden",
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Checkbox
                          id="remember"
                          ripple={false}
                          className="h-3 w-3 rounded-sm border-gray-900/20 bg-gray-900/10 transition-all hover:scale-105 hover:before:opacity-0"
                        />
                        <Typography
                          variant="small"
                          color="gray"
                          className="ml-2 font-normal"
                        >
                          Remember me
                        </Typography>
                      </div>
                      <Typography
                        variant="small"
                        color="blue"
                        className="font-medium cursor-pointer hover:underline"
                      >
                        Forgot Password?
                      </Typography>
                    </div>
                  </CardBody>

                  <CardFooter className="pt-0 px-8 pb-8">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Signing In...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          Sign In to Dashboard
                        </div>
                      )}
                    </Button>

                    {/* Hidden demo credentials - kept for functionality but not displayed */}
                    <div className="hidden">
                      Demo Mode: Use admin / admin to login
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <Typography variant="small" className="text-blue-200">
              © 2024 IGMS Portal. Powered by AI & Machine Learning.
            </Typography>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default SignIn;
