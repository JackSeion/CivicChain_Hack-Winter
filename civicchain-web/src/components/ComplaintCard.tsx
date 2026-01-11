import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, ThumbsUp, Calendar, CheckCircle, Users, Link2, Building2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ResolveDialog } from "./ResolveDialog";

interface Complaint {
  id: number | string;
  category: string;
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
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
  createdBy?: string;
}

interface ComplaintCardProps {
  complaint: Complaint;
  onResolve: (id: number | string, imageUrl: string) => void;
  onClick: (complaint: Complaint) => void;
  onLinkClick?: (complaint: Complaint) => void;
}

export function ComplaintCard({ complaint, onResolve, onClick, onLinkClick }: ComplaintCardProps) {
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const statusConfig = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
    resolved: { label: 'Resolved', className: 'bg-blue-100 text-blue-800' },
    verified: { label: 'Verified', className: 'bg-green-100 text-green-800' },
  };

  const status = statusConfig[complaint.status];
  const date = new Date(complaint.submittedDate);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const resolvedDate = complaint.resolvedDate ? new Date(complaint.resolvedDate) : null;
  const formattedResolvedDate = resolvedDate?.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const handleResolveClick = () => {
    setShowResolveDialog(true);
  };

  const handleResolveSubmit = (imageUrl: string) => {
    onResolve(complaint.id, imageUrl);
  };

  const handleSearchLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const location = complaint.location?.trim();
    
    if (!location) {
      alert('Location information is not available for this complaint.');
      return;
    }
    
    const encodedLocation = encodeURIComponent(location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    
    window.open(mapsUrl, '_blank');
  };

  // Flags for conditional styling
  const isDepartment = (complaint.createdBy === 'department' || (complaint as any).created_by === 'department');
  const isLinked = Boolean(complaint.parentComplaintId || (complaint as any).parent_complaint_id);
  // Try to derive referring department name from title suffix: " - {Dept} Review"
  let referringDept: string | null = null;
  if (isDepartment && typeof complaint.title === 'string') {
    const match = complaint.title.match(/\s-\s(.+?)\sReview$/);
    referringDept = match?.[1] || null;
  }

  return (
    <>
      <Card 
        id={`complaint-${complaint.id}`}
        className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer border-2 ${
          isDepartment
            ? 'border-blue-500 hover:border-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50'
            : isLinked
              ? 'border-amber-400 hover:border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50'
              : 'hover:border-blue-300'
        }`}
        onClick={() => onClick(complaint)}
      >
        {/* Left accent bar for department-created complaints */}
        {isDepartment && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
        <div className="flex flex-col md:flex-row relative">
          {/* Images Section - Complaint + Resolution */}
          <div className={`${
            (complaint.status === 'resolved' || complaint.status === 'verified') && 
            complaint.resolutionImages && 
            complaint.resolutionImages.length > 0 
              ? 'md:w-96' 
              : 'md:w-64'
          } w-full flex-shrink-0`}>
            <div className={`grid ${
              (complaint.status === 'resolved' || complaint.status === 'verified') && 
              complaint.resolutionImages && 
              complaint.resolutionImages.length > 0 
                ? 'grid-cols-2' 
                : 'grid-cols-1'
            } gap-2 p-2 bg-gray-50`}>
              {/* Original Complaint Image */}
              <div className="h-56 bg-gray-200 relative group overflow-hidden rounded">
                <ImageWithFallback
                  src={complaint.photo}
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-blue-600 text-white text-xs">
                    Original
                  </Badge>
                </div>
              </div>

              {/* Resolution Image (if resolved or verified) */}
              {(complaint.status === 'resolved' || complaint.status === 'verified') && 
               complaint.resolutionImages && 
               complaint.resolutionImages.length > 0 && (
                <div className={`h-56 bg-gray-200 relative group overflow-hidden rounded border-2 ${
                  complaint.status === 'verified' 
                    ? 'border-green-400' 
                    : 'border-blue-400'
                }`}>
                  <ImageWithFallback
                    src={complaint.resolutionImages[0]}
                    alt="Resolution photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={`${
                      complaint.status === 'verified' 
                        ? 'bg-green-600' 
                        : 'bg-blue-600'
                    } text-white text-xs`}>
                      ✓ Resolved
                    </Badge>
                  </div>
                  {complaint.resolutionImages.length > 1 && (
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-black bg-opacity-70 text-white text-xs">
                        +{complaint.resolutionImages.length - 1} more
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-4">
                <h3 className="mb-2">{complaint.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                {isDepartment && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {referringDept ? `Referred from ${referringDept}` : 'Department Task'}
                    </Badge>
                  </div>
                )}
                {!isDepartment && isLinked && (
                  <Badge className="bg-amber-100 text-amber-800">Linked Complaint</Badge>
                )}
              </div>
              <Badge className={status.className}>
                {status.label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm block truncate">{complaint.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <ThumbsUp className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{complaint.votes} votes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{formattedDate}</span>
              </div>
              {complaint.verificationCount !== undefined && complaint.verificationCount > 0 && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{complaint.verificationCount} verifications</span>
                </div>
              )}
            </div>

            {/* Resolution Info */}
            {(complaint.status === 'resolved' || complaint.status === 'verified') && complaint.resolvedDate && (
              <div className={`mb-4 p-3 rounded-lg ${
                complaint.status === 'verified' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className={`flex items-center gap-2 ${
                  complaint.status === 'verified' ? 'text-green-800' : 'text-blue-800'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Resolved on {formattedResolvedDate}</span>
                </div>
                {complaint.status === 'verified' && (
                  <p className="text-xs text-green-700 mt-1">
                    ✓ Verified by {complaint.verificationCount} citizens
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
              {complaint.location && (
                <Button
                  onClick={handleSearchLocation}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Search Location
                </Button>
              )}
              {complaint.status === 'pending' && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResolveClick();
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Resolved
                </Button>
              )}
              {complaint.status === 'pending' && onLinkClick && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLinkClick(complaint);
                  }}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Link to Department
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <ResolveDialog
        open={showResolveDialog}
        onClose={() => setShowResolveDialog(false)}
        onResolve={handleResolveSubmit}
        complaintTitle={complaint.title}
      />
    </>
  );
}
