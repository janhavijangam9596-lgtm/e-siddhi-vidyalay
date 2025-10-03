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
import { api } from '../../utils/api';
import {
  Plus, Search, Eye, Send, MessageSquare,
  Download, RefreshCw,
  Filter, Megaphone, FileText, Image, Paperclip, Clock,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'holiday' | 'exam';
  audience: 'all' | 'students' | 'parents' | 'staff' | 'specific';
  targetGroups?: string[];
  priority: 'low' | 'medium' | 'high';
  publishDate: string;
  expiryDate?: string;
  attachments: string[];
  status: 'draft' | 'published' | 'expired';
  createdBy: string;
  viewCount: number;
  created_at: string;
}

interface Message {
  id: string;
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  recipientIds: string[];
  recipientType: 'individual' | 'group' | 'class' | 'all';
  messageType: 'text' | 'email' | 'sms' | 'push';
  status: 'draft' | 'sent' | 'delivered' | 'failed';
  scheduledTime?: string;
  attachments: string[];
  readReceipts: ReadReceipt[];
  created_at: string;
}

interface ReadReceipt {
  recipientId: string;
  recipientName: string;
  readAt?: string;
  delivered: boolean;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'announcement' | 'message' | 'notification';
  category: string;
  variables: string[];
  usageCount: number;
  created_at: string;
}

interface CommunicationStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  totalMessages: number;
  messagesSentToday: number;
  deliveryRate: number;
  readRate: number;
  urgentAnnouncements: number;
  scheduledMessages: number;
}

export function CommunicationCenter() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<CommunicationStats>({
    totalAnnouncements: 0,
    activeAnnouncements: 0,
    totalMessages: 0,
    messagesSentToday: 0,
    deliveryRate: 0,
    readRate: 0,
    urgentAnnouncements: 0,
    scheduledMessages: 0
  });
  
  const [isAddAnnouncementDialogOpen, setIsAddAnnouncementDialogOpen] = useState(false);
  const [isSendMessageDialogOpen, setIsSendMessageDialogOpen] = useState(false);
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general',
    audience: 'all',
    priority: 'medium',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    targetGroups: [] as string[]
  });

  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipientType: 'all',
    messageType: 'email',
    scheduledTime: '',
    recipientIds: [] as string[]
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'announcement',
    category: 'general'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [announcementsData, messagesData, templatesData, statsData] = await Promise.all([
        api.getAnnouncements().catch(() => []),
        api.getMessages().catch(() => []),
        api.getMessageTemplates().catch(() => []),
        api.getCommunicationStats().catch(() => ({
          totalAnnouncements: 0,
          activeAnnouncements: 0,
          totalMessages: 0,
          messagesSentToday: 0,
          deliveryRate: 0,
          readRate: 0,
          urgentAnnouncements: 0,
          scheduledMessages: 0
        }))
      ]);
      
      setAnnouncements(announcementsData || []);
      setMessages(messagesData || []);
      setTemplates(templatesData || []);
      setStats(statsData || {
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        totalMessages: 0,
        messagesSentToday: 0,
        deliveryRate: 0,
        readRate: 0,
        urgentAnnouncements: 0,
        scheduledMessages: 0
      });
      
      // Don't show error if data loads successfully with mock data
      if (announcementsData && announcementsData.length > 0) {
        console.log('Communication data loaded successfully');
      }
    } catch (error) {
      toast.error('Failed to load communication data');
      console.error(error);
      // Set default empty values
      setAnnouncements([]);
      setMessages([]);
      setTemplates([]);
      setStats({
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        totalMessages: 0,
        messagesSentToday: 0,
        deliveryRate: 0,
        readRate: 0,
        urgentAnnouncements: 0,
        scheduledMessages: 0
      });
    } finally {
      // Loading complete
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      const announcementData = {
        ...newAnnouncement,
        status: 'published',
        createdBy: 'current_user',
        viewCount: 0,
        attachments: []
      };
      
      await api.createAnnouncement(announcementData);
      toast.success('Announcement created successfully');
      setIsAddAnnouncementDialogOpen(false);
      resetAnnouncementForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create announcement');
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    try {
      const messageData = {
        ...newMessage,
        senderId: 'current_user',
        senderName: 'Admin',
        status: newMessage.scheduledTime ? 'scheduled' : 'sent',
        attachments: [],
        readReceipts: []
      };
      
      await api.sendMessage(messageData);
      toast.success(newMessage.scheduledTime ? 'Message scheduled successfully' : 'Message sent successfully');
      setIsSendMessageDialogOpen(false);
      resetMessageForm();
      loadData();
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const templateData = {
        ...newTemplate,
        variables: extractVariables(newTemplate.content),
        usageCount: 0
      };
      
      await api.createMessageTemplate(templateData);
      toast.success('Template created successfully');
      setIsCreateTemplateDialogOpen(false);
      resetTemplateForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create template');
      console.error(error);
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map(match => match.replace(/\{\{|\}\}/g, '')) : [];
  };

  const resetAnnouncementForm = () => {
    setNewAnnouncement({
      title: '',
      content: '',
      type: 'general',
      audience: 'all',
      priority: 'medium',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      targetGroups: []
    });
  };

  const resetMessageForm = () => {
    setNewMessage({
      subject: '',
      content: '',
      recipientType: 'all',
      messageType: 'email',
      scheduledTime: '',
      recipientIds: []
    });
  };

  const resetTemplateForm = () => {
    setNewTemplate({
      name: '',
      subject: '',
      content: '',
      type: 'announcement',
      category: 'general'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'holiday': return 'bg-green-100 text-green-800';
      case 'exam': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAnnouncements = (announcements || []).filter(announcement => {
    if (!announcement) return false;
    return (
      (announcement.title || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter === '' || typeFilter === 'all' || announcement.type === typeFilter) &&
      (statusFilter === '' || statusFilter === 'all' || announcement.status === statusFilter)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Communication Center</h1>
          <p className="text-muted-foreground">
            Manage announcements, messages, and school communications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Message Template</DialogTitle>
                <DialogDescription>
                  Create a reusable template for messages and announcements
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
                    <Label htmlFor="templateType">Type</Label>
                    <Select value={newTemplate.type} onValueChange={(value: string) => setNewTemplate({...newTemplate, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="templateCategory">Category</Label>
                    <Select value={newTemplate.category} onValueChange={(value: string) => setNewTemplate({...newTemplate, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="templateSubject">Subject</Label>
                  <Input
                    id="templateSubject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                    placeholder="Enter subject line"
                  />
                </div>
                
                <div>
                  <Label htmlFor="templateContent">Content</Label>
                  <Textarea
                    id="templateContent"
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                    placeholder="Enter message content. Use {{variable}} for dynamic content."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use double braces for variables: {'{{studentName}}'}, {'{{className}}'}, {'{{date}}'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isSendMessageDialogOpen} onOpenChange={setIsSendMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
                <DialogDescription>
                  Send a message to students, parents, or staff
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientType">Recipients</Label>
                    <Select value={newMessage.recipientType} onValueChange={(value: string) => setNewMessage({...newMessage, recipientType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">All Students</SelectItem>
                        <SelectItem value="parents">All Parents</SelectItem>
                        <SelectItem value="staff">All Staff</SelectItem>
                        <SelectItem value="class">Specific Class</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="messageType">Message Type</Label>
                    <Select value={newMessage.messageType} onValueChange={(value: string) => setNewMessage({...newMessage, messageType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="text">In-App Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="messageSubject">Subject</Label>
                  <Input
                    id="messageSubject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    placeholder="Enter message subject"
                  />
                </div>
                
                <div>
                  <Label htmlFor="messageContent">Message Content</Label>
                  <Textarea
                    id="messageContent"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    placeholder="Enter your message"
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="scheduledTime">Schedule for Later (Optional)</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={newMessage.scheduledTime}
                    onChange={(e) => setNewMessage({...newMessage, scheduledTime: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" size="sm">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach Files
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsSendMessageDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  {newMessage.scheduledTime ? 'Schedule Message' : 'Send Message'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddAnnouncementDialogOpen} onOpenChange={setIsAddAnnouncementDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Create a new announcement for the school community
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="announcementTitle">Title</Label>
                  <Input
                    id="announcementTitle"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    placeholder="Enter announcement title"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="announcementType">Type</Label>
                    <Select value={newAnnouncement.type} onValueChange={(value: string) => setNewAnnouncement({...newAnnouncement, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="announcementAudience">Audience</Label>
                    <Select value={newAnnouncement.audience} onValueChange={(value: string) => setNewAnnouncement({...newAnnouncement, audience: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="parents">Parents</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="specific">Specific Groups</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="announcementPriority">Priority</Label>
                    <Select value={newAnnouncement.priority} onValueChange={(value: string) => setNewAnnouncement({...newAnnouncement, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="announcementContent">Content</Label>
                  <Textarea
                    id="announcementContent"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    placeholder="Enter announcement content"
                    rows={6}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="publishDate">Publish Date</Label>
                    <Input
                      id="publishDate"
                      type="date"
                      value={newAnnouncement.publishDate}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, publishDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newAnnouncement.expiryDate}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" size="sm">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach Files
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    <Image className="mr-2 h-4 w-4" />
                    Add Image
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddAnnouncementDialogOpen(false)}>
                  Save as Draft
                </Button>
                <Button onClick={handleCreateAnnouncement}>
                  Publish Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Announcements</p>
                <p className="text-2xl font-bold">{stats.activeAnnouncements}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalAnnouncements} total</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Messages Sent Today</p>
                <p className="text-2xl font-bold">{stats.messagesSentToday}</p>
                <p className="text-xs text-muted-foreground">{stats.totalMessages} total</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold">{stats.deliveryRate}%</p>
              </div>
              <Send className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Read Rate</p>
                <p className="text-2xl font-bold">{stats.readRate}%</p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="announcements" className="w-full">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="announcements" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Announcements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <Badge className={getTypeColor(announcement.type)}>
                          {announcement.type}
                        </Badge>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(announcement.status)}>
                        {announcement.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold line-clamp-2">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {announcement.content}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Audience: {announcement.audience}</span>
                      <span>{announcement.viewCount} views</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{new Date(announcement.publishDate).toLocaleDateString()}</span>
                      {announcement.expiryDate && (
                        <span>Expires: {new Date(announcement.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Delivery Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(messages || []).slice(0, 10).map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{message.subject}</div>
                            <div className="text-sm text-muted-foreground">
                              by {message.senderName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{message.recipientType}</div>
                            <div className="text-sm text-muted-foreground">
                            {(message.recipientIds || []).length} recipients
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{message.messageType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {message.scheduledTime ? (
                            <div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Scheduled
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(message.scheduledTime).toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            new Date(message.created_at).toLocaleDateString()
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {message.readReceipts && message.readReceipts.length > 0 
                                ? Math.round((message.readReceipts.filter(r => r.delivered).length / message.readReceipts.length) * 100) 
                                : 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
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
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(templates || []).map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">{template.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {template.content}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{template.category}</span>
                          <span>{template.usageCount} uses</span>
                        </div>
                        
                        {template.variables && template.variables.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground">Variables:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.variables.map((variable, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Use Template
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Announcements</span>
                    <span className="font-bold">{stats.totalAnnouncements}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Announcements</span>
                    <span className="font-bold text-green-600">{stats.activeAnnouncements}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Urgent Announcements</span>
                    <span className="font-bold text-red-600">{stats.urgentAnnouncements}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Messages Sent Today</span>
                    <span className="font-bold">{stats.messagesSentToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Scheduled Messages</span>
                    <span className="font-bold text-blue-600">{stats.scheduledMessages}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Delivery Rate</span>
                      <span className="font-bold">{stats.deliveryRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${stats.deliveryRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Read Rate</span>
                      <span className="font-bold">{stats.readRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${stats.readRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{stats.deliveryRate}%</div>
                      <div className="text-xs text-muted-foreground">Delivered</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{stats.readRate}%</div>
                      <div className="text-xs text-muted-foreground">Read</div>
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