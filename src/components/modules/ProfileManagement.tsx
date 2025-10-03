import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { useAuth } from '../../utils/auth';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Key,
  Edit, Camera, Save, X, Bell, Globe, Lock, Eye, EyeOff,
  Award, BookOpen, Clock, CheckCircle, AlertCircle,
  Settings, LogOut, Download, Upload
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  bio?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  dateOfBirth?: string;
  joinedDate: string;
  department?: string;
  designation?: string;
  qualifications?: string[];
  achievements?: string[];
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    twoFactorAuth: boolean;
    language: string;
    theme: string;
  };
}

export function ProfileManagement() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(75);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@school.edu',
    phone: '+91 9876543210',
    role: user?.role || 'teacher',
    avatar: user?.avatar,
    bio: 'Passionate educator with 10+ years of experience in teaching Mathematics and Science.',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    dateOfBirth: '1985-06-15',
    joinedDate: '2014-07-01',
    department: 'Science Department',
    designation: 'Senior Teacher',
    qualifications: ['M.Sc. Mathematics', 'B.Ed', 'CTET Qualified'],
    achievements: ['Best Teacher Award 2022', 'Published Research Paper on Educational Technology'],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      twoFactorAuth: false,
      language: 'English',
      theme: 'light'
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      principal: 'bg-purple-100 text-purple-800',
      teacher: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
      accountant: 'bg-yellow-100 text-yellow-800',
      librarian: 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const handleSaveProfile = () => {
    // API call to save profile
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    // API call to change password
    toast.success('Password changed successfully');
    setIsChangingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
        toast.success('Profile picture updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateProfileCompletion = () => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.bio,
      profile.address?.street,
      profile.dateOfBirth,
      profile.qualifications?.length > 0
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export Data
          </Button>
          {!isEditing ? (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveProfile}>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-primary/10">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-white text-3xl">
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <Badge className={getRoleBadgeColor(profile.role)}>
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </Badge>
                  <Badge variant="outline">
                    {profile.department}
                  </Badge>
                </div>
              </div>

              {isEditing ? (
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="min-h-[80px]"
                />
              ) : (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.address?.city}, {profile.address?.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="w-full md:w-48">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={profileCompletion} className="h-2" />
                    <p className="text-2xl font-bold text-center">{profileCompletion}%</p>
                    <p className="text-xs text-muted-foreground text-center">
                      {profileCompletion < 100 ? 'Complete your profile' : 'Profile complete!'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input
                    value={profile.designation}
                    onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Input
                    placeholder="Street"
                    value={profile.address?.street}
                    onChange={(e) => setProfile({
                      ...profile,
                      address: { ...profile.address!, street: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                  <Input
                    placeholder="City"
                    value={profile.address?.city}
                    onChange={(e) => setProfile({
                      ...profile,
                      address: { ...profile.address!, city: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                  <Input
                    placeholder="State"
                    value={profile.address?.state}
                    onChange={(e) => setProfile({
                      ...profile,
                      address: { ...profile.address!, state: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                  <Input
                    placeholder="Pincode"
                    value={profile.address?.pincode}
                    onChange={(e) => setProfile({
                      ...profile,
                      address: { ...profile.address!, pincode: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualifications & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.qualifications?.map((qual, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{qual}</span>
                    </div>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Add Qualification
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.achievements?.map((achievement, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{achievement}</span>
                    </div>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Add Achievement
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.preferences.twoFactorAuth}
                  onCheckedChange={(checked) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, twoFactorAuth: checked }
                  })}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4 mr-1" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Current Password</Label>
                          <Input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>New Password</Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                newPassword: e.target.value
                              })}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label>Confirm New Password</Label>
                          <Input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value
                            })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsChangingPassword(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleChangePassword}>
                            Update Password
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Recent Activity</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Login from Mumbai, India</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Profile updated</span>
                    <span className="text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Password changed</span>
                    <span className="text-muted-foreground">30 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.preferences.emailNotifications}
                  onCheckedChange={(checked) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, emailNotifications: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via SMS
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.preferences.smsNotifications}
                  onCheckedChange={(checked) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, smsNotifications: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive in-app notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.preferences.pushNotifications}
                  onCheckedChange={(checked) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, pushNotifications: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Language</Label>
                <Select
                  value={profile.preferences.language}
                  onValueChange={(value) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, language: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Marathi">Marathi</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Theme</Label>
                <Select
                  value={profile.preferences.theme}
                  onValueChange={(value) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, theme: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Account Data
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}