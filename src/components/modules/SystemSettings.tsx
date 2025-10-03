import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { api } from '../../utils/api';
import {
  Settings, Save, RefreshCw,
  Users, Eye,
  Download, Trash2, AlertTriangle,
  CheckCircle, Activity, HardDrive,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface SchoolSettings {
  schoolName: string;
  schoolCode: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  principalName: string;
  principalEmail: string;
  establishedYear: string;
  affiliation: string;
  logo: string;
}

interface UserSettings {
  defaultRole: string;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
  accountLockoutDuration: number;
}

interface NotificationSettings {
  emailNotifications: {
    admissions: boolean;
    fees: boolean;
    attendance: boolean;
    exams: boolean;
    events: boolean;
  };
  smsNotifications: {
    attendance: boolean;
    fees: boolean;
    emergency: boolean;
  };
  pushNotifications: {
    announcements: boolean;
    reminders: boolean;
    alerts: boolean;
  };
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionPeriod: number;
  cloudStorage: boolean;
  storageProvider: string;
}

interface SystemInfo {
  version: string;
  lastUpdate: string;
  uptime: string;
  totalUsers: number;
  storageUsed: number;
  storageTotal: number;
  performance: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  service: string;
  status: 'active' | 'inactive';
  created_at: string;
  lastUsed?: string;
}


export function SystemSettings() {
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    schoolName: '',
    schoolCode: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    principalEmail: '',
    establishedYear: '',
    affiliation: '',
    logo: ''
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    defaultRole: 'student',
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expiryDays: 90
    },
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    accountLockoutDuration: 15
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: {
      admissions: true,
      fees: true,
      attendance: true,
      exams: true,
      events: true
    },
    smsNotifications: {
      attendance: true,
      fees: true,
      emergency: true
    },
    pushNotifications: {
      announcements: true,
      reminders: true,
      alerts: true
    }
  });

  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionPeriod: 30,
    cloudStorage: true,
    storageProvider: 'aws'
  });

  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    version: '2.1.0',
    lastUpdate: '2024-01-15',
    uptime: '15 days',
    totalUsers: 1250,
    storageUsed: 45.2,
    storageTotal: 100,
    performance: {
      cpu: 25,
      memory: 68,
      disk: 45
    }
  });

  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [
        schoolData,
        userSecurityData,
        notificationData,
        backupData,
        systemData,
        apiKeysData
      ] = await Promise.all([
        api.getSchoolSettings(),
        api.getUserSettings(),
        api.getNotificationSettings(),
        api.getBackupSettings(),
        api.getSystemInfo(),
        api.getAPIKeys()
      ]);

      setSchoolSettings(schoolData);
      setUserSettings(userSecurityData);
      setNotificationSettings(notificationData);
      setBackupSettings(backupData);
      setSystemInfo(systemData);
      setAPIKeys(apiKeysData);
    } catch (error) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveSchoolSettings = async () => {
    setSaving(true);
    try {
      await api.updateSchoolSettings(schoolSettings);
      toast.success('School settings saved successfully');
    } catch (error) {
      toast.error('Failed to save school settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const saveUserSettings = async () => {
    setSaving(true);
    try {
      await api.updateUserSettings(userSettings);
      toast.success('User security settings saved successfully');
    } catch (error) {
      toast.error('Failed to save user settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      await api.updateNotificationSettings(notificationSettings);
      toast.success('Notification settings saved successfully');
    } catch (error) {
      toast.error('Failed to save notification settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const saveBackupSettings = async () => {
    setSaving(true);
    try {
      await api.updateBackupSettings(backupSettings);
      toast.success('Backup settings saved successfully');
    } catch (error) {
      toast.error('Failed to save backup settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const createBackup = async () => {
    try {
      await api.createBackup();
      toast.success('Backup created successfully');
    } catch (error) {
      toast.error('Failed to create backup');
      console.error(error);
    }
  };

  const generateAPIKey = async (service: string) => {
    try {
      const newKey = await api.generateAPIKey(service);
      setAPIKeys([...apiKeys, newKey]);
      toast.success('API key generated successfully');
    } catch (error) {
      toast.error('Failed to generate API key');
      console.error(error);
    }
  };

  const revokeAPIKey = async (keyId: string) => {
    try {
      await api.revokeAPIKey(keyId);
      setAPIKeys(apiKeys.filter(key => key.id !== keyId));
      toast.success('API key revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke API key');
      console.error(error);
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-red-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };


  const getPerformanceBarColor = (value: number) => {
    if (value >= 80) return 'bg-red-600';
    if (value >= 60) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>System Settings</h1>
          <p className="text-muted-foreground">
            Configure system preferences and manage settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={createBackup}>
            <Download className="mr-2 h-4 w-4" />
            Create Backup
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold text-green-600">Online</p>
                <p className="text-xs text-muted-foreground">Uptime: {systemInfo.uptime}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="text-2xl font-bold">{systemInfo.version}</p>
                <p className="text-xs text-muted-foreground">Updated: {systemInfo.lastUpdate}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{systemInfo.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{systemInfo.storageUsed}GB</p>
                <p className="text-xs text-muted-foreground">of {systemInfo.storageTotal}GB</p>
              </div>
              <HardDrive className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={(systemInfo.storageUsed / systemInfo.storageTotal) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="school">School Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>


        <TabsContent value="school" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={schoolSettings.schoolName}
                    onChange={(e) => setSchoolSettings({...schoolSettings, schoolName: e.target.value})}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolCode">School Code</Label>
                  <Input
                    id="schoolCode"
                    value={schoolSettings.schoolCode}
                    onChange={(e) => setSchoolSettings({...schoolSettings, schoolCode: e.target.value})}
                    placeholder="Enter school code"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={schoolSettings.address}
                  onChange={(e) => setSchoolSettings({...schoolSettings, address: e.target.value})}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={schoolSettings.city}
                    onChange={(e) => setSchoolSettings({...schoolSettings, city: e.target.value})}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={schoolSettings.state}
                    onChange={(e) => setSchoolSettings({...schoolSettings, state: e.target.value})}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={schoolSettings.pincode}
                    onChange={(e) => setSchoolSettings({...schoolSettings, pincode: e.target.value})}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={schoolSettings.phone}
                    onChange={(e) => setSchoolSettings({...schoolSettings, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={schoolSettings.email}
                    onChange={(e) => setSchoolSettings({...schoolSettings, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={schoolSettings.website}
                    onChange={(e) => setSchoolSettings({...schoolSettings, website: e.target.value})}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="principalName">Principal Name</Label>
                  <Input
                    id="principalName"
                    value={schoolSettings.principalName}
                    onChange={(e) => setSchoolSettings({...schoolSettings, principalName: e.target.value})}
                    placeholder="Enter principal name"
                  />
                </div>
                <div>
                  <Label htmlFor="principalEmail">Principal Email</Label>
                  <Input
                    id="principalEmail"
                    type="email"
                    value={schoolSettings.principalEmail}
                    onChange={(e) => setSchoolSettings({...schoolSettings, principalEmail: e.target.value})}
                    placeholder="Enter principal email"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    value={schoolSettings.establishedYear}
                    onChange={(e) => setSchoolSettings({...schoolSettings, establishedYear: e.target.value})}
                    placeholder="Enter establishment year"
                  />
                </div>
                <div>
                  <Label htmlFor="affiliation">Affiliation</Label>
                  <Input
                    id="affiliation"
                    value={schoolSettings.affiliation}
                    onChange={(e) => setSchoolSettings({...schoolSettings, affiliation: e.target.value})}
                    placeholder="Enter board affiliation"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={saveSchoolSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save School Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="minLength">Minimum Password Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  value={userSettings.passwordPolicy.minLength}
                  onChange={(e) => setUserSettings({
                    ...userSettings,
                    passwordPolicy: {
                      ...userSettings.passwordPolicy,
                      minLength: parseInt(e.target.value)
                    }
                  })}
                  min="4"
                  max="50"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                  <Switch
                    id="requireUppercase"
                    checked={userSettings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked: boolean) => setUserSettings({
                      ...userSettings,
                      passwordPolicy: {
                        ...userSettings.passwordPolicy,
                        requireUppercase: checked
                      }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                  <Switch
                    id="requireLowercase"
                    checked={userSettings.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked: boolean) => setUserSettings({
                      ...userSettings,
                      passwordPolicy: {
                        ...userSettings.passwordPolicy,
                        requireLowercase: checked
                      }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireNumbers">Require Numbers</Label>
                  <Switch
                    id="requireNumbers"
                    checked={userSettings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked: boolean) => setUserSettings({
                      ...userSettings,
                      passwordPolicy: {
                        ...userSettings.passwordPolicy,
                        requireNumbers: checked
                      }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                  <Switch
                    id="requireSpecialChars"
                    checked={userSettings.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked: boolean) => setUserSettings({
                      ...userSettings,
                      passwordPolicy: {
                        ...userSettings.passwordPolicy,
                        requireSpecialChars: checked
                      }
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="expiryDays">Password Expiry (days)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  value={userSettings.passwordPolicy.expiryDays}
                  onChange={(e) => setUserSettings({
                    ...userSettings,
                    passwordPolicy: {
                      ...userSettings.passwordPolicy,
                      expiryDays: parseInt(e.target.value)
                    }
                  })}
                  min="30"
                  max="365"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={userSettings.sessionTimeout}
                  onChange={(e) => setUserSettings({...userSettings, sessionTimeout: parseInt(e.target.value)})}
                  min="5"
                  max="480"
                />
              </div>
              
              <div>
                <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={userSettings.maxLoginAttempts}
                  onChange={(e) => setUserSettings({...userSettings, maxLoginAttempts: parseInt(e.target.value)})}
                  min="3"
                  max="10"
                />
              </div>
              
              <div>
                <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  value={userSettings.accountLockoutDuration}
                  onChange={(e) => setUserSettings({...userSettings, accountLockoutDuration: parseInt(e.target.value)})}
                  min="5"
                  max="1440"
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={saveUserSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Security Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailAdmissions">Admission Notifications</Label>
                <Switch
                  id="emailAdmissions"
                  checked={notificationSettings.emailNotifications.admissions}
                  onCheckedChange={(checked: boolean) => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: {
                      ...notificationSettings.emailNotifications,
                      admissions: checked
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emailFees">Fee Notifications</Label>
                <Switch
                  id="emailFees"
                  checked={notificationSettings.emailNotifications.fees}
                  onCheckedChange={(checked: boolean) => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: {
                      ...notificationSettings.emailNotifications,
                      fees: checked
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emailAttendance">Attendance Notifications</Label>
                <Switch
                  id="emailAttendance"
                  checked={notificationSettings.emailNotifications.attendance}
                  onCheckedChange={(checked: boolean) => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: {
                      ...notificationSettings.emailNotifications,
                      attendance: checked
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emailExams">Exam Notifications</Label>
                <Switch
                  id="emailExams"
                  checked={notificationSettings.emailNotifications.exams}
                  onCheckedChange={(checked: boolean) => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: {
                      ...notificationSettings.emailNotifications,
                      exams: checked
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emailEvents">Event Notifications</Label>
                <Switch
                  id="emailEvents"
                  checked={notificationSettings.emailNotifications.events}
                  onCheckedChange={(checked: boolean) => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: {
                      ...notificationSettings.emailNotifications,
                      events: checked
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>SMS Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="smsAttendance">Attendance Alerts</Label>
                <Switch
                  id="smsAttendance"
                  checked={notificationSettings.smsNotifications.attendance}
                  onCheckedChange={(checked: boolean) => setNotificationSettings({
                    ...notificationSettings,
                    smsNotifications: {
                      ...notificationSettings.smsNotifications,
                      attendance: checked
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="smsFees">Fee Reminders</Label>
                <Switch
                  id="smsFees"
                  checked={notificationSettings.smsNotifications.fees}
                  onCheckedChange={(checked: boolean) => setNotificationSettings({
                    ...notificationSettings,
                    smsNotifications: {
                      ...notificationSettings.smsNotifications,
                      fees: checked
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="smsEmergency">Emergency Alerts</Label>
                <Switch
                  id="smsEmergency"
                  checked={notificationSettings.smsNotifications.emergency}
                  onCheckedChange={(checked: boolean) => setNotificationSettings({
                    ...notificationSettings,
                    smsNotifications: {
                      ...notificationSettings.smsNotifications,
                      emergency: checked
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="pt-4">
            <Button onClick={saveNotificationSettings} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoBackup">Enable Automatic Backup</Label>
                <Switch
                  id="autoBackup"
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked: boolean) => setBackupSettings({...backupSettings, autoBackup: checked})}
                />
              </div>
              
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select 
                  value={backupSettings.backupFrequency} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setBackupSettings({...backupSettings, backupFrequency: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="backupTime">Backup Time</Label>
                <Input
                  id="backupTime"
                  type="time"
                  value={backupSettings.backupTime}
                  onChange={(e) => setBackupSettings({...backupSettings, backupTime: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                <Input
                  id="retentionPeriod"
                  type="number"
                  value={backupSettings.retentionPeriod}
                  onChange={(e) => setBackupSettings({...backupSettings, retentionPeriod: parseInt(e.target.value)})}
                  min="7"
                  max="365"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="cloudStorage">Cloud Storage</Label>
                <Switch
                  id="cloudStorage"
                  checked={backupSettings.cloudStorage}
                  onCheckedChange={(checked: boolean) => setBackupSettings({...backupSettings, cloudStorage: checked})}
                />
              </div>
              
              {backupSettings.cloudStorage && (
                <div>
                  <Label htmlFor="storageProvider">Storage Provider</Label>
                  <Select 
                    value={backupSettings.storageProvider} 
                    onValueChange={(value: string) => setBackupSettings({...backupSettings, storageProvider: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="google">Google Cloud</SelectItem>
                      <SelectItem value="azure">Microsoft Azure</SelectItem>
                      <SelectItem value="dropbox">Dropbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="pt-4 flex gap-2">
                <Button onClick={saveBackupSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Backup Settings
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={createBackup}>
                  <Download className="mr-2 h-4 w-4" />
                  Create Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => generateAPIKey('general')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate New API Key
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{apiKey.name}</h4>
                          <Badge className={apiKey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {apiKey.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{apiKey.service}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                          {apiKey.lastUsed && (
                            <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => revokeAPIKey(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>CPU Usage</span>
                    <span className={`font-bold ${getPerformanceColor(systemInfo.performance.cpu)}`}>
                      {systemInfo.performance.cpu}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getPerformanceBarColor(systemInfo.performance.cpu)}`}
                      style={{ width: `${systemInfo.performance.cpu}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Memory Usage</span>
                    <span className={`font-bold ${getPerformanceColor(systemInfo.performance.memory)}`}>
                      {systemInfo.performance.memory}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getPerformanceBarColor(systemInfo.performance.memory)}`}
                      style={{ width: `${systemInfo.performance.memory}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Disk Usage</span>
                    <span className={`font-bold ${getPerformanceColor(systemInfo.performance.disk)}`}>
                      {systemInfo.performance.disk}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getPerformanceBarColor(systemInfo.performance.disk)}`}
                      style={{ width: `${systemInfo.performance.disk}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>System Version:</span>
                  <span className="font-medium">{systemInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span className="font-medium">{systemInfo.lastUpdate}</span>
                </div>
                <div className="flex justify-between">
                  <span>System Uptime:</span>
                  <span className="font-medium">{systemInfo.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Users:</span>
                  <span className="font-medium">{systemInfo.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Usage:</span>
                  <span className="font-medium">
                    {systemInfo.storageUsed}GB / {systemInfo.storageTotal}GB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    System maintenance actions may affect user access. Please schedule during off-hours.
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restart System
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Logs
                  </Button>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    System Diagnostics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}