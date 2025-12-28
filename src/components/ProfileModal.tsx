import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface ProfileModalProps {
  user: any;
  onClose: () => void;
  onUpdate: (profileData: any) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    fullName: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    zipCode: user.zip_code || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(profileData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-main border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            Update Profile
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-white">Full Name</Label>
            <Input
              id="fullName"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-white">Phone</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              placeholder="Enter your phone"
            />
          </div>
          
          <div>
            <Label htmlFor="address" className="text-white">Address</Label>
            <Input
              id="address"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              placeholder="Enter your address"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-white">City</Label>
              <Input
                id="city"
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                placeholder="City"
              />
            </div>
            
            <div>
              <Label htmlFor="zipCode" className="text-white">ZIP Code</Label>
              <Input
                id="zipCode"
                value={profileData.zipCode}
                onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                placeholder="ZIP"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-purple hover:bg-gradient-pink text-white"
            >
              Update Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
