import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { api } from '../../utils/api';
import { 
  Plus, Search, Eye, Edit, Trash2, Download, Upload,
  RefreshCw, Filter, Award, FileText, Printer, Settings,
  Copy, Share2, CheckCircle, Clock, AlertTriangle,
  Calendar, Users, GraduationCap, Medal, FileCheck,
  Stamp, Signature, Image as ImageIcon, Layout
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CertificateTemplate {
  id: string;
  name: string;
  type: 'academic' | 'participation' | 'achievement' | 'completion' | 'merit' | 'appreciation';
  category: string;
  description: string;
  templateData: {
    layout: 'portrait' | 'landscape';
    backgroundColor: string;
    backgroundImage?: string;
    borderStyle: string;
    borderColor: string;
    titleFont: string;
    contentFont: string;
    titleSize: number;
    contentSize: number;
    logoPosition: 'top-left' | 'top-center' | 'top-right';
    signaturePositions: SignaturePosition[];
    customFields: CustomField[];
  };
  isActive: boolean;
  usageCount: number;
  created_at: string;
}

interface SignaturePosition {
  id: string;
  label: string;
  position: 'bottom-left' | 'bottom-center' | 'bottom-right';
  signatureImage?: string;
}

interface CustomField {
  id: string;
  fieldName: string;
  fieldType: 'text' | 'date' | 'number' | 'image';
  isRequired: boolean;
  defaultValue?: string;
  position: { x: number; y: number };
}

interface Certificate {
  id: string;
  certificateNumber: string;
  templateId: string;
  templateName: string;
  recipientType: 'student' | 'staff' | 'external';
  recipientId?: string;
  recipientName: string;
  recipientDetails: {
    class?: string;
    rollNumber?: string;
    department?: string;
    designation?: string;
    email?: string;
    phone?: string;
  };
  certificateData: {
    title: string;
    content: string;
    achievementDate: string;
    issueDate: string;
    validUntil?: string;
    grades?: string;
    remarks?: string;
    customFields: { [key: string]: any };
  };
  issuedBy: string;
  issuedByDesignation: string;
  approvedBy?: string;
  approvedByDesignation?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'issued' | 'revoked';
  generatedPDF?: string;
  qrCode?: string;
  digitalSignature?: string;
  created_at: string;
}

interface CertificateBatch {
  id: string;
  batchName: string;
  templateId: string;
  templateName: string;
  recipientType: 'student' | 'staff';
  filterCriteria: {
    classes?: string[];
    departments?: string[];
    minGrade?: number;
    dateRange?: { from: string; to: string };
  };
  totalRecipients: number;
  generatedCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdBy: string;
  created_at: string;
}

interface CertificateStats {
  totalCertificates: number;
  issuedThisMonth: number;
  pendingApproval: number;
  templatesActive: number;
  batchesCompleted: number;
  mostUsedTemplate: string;
  recentIssues: number;
  digitalVerifications: number;
}

export function CertificateManagement() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [batches, setBatches] = useState<CertificateBatch[]>([]);
  const [stats, setStats] = useState<CertificateStats>({
    totalCertificates: 0,
    issuedThisMonth: 0,
    pendingApproval: 0,
    templatesActive: 0,
    batchesCompleted: 0,
    mostUsedTemplate: '',
    recentIssues: 0,
    digitalVerifications: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [isIssueCertificateDialogOpen, setIsIssueCertificateDialogOpen] = useState(false);
  const [isBatchGenerateDialogOpen, setIsBatchGenerateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'academic',
    category: '',
    description: '',
    layout: 'portrait',
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
    borderColor: '#000000',
    titleFont: 'Arial',
    contentFont: 'Arial',
    titleSize: 24,
    contentSize: 14,
    logoPosition: 'top-center'
  });

  const [newCertificate, setNewCertificate] = useState({
    templateId: '',
    recipientType: 'student',
    recipientName: '',
    recipientId: '',
    class: '',
    rollNumber: '',
    department: '',
    designation: '',
    email: '',
    phone: '',
    title: '',
    content: '',
    achievementDate: '',
    grades: '',
    remarks: ''
  });

  const [newBatch, setNewBatch] = useState({
    batchName: '',
    templateId: '',
    recipientType: 'student',
    classes: '',
    departments: '',
    minGrade: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, certificatesData, batchesData, statsData] = await Promise.all([
        api.getCertificateTemplates(),
        api.getCertificates(),
        api.getCertificateBatches(),
        api.getCertificateStats()
      ]);
      
      setTemplates(templatesData);
      setCertificates(certificatesData);
      setBatches(batchesData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load certificate data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const templateData = {
        ...newTemplate,
        templateData: {
          layout: newTemplate.layout,
          backgroundColor: newTemplate.backgroundColor,
          borderStyle: newTemplate.borderStyle,
          borderColor: newTemplate.borderColor,
          titleFont: newTemplate.titleFont,
          contentFont: newTemplate.contentFont,
          titleSize: newTemplate.titleSize,
          contentSize: newTemplate.contentSize,
          logoPosition: newTemplate.logoPosition,
          signaturePositions: [],
          customFields: []
        },
        isActive: true,
        usageCount: 0
      };
      
      await api.createCertificateTemplate(templateData);
      toast.success('Certificate template created successfully');
      setIsCreateTemplateDialogOpen(false);
      resetTemplateForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create template');
      console.error(error);
    }
  };

  const handleIssueCertificate = async () => {
    try {
      const certificateData = {
        ...newCertificate,
        certificateNumber: `CERT${Date.now()}`,
        recipientDetails: {
          class: newCertificate.class,
          rollNumber: newCertificate.rollNumber,
          department: newCertificate.department,
          designation: newCertificate.designation,
          email: newCertificate.email,
          phone: newCertificate.phone
        },
        certificateData: {
          title: newCertificate.title,
          content: newCertificate.content,
          achievementDate: newCertificate.achievementDate,
          issueDate: new Date().toISOString(),
          grades: newCertificate.grades,
          remarks: newCertificate.remarks,
          customFields: {}
        },
        issuedBy: 'Current User',
        issuedByDesignation: 'Administrator',
        status: 'issued'
      };
      
      await api.issueCertificate(certificateData);
      toast.success('Certificate issued successfully');
      setIsIssueCertificateDialogOpen(false);
      resetCertificateForm();
      loadData();
    } catch (error) {
      toast.error('Failed to issue certificate');
      console.error(error);
    }
  };

  const handleBatchGenerate = async () => {
    try {
      const batchData = {
        ...newBatch,
        filterCriteria: {
          classes: newBatch.classes.split(',').map(c => c.trim()).filter(c => c),
          departments: newBatch.departments.split(',').map(d => d.trim()).filter(d => d),
          minGrade: newBatch.minGrade ? parseFloat(newBatch.minGrade) : undefined,
          dateRange: newBatch.dateFrom && newBatch.dateTo ? {
            from: newBatch.dateFrom,
            to: newBatch.dateTo
          } : undefined
        },
        totalRecipients: 0,
        generatedCount: 0,
        status: 'pending',
        createdBy: 'Current User'
      };
      
      await api.createCertificateBatch(batchData);
      toast.success('Batch generation started successfully');
      setIsBatchGenerateDialogOpen(false);
      resetBatchForm();
      loadData();
    } catch (error) {
      toast.error('Failed to start batch generation');
      console.error(error);
    }
  };

  const resetTemplateForm = () => {
    setNewTemplate({
      name: '',
      type: 'academic',
      category: '',
      description: '',
      layout: 'portrait',
      backgroundColor: '#ffffff',
      borderStyle: 'solid',
      borderColor: '#000000',
      titleFont: 'Arial',
      contentFont: 'Arial',
      titleSize: 24,
      contentSize: 14,
      logoPosition: 'top-center'
    });
  };

  const resetCertificateForm = () => {
    setNewCertificate({
      templateId: '',
      recipientType: 'student',
      recipientName: '',
      recipientId: '',
      class: '',
      rollNumber: '',
      department: '',
      designation: '',
      email: '',
      phone: '',
      title: '',
      content: '',
      achievementDate: '',
      grades: '',
      remarks: ''
    });
  };

  const resetBatchForm = () => {
    setNewBatch({
      batchName: '',
      templateId: '',
      recipientType: 'student',
      classes: '',
      departments: '',
      minGrade: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': case 'approved': case 'completed': return 'bg-green-100 text-green-800';
      case 'pending_approval': case 'pending': case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'revoked': case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'participation': return 'bg-green-100 text-green-800';
      case 'achievement': return 'bg-orange-100 text-orange-800';
      case 'completion': return 'bg-purple-100 text-purple-800';
      case 'merit': return 'bg-yellow-100 text-yellow-800';
      case 'appreciation': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecipientTypeColor = (type: string) => {
    switch (type) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'external': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    return (
      (cert.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (typeFilter === '' || templates.find(t => t.id === cert.templateId)?.type === typeFilter) &&
      (statusFilter === '' || cert.status === statusFilter) &&
      (templateFilter === '' || cert.templateId === templateFilter)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Certificate Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and issue digital certificates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isBatchGenerateDialogOpen} onOpenChange={setIsBatchGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Batch Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batch Certificate Generation</DialogTitle>
                <DialogDescription>
                  Generate certificates for multiple recipients at once
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="batchName">Batch Name</Label>
                  <Input
                    id="batchName"
                    value={newBatch.batchName}
                    onChange={(e) => setNewBatch({...newBatch, batchName: e.target.value})}
                    placeholder="Enter batch name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchTemplate">Template</Label>
                    <Select value={newBatch.templateId} onValueChange={(value) => setNewBatch({...newBatch, templateId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.filter(t => t.isActive).map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="batchRecipientType">Recipient Type</Label>
                    <Select value={newBatch.recipientType} onValueChange={(value) => setNewBatch({...newBatch, recipientType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {newBatch.recipientType === 'student' && (
                  <div>
                    <Label htmlFor="classes">Classes (comma-separated)</Label>
                    <Input
                      id="classes"
                      value={newBatch.classes}
                      onChange={(e) => setNewBatch({...newBatch, classes: e.target.value})}
                      placeholder="e.g., 10A, 10B, 11A"
                    />
                  </div>
                )}
                
                {newBatch.recipientType === 'staff' && (
                  <div>
                    <Label htmlFor="departments">Departments (comma-separated)</Label>
                    <Input
                      id="departments"
                      value={newBatch.departments}
                      onChange={(e) => setNewBatch({...newBatch, departments: e.target.value})}
                      placeholder="e.g., Mathematics, Science, English"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="minGrade">Minimum Grade (optional)</Label>
                  <Input
                    id="minGrade"
                    type="number"
                    value={newBatch.minGrade}
                    onChange={(e) => setNewBatch({...newBatch, minGrade: e.target.value})}
                    placeholder="Enter minimum grade requirement"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateFrom">Date From</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={newBatch.dateFrom}
                      onChange={(e) => setNewBatch({...newBatch, dateFrom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo">Date To</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={newBatch.dateTo}
                      onChange={(e) => setNewBatch({...newBatch, dateTo: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsBatchGenerateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBatchGenerate}>
                  Start Batch Generation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isIssueCertificateDialogOpen} onOpenChange={setIsIssueCertificateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Award className="mr-2 h-4 w-4" />
                Issue Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Issue New Certificate</DialogTitle>
                <DialogDescription>
                  Create and issue a certificate to a recipient
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="certTemplate">Certificate Template</Label>
                  <Select value={newCertificate.templateId} onValueChange={(value) => setNewCertificate({...newCertificate, templateId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.isActive).map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certRecipientType">Recipient Type</Label>
                    <Select value={newCertificate.recipientType} onValueChange={(value) => setNewCertificate({...newCertificate, recipientType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      value={newCertificate.recipientName}
                      onChange={(e) => setNewCertificate({...newCertificate, recipientName: e.target.value})}
                      placeholder="Enter recipient name"
                    />
                  </div>
                </div>
                
                {newCertificate.recipientType === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="certClass">Class</Label>
                      <Input
                        id="certClass"
                        value={newCertificate.class}
                        onChange={(e) => setNewCertificate({...newCertificate, class: e.target.value})}
                        placeholder="Enter class"
                      />
                    </div>
                    <div>
                      <Label htmlFor="certRollNumber">Roll Number</Label>
                      <Input
                        id="certRollNumber"
                        value={newCertificate.rollNumber}
                        onChange={(e) => setNewCertificate({...newCertificate, rollNumber: e.target.value})}
                        placeholder="Enter roll number"
                      />
                    </div>
                  </div>
                )}
                
                {newCertificate.recipientType === 'staff' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="certDepartment">Department</Label>
                      <Input
                        id="certDepartment"
                        value={newCertificate.department}
                        onChange={(e) => setNewCertificate({...newCertificate, department: e.target.value})}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="certDesignation">Designation</Label>
                      <Input
                        id="certDesignation"
                        value={newCertificate.designation}
                        onChange={(e) => setNewCertificate({...newCertificate, designation: e.target.value})}
                        placeholder="Enter designation"
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certEmail">Email</Label>
                    <Input
                      id="certEmail"
                      type="email"
                      value={newCertificate.email}
                      onChange={(e) => setNewCertificate({...newCertificate, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certPhone">Phone</Label>
                    <Input
                      id="certPhone"
                      value={newCertificate.phone}
                      onChange={(e) => setNewCertificate({...newCertificate, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="certTitle">Certificate Title</Label>
                  <Input
                    id="certTitle"
                    value={newCertificate.title}
                    onChange={(e) => setNewCertificate({...newCertificate, title: e.target.value})}
                    placeholder="Enter certificate title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="certContent">Certificate Content</Label>
                  <Textarea
                    id="certContent"
                    value={newCertificate.content}
                    onChange={(e) => setNewCertificate({...newCertificate, content: e.target.value})}
                    placeholder="Enter the main certificate content..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="achievementDate">Achievement Date</Label>
                    <Input
                      id="achievementDate"
                      type="date"
                      value={newCertificate.achievementDate}
                      onChange={(e) => setNewCertificate({...newCertificate, achievementDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="certGrades">Grades/Score (optional)</Label>
                    <Input
                      id="certGrades"
                      value={newCertificate.grades}
                      onChange={(e) => setNewCertificate({...newCertificate, grades: e.target.value})}
                      placeholder="Enter grades or score"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="certRemarks">Remarks (optional)</Label>
                  <Textarea
                    id="certRemarks"
                    value={newCertificate.remarks}
                    onChange={(e) => setNewCertificate({...newCertificate, remarks: e.target.value})}
                    placeholder="Enter any additional remarks..."
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsIssueCertificateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleIssueCertificate}>
                  <Award className="mr-2 h-4 w-4" />
                  Issue Certificate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Layout className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Certificate Template</DialogTitle>
                <DialogDescription>
                  Design a new certificate template
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="Enter template name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="templateType">Certificate Type</Label>
                    <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({...newTemplate, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="participation">Participation</SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="completion">Completion</SelectItem>
                        <SelectItem value="merit">Merit</SelectItem>
                        <SelectItem value="appreciation">Appreciation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="templateCategory">Category</Label>
                    <Input
                      id="templateCategory"
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                      placeholder="Enter category"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="templateDescription">Description</Label>
                  <Textarea
                    id="templateDescription"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    placeholder="Enter template description"
                    rows={3}
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="layout">Layout Orientation</Label>
                    <Select value={newTemplate.layout} onValueChange={(value) => setNewTemplate({...newTemplate, layout: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="logoPosition">Logo Position</Label>
                    <Select value={newTemplate.logoPosition} onValueChange={(value) => setNewTemplate({...newTemplate, logoPosition: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-center">Top Center</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titleFont">Title Font</Label>
                    <Select value={newTemplate.titleFont} onValueChange={(value) => setNewTemplate({...newTemplate, titleFont: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="titleSize">Title Size</Label>
                    <Input
                      id="titleSize"
                      type="number"
                      value={newTemplate.titleSize}
                      onChange={(e) => setNewTemplate({...newTemplate, titleSize: parseInt(e.target.value)})}
                      min="12"
                      max="48"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={newTemplate.backgroundColor}
                      onChange={(e) => setNewTemplate({...newTemplate, backgroundColor: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="borderColor">Border Color</Label>
                    <Input
                      id="borderColor"
                      type="color"
                      value={newTemplate.borderColor}
                      onChange={(e) => setNewTemplate({...newTemplate, borderColor: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  <Layout className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Quick Issue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
                <p className="text-xs text-muted-foreground">{stats.issuedThisMonth} this month</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pendingApproval}</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold">{stats.templatesActive}</p>
                <p className="text-xs text-muted-foreground">Ready to use</p>
              </div>
              <Layout className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Digital Verifications</p>
                <p className="text-2xl font-bold">{stats.digitalVerifications}</p>
                <p className="text-xs text-muted-foreground">QR code scans</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="certificates" className="w-full">
        <TabsList>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="batches">Batch Processing</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="certificates" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search certificates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="completion">Completion</SelectItem>
                    <SelectItem value="merit">Merit</SelectItem>
                    <SelectItem value="appreciation">Appreciation</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Certificates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Issued Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate #</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.slice(0, 15).map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-mono">{certificate.certificateNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{certificate.recipientName}</div>
                            <div className="text-sm text-muted-foreground">
                              <Badge className={getRecipientTypeColor(certificate.recipientType)} variant="outline">
                                {certificate.recipientType}
                              </Badge>
                              {certificate.recipientType === 'student' && certificate.recipientDetails.class && (
                                <span className="ml-2">Class {certificate.recipientDetails.class}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{certificate.templateName}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(templates.find(t => t.id === certificate.templateId)?.type || '')}>
                            {templates.find(t => t.id === certificate.templateId)?.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(certificate.certificateData.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(certificate.status)}>
                            {certificate.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className={`hover:shadow-md transition-shadow ${!template.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.category}</p>
                      </div>
                      <Badge className={getTypeColor(template.type)}>
                        {template.type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm">{template.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Layout:</span>
                        <span className="font-medium">{template.templateData.layout}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usage Count:</span>
                        <span className="font-medium">{template.usageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Font: {template.templateData.titleFont}</div>
                      <div>Size: {template.templateData.titleSize}px</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="batches" className="space-y-4">
          <div className="space-y-4">
            {batches.map((batch) => (
              <Card key={batch.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{batch.batchName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Template: {batch.templateName} | Type: {batch.recipientType}
                        </p>
                      </div>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Recipients:</span>
                        <p>{batch.totalRecipients}</p>
                      </div>
                      <div>
                        <span className="font-medium">Generated:</span>
                        <p>{batch.generatedCount}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created By:</span>
                        <p>{batch.createdBy}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p>{new Date(batch.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>{batch.totalRecipients > 0 ? Math.round((batch.generatedCount / batch.totalRecipients) * 100) : 0}%</span>
                      </div>
                      <Progress value={batch.totalRecipients > 0 ? (batch.generatedCount / batch.totalRecipients) * 100 : 0} className="w-full" />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download All
                      </Button>
                      {batch.status === 'failed' && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="verification" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="verificationCode">Certificate Number or QR Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verificationCode"
                        placeholder="Enter certificate number"
                      />
                      <Button>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Or upload QR code image to verify
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Verification Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{stats.digitalVerifications}</div>
                      <div className="text-xs text-muted-foreground">Total Verifications</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">98.5%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Verifications</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>CERT1234567890</span>
                        <Badge className="bg-green-100 text-green-800">Valid</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>CERT0987654321</span>
                        <Badge className="bg-green-100 text-green-800">Valid</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>CERT1122334455</span>
                        <Badge className="bg-red-100 text-red-800">Invalid</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}