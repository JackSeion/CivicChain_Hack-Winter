import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building2, Shield, ChevronRight, Lock, Loader2 } from "lucide-react";
import * as api from "../utils/api";

interface LoginPageProps {
  onMunicipalLogin: (municipalId: string, municipalName: string, stateId: string, stateName: string) => void;
  onStateLogin: (stateId: string, stateName: string) => void;
}

export function LoginPage({ onMunicipalLogin, onStateLogin }: LoginPageProps) {
  const [loginType, setLoginType] = useState<'municipal' | 'state' | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedMunicipal, setSelectedMunicipal] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<api.State[]>([]);
  const [municipals, setMunicipals] = useState<api.Municipal[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingMunicipals, setLoadingMunicipals] = useState(false);

  // Load states when municipal or state login is selected
  useEffect(() => {
    if (loginType === 'municipal' || loginType === 'state') {
      loadStates();
    }
  }, [loginType]);

  // Load municipals when state is selected for municipal login
  useEffect(() => {
    if (selectedState && loginType === 'municipal') {
      loadMunicipals(selectedState);
    }
  }, [selectedState, loginType]);

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const data = await api.getStates();
      setStates(data);
    } catch (error) {
      console.error('Error loading states:', error);
      setError('Failed to load states. Please try again.');
    } finally {
      setLoadingStates(false);
    }
  };

  const loadMunicipals = async (stateId: string) => {
    try {
      setLoadingMunicipals(true);
      const data = await api.getMunicipalsByState(stateId);
      setMunicipals(data);
    } catch (error) {
      console.error('Error loading municipals:', error);
      setError('Failed to load municipal corporations. Please try again.');
    } finally {
      setLoadingMunicipals(false);
    }
  };

  const handleMunicipalLogin = () => {
    setLoginType('municipal');
    setError("");
    loadStates();
  };

  const handleStateLogin = () => {
    setLoginType('state');
    setError("");
    loadStates();
    setSelectedMunicipal("");
  };

  const handleBack = () => {
    setLoginType(null);
    setSelectedState("");
    setSelectedMunicipal("");
    setPassword("");
    setError("");
    setMunicipals([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginType === 'state') {
      if (!selectedState || !password) {
        setError("Please fill in all fields");
        return;
      }

      const stateData = states.find((s) => s.id === selectedState);
      if (!stateData) {
        setError("Please select a valid state");
        return;
      }

      setLoading(true);
      setError("");

      // Demo-only credential check to keep flow consistent with municipal login
      const expectedPassword = `${selectedState}123`;
      if (password !== expectedPassword) {
        setError(`Invalid credentials. For demo use password ${expectedPassword}`);
        setPassword("");
        setLoading(false);
        return;
      }

      onStateLogin(stateData.id, stateData.name);
      setLoading(false);
      return;
    }

    if (!selectedState || !selectedMunicipal || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await api.loginMunicipal(selectedMunicipal, password);
      
      if (result.success) {
        const stateData = states.find(s => s.id === selectedState);
        if (stateData) {
          localStorage.setItem('selectedStateId', stateData.id);
          localStorage.setItem('selectedStateName', stateData.name);
          onMunicipalLogin(result.municipal.id, result.municipal.name, stateData.id, stateData.name);
        } else {
          setError('Unable to identify selected state. Please try again.');
        }
      } else {
        setError(result.message || "Invalid credentials. Please try again.");
        setPassword("");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed. Please check your credentials and try again.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  // Municipal Login Screen
  if (loginType === 'municipal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700 text-sm mb-4 flex items-center gap-1"
          >
            ← Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2">Municipal Login</h1>
            <p className="text-gray-600">Select your state and municipal corporation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="state">Select State</Label>
              <Select 
                value={selectedState} 
                onValueChange={(value) => {
                  setSelectedState(value);
                  setSelectedMunicipal("");
                  setError("");
                }}
                disabled={loadingStates}
              >
                <SelectTrigger id="state">
                  {loadingStates ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading states...
                    </span>
                  ) : (
                    <SelectValue placeholder="Choose your state" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedState && (
              <div className="space-y-2">
                <Label htmlFor="municipal">Select Municipal Corporation</Label>
                <Select 
                  value={selectedMunicipal} 
                  onValueChange={(value) => {
                    setSelectedMunicipal(value);
                    setError("");
                  }}
                  disabled={loadingMunicipals}
                >
                  <SelectTrigger id="municipal">
                    {loadingMunicipals ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading municipals...
                      </span>
                    ) : (
                      <SelectValue placeholder="Choose your municipal corporation" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {municipals.map((municipal) => (
                      <SelectItem key={municipal.id} value={municipal.id}>
                        {municipal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedMunicipal && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <p className="font-semibold mb-1">Demo Credentials:</p>
                  <p>Password: {selectedMunicipal}123</p>
                  <p className="text-blue-600 mt-1">Example: mumbai123, pune123, blr123</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              disabled={!selectedState || !selectedMunicipal || !password || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login to Dashboard
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
            <p>Authorized Personnel Only</p>
          </div>
        </Card>
      </div>
    );
  }

  // State Login Screen
  if (loginType === 'state') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700 text-sm mb-4 flex items-center gap-1"
          >
            ← Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2">State Login</h1>
            <p className="text-gray-600">Access state oversight dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="state">Select State</Label>
              <Select 
                value={selectedState} 
                onValueChange={(value) => {
                  setSelectedState(value);
                  setError("");
                }}
                disabled={loadingStates}
              >
                <SelectTrigger id="state">
                  {loadingStates ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading states...
                    </span>
                  ) : (
                    <SelectValue placeholder="Choose your state" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedState && (
              <div className="space-y-2">
                <Label htmlFor="state-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="state-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800">
                  <p className="font-semibold mb-1">Demo Credentials:</p>
                  <p>Password: {selectedState}123</p>
                  <p className="text-purple-700 mt-1">Example: maharashtra123</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={!selectedState || !password || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login to State Dashboard
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
            <p>Authorized State Officials Only</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2">Smart Citizen Complaint System</h1>
          <p className="text-gray-600">Municipal Dashboard Login</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleMunicipalLogin}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700"
          >
            <Building2 className="mr-2 h-5 w-5" />
            Municipal Login
            <ChevronRight className="ml-auto h-5 w-5" />
          </Button>

          <Button
            onClick={handleStateLogin}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Shield className="mr-2 h-5 w-5" />
            State Login
            <ChevronRight className="ml-auto h-5 w-5" />
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>Authorized Personnel Only</p>
        </div>
      </Card>
    </div>
  );
}