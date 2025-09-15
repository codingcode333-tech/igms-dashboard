import React from 'react';
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter,
  Typography,
  Button,
  Card,
  CardBody,
  Chip
} from "@material-tailwind/react";
import { XMarkIcon, UserIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { stringDate } from "@/helpers/date";
import { useTheme } from "@/context";

export function CDISModal({ isOpen, onClose, grievanceData }) {
  const { isDark } = useTheme();

  if (!grievanceData) return null;

  const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value || value === 'Address not available' || value === 'Email not available' || value === 'Phone not available') {
      return null;
    }
    
    return (
      <div className="flex items-start gap-3 mb-4">
        <Icon className={`h-5 w-5 mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'} flex-shrink-0`} />
        <div className="flex-1">
          <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            {label}
          </Typography>
          <Typography variant="small" className={isDark ? 'text-white' : 'text-gray-900'}>
            {value}
          </Typography>
        </div>
      </div>
    );
  };

  return (
    <Dialog 
      open={isOpen} 
      handler={onClose}
      size="lg"
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl`}
    >
      <DialogHeader className={`${isDark ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'} border-b flex items-center justify-between p-6`}>
        <div>
          <Typography variant="h4" className={isDark ? 'text-white' : 'text-gray-900'}>
            Grievance Details
          </Typography>
          <Typography variant="small" className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Registration No: {grievanceData.registration_no}
          </Typography>
        </div>
        <Button 
          variant="text" 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </DialogHeader>

      <DialogBody className="p-6 max-h-[70vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Status and Ministry */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Chip 
              value={grievanceData.status || 'Active'} 
              color={grievanceData.closing_date ? 'green' : 'blue'}
              className="text-xs"
            />
            <Chip 
              value={grievanceData.ministry || 'DOCAF'} 
              variant="filled"
              className="text-xs"
            />
            {grievanceData.recvd_date && (
              <Chip 
                value={stringDate(grievanceData.recvd_date)} 
                variant="filled"
                color="gray"
                className="text-xs"
              />
            )}
          </div>

          {/* Personal Information */}
          <Card className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
            <CardBody className="p-4">
              <Typography variant="h6" className={`${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                <UserIcon className="h-5 w-5" />
                Complainant Information
              </Typography>
              
              <InfoRow 
                icon={UserIcon} 
                label="Name" 
                value={grievanceData.name} 
              />
              
              <InfoRow 
                icon={MapPinIcon} 
                label="Location" 
                value={`${grievanceData.district}, ${grievanceData.state}`} 
              />
              
              <InfoRow 
                icon={EnvelopeIcon} 
                label="Email" 
                value={grievanceData.emailaddr !== 'Email not available' ? grievanceData.emailaddr : null} 
              />
              
              <InfoRow 
                icon={PhoneIcon} 
                label="Phone" 
                value={grievanceData.mobile_no !== 'Phone not available' ? grievanceData.mobile_no : null} 
              />
            </CardBody>
          </Card>

          {/* Complaint Details */}
          <Card className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
            <CardBody className="p-4">
              <Typography variant="h6" className={`${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                <DocumentTextIcon className="h-5 w-5" />
                Complaint Details
              </Typography>
              
              <Typography variant="small" className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                {grievanceData.subject_content || 'No details available'}
              </Typography>
            </CardBody>
          </Card>

          {/* Additional Information */}
          {(grievanceData.closing_date || grievanceData.originalData) && (
            <Card className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
              <CardBody className="p-4">
                <Typography variant="h6" className={`${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Additional Information
                </Typography>
                
                {grievanceData.closing_date && (
                  <InfoRow 
                    icon={DocumentTextIcon} 
                    label="Closing Date" 
                    value={stringDate(grievanceData.closing_date)} 
                  />
                )}
                
                {grievanceData.originalData?.source && (
                  <InfoRow 
                    icon={DocumentTextIcon} 
                    label="Source" 
                    value={grievanceData.originalData.source} 
                  />
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </DialogBody>

      <DialogFooter className={`${isDark ? 'border-gray-700' : 'border-gray-200'} border-t p-6`}>
        <Button 
          onClick={onClose}
          className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default CDISModal;