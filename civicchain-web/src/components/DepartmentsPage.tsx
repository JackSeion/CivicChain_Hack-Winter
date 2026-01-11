import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ComplaintCard } from "./ComplaintCard";
import { ComplaintDetailsDialog } from "./ComplaintDetailsDialog";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import * as api from "../utils/api";

interface Complaint {
  id: number;
  category: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  votes: number;
  submittedDate: string;
  status: 'pending' | 'resolved' | 'verified';
  photo: string;
  resolutionImage?: string;
  resolutionImages?: string[];
  resolvedDate?: string;
  verificationCount?: number;
  daysPending?: number;
  resolvedByOfficer?: string;
  parentComplaintId?: number;
  departmentReferral?: string;
}

interface DepartmentsPageProps {
  complaints: Complaint[];
  onResolve: (id: number, imageUrl: string) => void;
  loading?: boolean;
  selectedComplaintId?: number | null;
  onLinkComplaint?: (complaint: Complaint) => void;
}

export function DepartmentsPage({ complaints, onResolve, loading, selectedComplaintId, onLinkComplaint }: DepartmentsPageProps) {
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-select complaint and category when selectedComplaintId changes
  useEffect(() => {
    if (selectedComplaintId && complaints.length > 0) {
      const complaint = complaints.find(c => c.id === selectedComplaintId);
      if (complaint) {
        setSelectedCategory(complaint.category);
        setSelectedComplaint(complaint);
      }
    }
  }, [selectedComplaintId, complaints]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCategoryComplaints = (categoryId: string, status?: string) => {
    return complaints.filter(c => {
      const matchesCategory = c.category === categoryId;
      if (status === 'pending') {
        return matchesCategory && c.status === 'pending';
      }
      if (status === 'resolved') {
        return matchesCategory && c.status === 'resolved';
      }
      if (status === 'verified') {
        return matchesCategory && c.status === 'verified';
      }
      return matchesCategory;
    });
  };

  const getCategoryStats = (categoryId: string) => {
    const total = getCategoryComplaints(categoryId).length;
    const pending = getCategoryComplaints(categoryId).filter(c => c.status === 'pending').length;
    const resolved = getCategoryComplaints(categoryId).filter(c => c.status === 'resolved').length;
    const verified = getCategoryComplaints(categoryId).filter(c => c.status === 'verified').length;
    return { total, pending, resolved, verified };
  };

  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    const pendingComplaints = getCategoryComplaints(selectedCategory, 'pending');
    const resolvedComplaints = getCategoryComplaints(selectedCategory, 'resolved');
    const verifiedComplaints = getCategoryComplaints(selectedCategory, 'verified');
    const stats = getCategoryStats(selectedCategory);

    return (
      <>
        <div className="p-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="mb-4 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
                <p className="text-gray-600 mt-1">View and manage complaints by status</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-gray-600 text-sm">Total Complaints</p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingComplaints.length}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-400 opacity-30" />
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{resolvedComplaints.length}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-blue-400 opacity-30" />
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Verified</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{verifiedComplaints.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400 opacity-30" />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="pending" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Clock className="w-4 h-4 mr-2" />
                Pending
                <Badge className="ml-2 bg-amber-100 text-amber-800 border-0">
                  {pendingComplaints.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolved" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Resolved
                <Badge className="ml-2 bg-blue-100 text-blue-800 border-0">
                  {resolvedComplaints.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="verified" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified
                <Badge className="ml-2 bg-green-100 text-green-800 border-0">
                  {verifiedComplaints.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {pendingComplaints.length > 0 ? (
                  pendingComplaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onResolve={onResolve}
                      onClick={setSelectedComplaint}
                      onLinkClick={onLinkComplaint}
                    />
                  ))
                ) : (
                  <Card className="p-12 text-center bg-gray-50">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No pending complaints</p>
                    <p className="text-gray-400 text-sm mt-1">All complaints in this category are being processed</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="mt-6">
              <div className="space-y-4">
                {resolvedComplaints.length > 0 ? (
                  resolvedComplaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onResolve={onResolve}
                      onClick={setSelectedComplaint}
                      onLinkClick={onLinkComplaint}
                    />
                  ))
                ) : (
                  <Card className="p-12 text-center bg-gray-50">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No resolved complaints</p>
                    <p className="text-gray-400 text-sm mt-1">Resolved complaints will appear here</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="verified" className="mt-6">
              <div className="space-y-4">
                {verifiedComplaints.length > 0 ? (
                  verifiedComplaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onResolve={onResolve}
                      onClick={setSelectedComplaint}
                      onLinkClick={onLinkComplaint}
                    />
                  ))
                ) : (
                  <Card className="p-12 text-center bg-gray-50">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No verified complaints</p>
                    <p className="text-gray-400 text-sm mt-1">Verified complaints will appear here</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <ComplaintDetailsDialog
          complaint={selectedComplaint}
          open={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      </>
    );
  }

  if (loadingCategories || loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Departments</h1>
        <p className="text-gray-600">Select a department to view and manage complaints by category</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const stats = getCategoryStats(category.id);
          const resolutionRate = stats.total > 0 ? Math.round(((stats.resolved + stats.verified) / stats.total) * 100) : 0;
          
          return (
            <Card
              key={category.id}
              className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1 border-0 bg-white"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                  <Badge variant="secondary" className="text-base px-3 py-1 font-semibold">
                    {stats.total}
                  </Badge>
                </div>
              </div>

              {/* Resolution Progress */}
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Resolution Rate</span>
                  <span className="text-sm font-bold text-blue-600">{resolutionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${resolutionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="font-bold text-amber-600">{stats.pending}</div>
                  <div className="text-xs text-gray-500 mt-1">Pending</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="font-bold text-blue-600">{stats.resolved}</div>
                  <div className="text-xs text-gray-500 mt-1">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="font-bold text-green-600">{stats.verified}</div>
                  <div className="text-xs text-gray-500 mt-1">Verified</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Complaint Details Dialog */}
      {selectedComplaint && (
        <ComplaintDetailsDialog
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          complaint={selectedComplaint}
        />
      )}
    </div>
  );
}
