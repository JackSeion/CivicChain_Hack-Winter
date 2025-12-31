import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, ThumbsUp, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
}

interface ComplaintDetailsDialogProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

export function ComplaintDetailsDialog({ complaint, open, onClose }: ComplaintDetailsDialogProps) {
  if (!complaint) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <Clock className="w-4 h-4" />;
      case 'verified':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleSearchLocation = () => {
    const location = complaint.location?.trim();
    
    if (!location) {
      alert('Location information is not available for this complaint.');
      return;
    }
    
    const encodedLocation = encodeURIComponent(location);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    
    window.open(url, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">{complaint.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Metrics */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge className={`${getStatusColor(complaint.status)} flex items-center gap-1.5`}>
              {getStatusIcon(complaint.status)}
              {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
            </Badge>
            
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <ThumbsUp className="w-4 h-4" />
              <span>{complaint.votes} votes</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{complaint.daysPending} day{complaint.daysPending !== 1 ? 's' : ''} {complaint.status === 'verified' ? 'to resolve' : 'pending'}</span>
            </div>

            {complaint.verificationCount !== undefined && complaint.verificationCount > 0 && (
              <Badge className="bg-purple-100 text-purple-800">
                {complaint.verificationCount} citizen verification{complaint.verificationCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Images - Before/After for Resolved Complaints */}
          {(complaint.status === 'resolved' || complaint.status === 'verified') && 
           complaint.resolutionImages && 
           complaint.resolutionImages.length > 0 ? (
            <div>
              <h3 className="mb-3 flex items-center gap-2">
                📸 Before & After Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Image */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Before (Original Complaint)</p>
                  <div className="rounded-lg overflow-hidden border-2 border-red-200">
                    <div className="w-full h-80 bg-gray-100">
                      <ImageWithFallback
                        src={complaint.photo}
                        alt={complaint.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* After Image */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    After (Resolution {complaint.status === 'verified' ? '✓ Verified' : ''})
                  </p>
                  <div className={`rounded-lg overflow-hidden border-2 ${
                    complaint.status === 'verified' ? 'border-green-400' : 'border-blue-400'
                  }`}>
                    <div className="w-full h-80 bg-gray-100">
                      <ImageWithFallback
                        src={complaint.resolutionImages[0]}
                        alt="Resolution photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {complaint.resolutionImages.length > 1 && (
                <p className="text-sm text-gray-600 mt-2">
                  + {complaint.resolutionImages.length - 1} more resolution photo{complaint.resolutionImages.length - 1 !== 1 ? 's' : ''} available below
                </p>
              )}
            </div>
          ) : (
            <div>
              <h3 className="mb-3">Complaint Photo</h3>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <div className="w-full h-96 bg-gray-100">
                  <ImageWithFallback
                    src={complaint.photo}
                    alt={complaint.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
          </div>

          {/* Location */}
          <div>
            <h3 className="mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Location
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="text-gray-900">{complaint.location}</p>
              </div>
              {complaint.location && (
                <Button
                  onClick={handleSearchLocation}
                  size="sm"
                  className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MapPin className="w-4 h-4" />
                  Search Location
                </Button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">Complaint Submitted</p>
                  <p className="text-sm text-gray-600">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {formatDate(complaint.submittedDate)}
                  </p>
                </div>
              </div>

              {complaint.status === 'resolved' && complaint.resolvedDate && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Resolved by Officer</p>
                    <p className="text-sm text-gray-600">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {formatDate(complaint.resolvedDate)}
                    </p>
                    {complaint.resolvedByOfficer && (
                      <p className="text-sm text-gray-600">By: {complaint.resolvedByOfficer}</p>
                    )}
                    <p className="text-sm text-amber-600 mt-1">
                      Awaiting citizen verification
                    </p>
                  </div>
                </div>
              )}

              {complaint.status === 'verified' && complaint.resolvedDate && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Resolved by Officer</p>
                      <p className="text-sm text-gray-600">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(complaint.resolvedDate)}
                      </p>
                      {complaint.resolvedByOfficer && (
                        <p className="text-sm text-gray-600">By: {complaint.resolvedByOfficer}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Verified by Citizen</p>
                      
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Additional Resolution Images (if more than 1) */}
          {complaint.resolutionImages && complaint.resolutionImages.length > 1 && (
            <div>
              <h3 className="mb-3 text-green-700">
                Additional Resolution Photos
                <span className="ml-2 text-sm text-gray-600">({complaint.resolutionImages.length - 1} more)</span>
              </h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {complaint.resolutionImages.slice(1).map((imageUrl, index) => (
                  <div key={index} className="rounded-lg overflow-hidden border-2 border-green-200">
                    <div className="w-full h-56 bg-gray-100">
                      <ImageWithFallback
                        src={imageUrl}
                        alt={`Resolution photo ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Badge */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Category: <span className="text-gray-900">{complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Complaint ID: <span className="text-gray-900">#{complaint.id}</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
