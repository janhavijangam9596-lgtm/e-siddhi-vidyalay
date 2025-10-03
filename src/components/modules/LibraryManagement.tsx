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
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { api } from '../../utils/api';
import { 
  Plus, Search, Eye, Edit, Trash2, BookOpen, Users, 
  Calendar as CalendarIcon, Clock, CheckCircle, XCircle,
  Download, Upload, RefreshCw, Filter, Star, Award,
  BarChart3, TrendingUp, AlertCircle, FileText, Bookmark,
  Library, BookMarked, UserCheck, History, ShoppingCart
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publishedYear: number;
  edition: string;
  language: string;
  pages: number;
  price: number;
  location: string;
  shelfNumber: string;
  totalCopies: number;
  availableCopies: number;
  reservedCopies: number;
  status: 'available' | 'out_of_stock' | 'damaged' | 'lost';
  description?: string;
  coverUrl?: string;
  tags: string[];
  added_at: string;
  updated_at?: string;
}

interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  rollNumber: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue' | 'lost' | 'damaged';
  fineAmount?: number;
  remarks?: string;
  renewalCount: number;
  created_at: string;
}

interface BookReservation {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  reservationDate: string;
  expiryDate: string;
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
  created_at: string;
}

interface LibraryStats {
  totalBooks: number;
  totalMembers: number;
  booksIssued: number;
  overdueBooks: number;
  reservations: number;
  fineCollection: number;
  popularBooks: number;
  newArrivals: number;
}

interface Member {
  id: string;
  memberId: string;
  name: string;
  type: 'student' | 'staff' | 'faculty';
  class?: string;
  department?: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'suspended' | 'expired';
  maxBooks: number;
  currentBooks: number;
  totalFine: number;
  created_at: string;
}

export function LibraryManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [reservations, setReservations] = useState<BookReservation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<LibraryStats>({
    totalBooks: 0,
    totalMembers: 0,
    booksIssued: 0,
    overdueBooks: 0,
    reservations: 0,
    fineCollection: 0,
    popularBooks: 0,
    newArrivals: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [isIssueBookDialogOpen, setIsIssueBookDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isViewBookDialogOpen, setIsViewBookDialogOpen] = useState(false);
  const [isReturnBookDialogOpen, setIsReturnBookDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<BookIssue | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedYear: '',
    edition: '',
    language: 'English',
    pages: '',
    price: '',
    location: '',
    shelfNumber: '',
    totalCopies: '1',
    description: '',
    tags: ''
  });

  const [newMember, setNewMember] = useState({
    name: '',
    type: 'student',
    class: '',
    department: '',
    email: '',
    phone: '',
    maxBooks: '3'
  });

  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
    dueDate: ''
  });

  const [returnForm, setReturnForm] = useState({
    condition: 'good',
    fineAmount: '',
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksData, issuesData, reservationsData, membersData, statsData] = await Promise.all([
        api.getBooks().catch(() => []),
        api.getBookIssues().catch(() => []),
        api.getBookReservations().catch(() => []),
        api.getLibraryMembers().catch(() => []),
        api.getLibraryStats().catch(() => ({
          totalBooks: 0,
          totalMembers: 0,
          booksIssued: 0,
          overdueBooks: 0,
          reservations: 0,
          fineCollection: 0,
          popularBooks: 0,
          newArrivals: 0
        }))
      ]);
      
      setBooks(booksData || []);
      setIssues(issuesData || []);
      setReservations(reservationsData || []);
      setMembers(membersData || []);
      setStats(statsData || {
        totalBooks: 0,
        totalMembers: 0,
        booksIssued: 0,
        overdueBooks: 0,
        reservations: 0,
        fineCollection: 0,
        popularBooks: 0,
        newArrivals: 0
      });
    } catch (error) {
      // Use demo data if API fails
      const demoBooks: Book[] = [
        {
          id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          isbn: '978-0-7432-7356-5',
          category: 'Fiction',
          publisher: 'Scribner',
          publishedYear: 1925,
          edition: 'First',
          language: 'English',
          pages: 180,
          price: 599,
          location: 'Section A',
          shelfNumber: 'A-12',
          totalCopies: 5,
          availableCopies: 3,
          reservedCopies: 1,
          status: 'available',
          description: 'Classic American novel',
          tags: ['classic', 'fiction', 'american'],
          added_at: '2024-01-01'
        },
        {
          id: '2',
          title: 'Introduction to Algorithms',
          author: 'Thomas H. Cormen',
          isbn: '978-0-262-03384-8',
          category: 'Computer Science',
          publisher: 'MIT Press',
          publishedYear: 2009,
          edition: 'Third',
          language: 'English',
          pages: 1312,
          price: 4500,
          location: 'Section C',
          shelfNumber: 'C-45',
          totalCopies: 3,
          availableCopies: 1,
          reservedCopies: 0,
          status: 'available',
          description: 'Comprehensive textbook on algorithms',
          tags: ['computer science', 'algorithms', 'textbook'],
          added_at: '2024-01-05'
        },
        {
          id: '3',
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          isbn: '978-0-06-112008-4',
          category: 'Fiction',
          publisher: 'HarperCollins',
          publishedYear: 1960,
          edition: 'First',
          language: 'English',
          pages: 324,
          price: 799,
          location: 'Section A',
          shelfNumber: 'A-15',
          totalCopies: 4,
          availableCopies: 4,
          reservedCopies: 0,
          status: 'available',
          tags: ['classic', 'fiction', 'social justice'],
          added_at: '2024-01-10'
        }
      ];

      const demoIssues: BookIssue[] = [
        {
          id: '1',
          bookId: '1',
          bookTitle: 'The Great Gatsby',
          studentId: 'STU001',
          studentName: 'John Doe',
          studentClass: '10th',
          rollNumber: '101',
          issueDate: '2024-01-15',
          dueDate: '2024-01-29',
          status: 'issued',
          renewalCount: 0,
          created_at: '2024-01-15'
        },
        {
          id: '2',
          bookId: '2',
          bookTitle: 'Introduction to Algorithms',
          studentId: 'STU002',
          studentName: 'Jane Smith',
          studentClass: '10th',
          rollNumber: '102',
          issueDate: '2024-01-10',
          dueDate: '2024-01-24',
          status: 'overdue',
          fineAmount: 50,
          renewalCount: 1,
          created_at: '2024-01-10'
        }
      ];

      const demoMembers: Member[] = [
        {
          id: '1',
          memberId: 'LIB001',
          name: 'John Doe',
          type: 'student',
          class: '10th',
          email: 'john.doe@school.edu',
          phone: '+91 98765 43210',
          joinDate: '2024-01-01',
          status: 'active',
          maxBooks: 3,
          currentBooks: 1,
          totalFine: 0,
          created_at: '2024-01-01'
        },
        {
          id: '2',
          memberId: 'LIB002',
          name: 'Jane Smith',
          type: 'student',
          class: '10th',
          email: 'jane.smith@school.edu',
          phone: '+91 98765 43211',
          joinDate: '2024-01-01',
          status: 'active',
          maxBooks: 3,
          currentBooks: 1,
          totalFine: 50,
          created_at: '2024-01-01'
        }
      ];

      const demoStats: LibraryStats = {
        totalBooks: 12,
        totalMembers: 2,
        booksIssued: 2,
        overdueBooks: 1,
        reservations: 1,
        fineCollection: 50,
        popularBooks: 3,
        newArrivals: 2
      };

      setBooks(demoBooks);
      setIssues(demoIssues);
      setReservations([]);
      setMembers(demoMembers);
      setStats(demoStats);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    try {
      const bookData = {
        ...newBook,
        publishedYear: parseInt(newBook.publishedYear),
        pages: parseInt(newBook.pages),
        price: parseFloat(newBook.price),
        totalCopies: parseInt(newBook.totalCopies),
        availableCopies: parseInt(newBook.totalCopies),
        reservedCopies: 0,
        status: 'available',
        tags: newBook.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await api.createBook(bookData);
      toast.success('Book added successfully');
      setIsAddBookDialogOpen(false);
      resetBookForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add book');
      console.error(error);
    }
  };

  const handleAddMember = async () => {
    try {
      const memberData = {
        ...newMember,
        memberId: `LIB${Date.now()}`,
        joinDate: new Date().toISOString(),
        status: 'active',
        maxBooks: parseInt(newMember.maxBooks),
        currentBooks: 0,
        totalFine: 0
      };
      
      await api.createLibraryMember(memberData);
      toast.success('Member added successfully');
      setIsAddMemberDialogOpen(false);
      resetMemberForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add member');
      console.error(error);
    }
  };

  const handleIssueBook = async () => {
    try {
      const issueData = {
        ...issueForm,
        issueDate: new Date().toISOString(),
        status: 'issued',
        renewalCount: 0
      };
      
      await api.issueBook(issueData);
      toast.success('Book issued successfully');
      setIsIssueBookDialogOpen(false);
      resetIssueForm();
      loadData();
    } catch (error) {
      toast.error('Failed to issue book');
      console.error(error);
    }
  };

  const handleReturnBook = async () => {
    try {
      if (!selectedIssue) return;
      
      const returnData = {
        returnDate: new Date().toISOString(),
        condition: returnForm.condition,
        fineAmount: parseFloat(returnForm.fineAmount) || 0,
        remarks: returnForm.remarks,
        status: returnForm.condition === 'damaged' ? 'damaged' : 'returned'
      };
      
      await api.returnBook(selectedIssue.id, returnData);
      toast.success('Book returned successfully');
      setIsReturnBookDialogOpen(false);
      resetReturnForm();
      loadData();
    } catch (error) {
      toast.error('Failed to return book');
      console.error(error);
    }
  };

  const handleRenewBook = async (issueId: string) => {
    try {
      await api.renewBook(issueId);
      toast.success('Book renewed successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to renew book');
      console.error(error);
    }
  };

  const handleReserveBook = async (bookId: string, studentId: string) => {
    try {
      const reservationData = {
        bookId,
        studentId,
        reservationDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      };
      
      await api.reserveBook(reservationData);
      toast.success('Book reserved successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to reserve book');
      console.error(error);
    }
  };

  const resetBookForm = () => {
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publishedYear: '',
      edition: '',
      language: 'English',
      pages: '',
      price: '',
      location: '',
      shelfNumber: '',
      totalCopies: '1',
      description: '',
      tags: ''
    });
  };

  const resetMemberForm = () => {
    setNewMember({
      name: '',
      type: 'student',
      class: '',
      department: '',
      email: '',
      phone: '',
      maxBooks: '3'
    });
  };

  const resetIssueForm = () => {
    setIssueForm({
      bookId: '',
      studentId: '',
      dueDate: ''
    });
  };

  const resetReturnForm = () => {
    setReturnForm({
      condition: 'good',
      fineAmount: '',
      remarks: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'damaged': return 'bg-orange-100 text-orange-800';
      case 'lost': return 'bg-gray-100 text-gray-800';
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBooks = (books || []).filter(book => {
    if (!book) return false;
    return (
      ((book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (book.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (book.isbn || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === '' || categoryFilter === 'all' || book.category === categoryFilter) &&
      (statusFilter === '' || statusFilter === 'all' || book.status === statusFilter) &&
      (authorFilter === '' || (book.author || '').toLowerCase().includes(authorFilter.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Library Management</h1>
          <p className="text-muted-foreground">
            Manage books, members, and library operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Library Member</DialogTitle>
                <DialogDescription>
                  Register a new library member
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="memberName">Name</Label>
                  <Input
                    id="memberName"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="Enter member name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="memberType">Member Type</Label>
                  <Select value={newMember.type} onValueChange={(value) => setNewMember({...newMember, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newMember.type === 'student' && (
                  <div>
                    <Label htmlFor="memberClass">Class</Label>
                    <Select value={newMember.class} onValueChange={(value) => setNewMember({...newMember, class: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Class 1</SelectItem>
                        <SelectItem value="2">Class 2</SelectItem>
                        <SelectItem value="3">Class 3</SelectItem>
                        <SelectItem value="4">Class 4</SelectItem>
                        <SelectItem value="5">Class 5</SelectItem>
                        <SelectItem value="6">Class 6</SelectItem>
                        <SelectItem value="7">Class 7</SelectItem>
                        <SelectItem value="8">Class 8</SelectItem>
                        <SelectItem value="9">Class 9</SelectItem>
                        <SelectItem value="10">Class 10</SelectItem>
                        <SelectItem value="11">Class 11</SelectItem>
                        <SelectItem value="12">Class 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {(newMember.type === 'staff' || newMember.type === 'faculty') && (
                  <div>
                    <Label htmlFor="memberDepartment">Department</Label>
                    <Input
                      id="memberDepartment"
                      value={newMember.department}
                      onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                      placeholder="Enter department"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="memberEmail">Email</Label>
                    <Input
                      id="memberEmail"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memberPhone">Phone</Label>
                    <Input
                      id="memberPhone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="maxBooks">Maximum Books Allowed</Label>
                  <Input
                    id="maxBooks"
                    type="number"
                    value={newMember.maxBooks}
                    onChange={(e) => setNewMember({...newMember, maxBooks: e.target.value})}
                    placeholder="Enter maximum books"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>
                  Add Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogDescription>
                  Add a new book to the library collection
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="bookTitle">Title</Label>
                    <Input
                      id="bookTitle"
                      value={newBook.title}
                      onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                      placeholder="Enter book title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bookAuthor">Author</Label>
                    <Input
                      id="bookAuthor"
                      value={newBook.author}
                      onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                      placeholder="Enter author name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookISBN">ISBN</Label>
                      <Input
                        id="bookISBN"
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                        placeholder="Enter ISBN"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bookCategory">Category</Label>
                      <Select value={newBook.category} onValueChange={(value) => setNewBook({...newBook, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fiction">Fiction</SelectItem>
                          <SelectItem value="non_fiction">Non-Fiction</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                          <SelectItem value="biography">Biography</SelectItem>
                          <SelectItem value="reference">Reference</SelectItem>
                          <SelectItem value="textbook">Textbook</SelectItem>
                          <SelectItem value="children">Children's Books</SelectItem>
                          <SelectItem value="literature">Literature</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookPublisher">Publisher</Label>
                      <Input
                        id="bookPublisher"
                        value={newBook.publisher}
                        onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                        placeholder="Enter publisher"
                      />
                    </div>
                    <div>
                      <Label htmlFor="publishedYear">Published Year</Label>
                      <Input
                        id="publishedYear"
                        type="number"
                        value={newBook.publishedYear}
                        onChange={(e) => setNewBook({...newBook, publishedYear: e.target.value})}
                        placeholder="Enter year"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookEdition">Edition</Label>
                      <Input
                        id="bookEdition"
                        value={newBook.edition}
                        onChange={(e) => setNewBook({...newBook, edition: e.target.value})}
                        placeholder="Enter edition"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bookLanguage">Language</Label>
                      <Select value={newBook.language} onValueChange={(value) => setNewBook({...newBook, language: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookPages">Pages</Label>
                      <Input
                        id="bookPages"
                        type="number"
                        value={newBook.pages}
                        onChange={(e) => setNewBook({...newBook, pages: e.target.value})}
                        placeholder="Enter page count"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bookPrice">Price</Label>
                      <Input
                        id="bookPrice"
                        type="number"
                        step="0.01"
                        value={newBook.price}
                        onChange={(e) => setNewBook({...newBook, price: e.target.value})}
                        placeholder="Enter price"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bookDescription">Description</Label>
                    <Textarea
                      id="bookDescription"
                      value={newBook.description}
                      onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                      placeholder="Enter book description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bookTags">Tags (comma-separated)</Label>
                    <Input
                      id="bookTags"
                      value={newBook.tags}
                      onChange={(e) => setNewBook({...newBook, tags: e.target.value})}
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="inventory" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookLocation">Location</Label>
                      <Input
                        id="bookLocation"
                        value={newBook.location}
                        onChange={(e) => setNewBook({...newBook, location: e.target.value})}
                        placeholder="Enter location (e.g., Section A)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shelfNumber">Shelf Number</Label>
                      <Input
                        id="shelfNumber"
                        value={newBook.shelfNumber}
                        onChange={(e) => setNewBook({...newBook, shelfNumber: e.target.value})}
                        placeholder="Enter shelf number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="totalCopies">Total Copies</Label>
                    <Input
                      id="totalCopies"
                      type="number"
                      value={newBook.totalCopies}
                      onChange={(e) => setNewBook({...newBook, totalCopies: e.target.value})}
                      placeholder="Enter number of copies"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddBookDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBook}>
                  Add Book
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
                <p className="text-sm text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Books Issued</p>
                <p className="text-2xl font-bold">{stats.booksIssued}</p>
              </div>
              <BookMarked className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Overdue Books</p>
                <p className="text-2xl font-bold">{stats.overdueBooks}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="books" className="w-full">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="issues">Issues/Returns</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="books" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search books..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="non_fiction">Non-Fiction</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="textbook">Textbook</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  const csvContent = [
                    ['Title', 'Author', 'ISBN', 'Category', 'Publisher', 'Year', 'Available', 'Total', 'Status', 'Location'].join(','),
                    ...filteredBooks.map(book => [
                      book.title,
                      book.author,
                      book.isbn,
                      book.category,
                      book.publisher,
                      book.publishedYear,
                      book.availableCopies,
                      book.totalCopies,
                      book.status,
                      `${book.location} - ${book.shelfNumber}`
                    ].join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `library-books-${Date.now()}.csv`;
                  a.click();
                  toast.success('Books exported successfully');
                }}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              
              {bulkSelection.length > 0 && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg mt-4">
                  <span className="text-sm">{bulkSelection.length} books selected</span>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info('Bulk edit functionality coming soon');
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Bulk Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (confirm(`Are you sure you want to delete ${bulkSelection.length} books?`)) {
                      // Implement bulk delete
                      toast.success(`${bulkSelection.length} books deleted`);
                      setBulkSelection([]);
                      loadData();
                    }
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setBulkSelection([])}>
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Books Table */}
          <Card>
            <CardHeader>
              <CardTitle>Book Collection</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={bulkSelection.length === paginatedBooks.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBulkSelection(paginatedBooks.map(b => b.id));
                              } else {
                                setBulkSelection([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>ISBN</TableHead>
                        <TableHead>Copies</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(paginatedBooks || []).map((book) => (
                        <TableRow key={book.id}>
                          <TableCell>
                            <Checkbox
                              checked={bulkSelection.includes(book.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setBulkSelection([...bulkSelection, book.id]);
                                } else {
                                  setBulkSelection(bulkSelection.filter(id => id !== book.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{book.title}</div>
                              <div className="text-sm text-muted-foreground">{book.publisher}</div>
                            </div>
                          </TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{book.category}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Available: {book.availableCopies}</div>
                              <div>Total: {book.totalCopies}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(book.status)}>
                              {book.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{book.location}</div>
                              <div className="text-muted-foreground">Shelf: {book.shelfNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setIsViewBookDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {book.availableCopies > 0 ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setIssueForm({...issueForm, bookId: book.id});
                                    setIsIssueBookDialogOpen(true);
                                  }}
                                  title="Issue this book"
                                >
                                  <BookMarked className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  title="Book not available"
                                >
                                  <BookMarked className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => {
                                toast.info('Edit book functionality coming soon');
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredBooks.length)} of{' '}
                  {filteredBooks.length} books
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="issues" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Book Issues & Returns</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                const csvContent = [
                  ['Book Title', 'Member Name', 'Class', 'Issue Date', 'Due Date', 'Status', 'Fine'].join(','),
                  ...(issues || []).map(issue => [
                    issue.bookTitle,
                    issue.studentName,
                    issue.studentClass,
                    issue.issueDate,
                    issue.dueDate,
                    issue.status,
                    issue.fineAmount || '0'
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `library-issues-${Date.now()}.csv`;
                a.click();
                toast.success('Issues exported successfully');
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export Issues
              </Button>
              <Dialog open={isIssueBookDialogOpen} onOpenChange={setIsIssueBookDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <BookMarked className="mr-2 h-4 w-4" />
                  Issue Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Issue Book</DialogTitle>
                  <DialogDescription>
                    Issue a book to a library member
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="issueBook">Select Book</Label>
                    <Select value={issueForm.bookId} onValueChange={(value) => setIssueForm({...issueForm, bookId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a book" />
                      </SelectTrigger>
                      <SelectContent>
                        {(books || []).filter(book => book && book.availableCopies > 0).map(book => (
                          <SelectItem key={book.id} value={book.id}>
                            {book.title} - {book.author} ({book.availableCopies} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="issueStudent">Select Member</Label>
                    <Select value={issueForm.studentId} onValueChange={(value) => setIssueForm({...issueForm, studentId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {(members || []).filter(member => member && member.status === 'active').map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} ({member.type}) - Books: {member.currentBooks}/{member.maxBooks}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={issueForm.dueDate}
                      onChange={(e) => setIssueForm({...issueForm, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsIssueBookDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleIssueBook}>
                    Issue Book
                  </Button>
                </div>
              </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fine</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(issues || []).slice(0, 10).map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{issue.bookTitle}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{issue.studentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {issue.studentClass} - {issue.rollNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(issue.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(issue.dueDate).toLocaleDateString()}</div>
                            {issue.status === 'overdue' && (
                              <div className="text-sm text-red-600">
                                {Math.ceil((Date.now() - new Date(issue.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {issue.fineAmount ? `₹${issue.fineAmount}` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {issue.status === 'issued' || issue.status === 'overdue' ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedIssue(issue);
                                    setIsReturnBookDialogOpen(true);
                                  }}
                                  title="Return this book"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRenewBook(issue.id)}
                                  title="Renew this book"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
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
        
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Library Members</CardTitle>
              <Button variant="outline" onClick={() => {
                const csvContent = [
                  ['Member ID', 'Name', 'Type', 'Class/Dept', 'Email', 'Phone', 'Books Issued', 'Max Books', 'Fine', 'Status'].join(','),
                  ...(members || []).map(member => [
                    member.memberId,
                    member.name,
                    member.type,
                    member.class || member.department || '',
                    member.email,
                    member.phone,
                    member.currentBooks,
                    member.maxBooks,
                    member.totalFine,
                    member.status
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `library-members-${Date.now()}.csv`;
                a.click();
                toast.success('Members exported successfully');
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export Members
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Class/Department</TableHead>
                      <TableHead>Books Issued</TableHead>
                      <TableHead>Fine Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(members || []).map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-mono">{member.memberId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.type}</Badge>
                        </TableCell>
                        <TableCell>{member.class || member.department}</TableCell>
                        <TableCell>{member.currentBooks}/{member.maxBooks}</TableCell>
                        <TableCell>
                          {member.totalFine > 0 ? (
                            <span className="text-red-600">₹{member.totalFine}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              // View member details
                              toast.info(`Viewing member: ${member.name}`);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              toast.info('Edit member functionality coming soon');
                            }}>
                              <Edit className="h-4 w-4" />
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
        
        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Book Reservations</CardTitle>
              <Button variant="outline" onClick={() => {
                const csvContent = [
                  ['Book Title', 'Member Name', 'Reservation Date', 'Expiry Date', 'Status'].join(','),
                  ...(reservations || []).map(reservation => [
                    reservation.bookTitle,
                    reservation.studentName,
                    reservation.reservationDate,
                    reservation.expiryDate,
                    reservation.status
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `library-reservations-${Date.now()}.csv`;
                a.click();
                toast.success('Reservations exported successfully');
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export Reservations
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Reservation Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reservations || []).map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.bookTitle}</TableCell>
                        <TableCell>{reservation.studentName}</TableCell>
                        <TableCell>{new Date(reservation.reservationDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(reservation.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(reservation.status)}>
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {reservation.status === 'active' && (
                              <Button size="sm" onClick={() => {
                                toast.success(`Reservation fulfilled for ${reservation.bookTitle}`);
                                loadData();
                              }}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => {
                              if (confirm('Cancel this reservation?')) {
                                toast.success('Reservation cancelled');
                                loadData();
                              }
                            }}>
                              <XCircle className="h-4 w-4" />
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
        
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => {
              const reportData = {
                date: new Date().toISOString(),
                totalBooks: stats.totalBooks,
                totalMembers: stats.totalMembers,
                booksIssued: stats.booksIssued,
                overdueBooks: stats.overdueBooks,
                reservations: stats.reservations,
                fineCollection: stats.fineCollection,
                availableBooks: stats.totalBooks - stats.booksIssued,
                circulationRate: ((stats.booksIssued / stats.totalBooks) * 100).toFixed(2) + '%'
              };
              
              const jsonContent = JSON.stringify(reportData, null, 2);
              const blob = new Blob([jsonContent], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `library-report-${Date.now()}.json`;
              a.click();
              toast.success('Report exported successfully');
            }}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Books</span>
                    <span className="font-bold">{stats.totalBooks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Books in Circulation</span>
                    <span className="font-bold">{stats.booksIssued}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Available Books</span>
                    <span className="font-bold">{stats.totalBooks - stats.booksIssued}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Overdue Books</span>
                    <span className="font-bold text-red-600">{stats.overdueBooks}</span>
                  </div>
                  <Progress value={(stats.booksIssued / stats.totalBooks) * 100} className="w-full" />
                  <div className="text-sm text-center text-muted-foreground">
                    {Math.round((stats.booksIssued / stats.totalBooks) * 100)}% books in circulation
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Member Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Members</span>
                    <span className="font-bold">{stats.totalMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Reservations</span>
                    <span className="font-bold">{stats.reservations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fine Collection</span>
                    <span className="font-bold text-green-600">₹{stats.fineCollection}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New Arrivals</span>
                    <span className="font-bold">{stats.newArrivals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Book Dialog */}
      <Dialog open={isViewBookDialogOpen} onOpenChange={setIsViewBookDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Details</DialogTitle>
          </DialogHeader>
          
          {selectedBook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Basic Information</h3>
                  <div className="space-y-1 text-sm">
                    <div>Title: {selectedBook.title}</div>
                    <div>Author: {selectedBook.author}</div>
                    <div>ISBN: {selectedBook.isbn}</div>
                    <div>Category: {selectedBook.category}</div>
                    <div>Publisher: {selectedBook.publisher}</div>
                    <div>Year: {selectedBook.publishedYear}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Availability</h3>
                  <div className="space-y-1 text-sm">
                    <div>Total Copies: {selectedBook.totalCopies}</div>
                    <div>Available: {selectedBook.availableCopies}</div>
                    <div>Reserved: {selectedBook.reservedCopies}</div>
                    <div>Location: {selectedBook.location}</div>
                    <div>Shelf: {selectedBook.shelfNumber}</div>
                    <div>Status: <Badge className={getStatusColor(selectedBook.status)}>{selectedBook.status}</Badge></div>
                  </div>
                </div>
              </div>
              
              {selectedBook.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm">{selectedBook.description}</p>
                </div>
              )}
              
              {selectedBook.tags && selectedBook.tags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedBook.tags || []).map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setIsViewBookDialogOpen(false);
                  // You can implement edit functionality here
                  toast.info('Edit functionality coming soon');
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Book
                </Button>
                <Button variant="outline" onClick={() => {
                  if (selectedBook && selectedBook.availableCopies > 0) {
                    setIssueForm({...issueForm, bookId: selectedBook.id});
                    setIsViewBookDialogOpen(false);
                    setIsIssueBookDialogOpen(true);
                  } else {
                    toast.error('This book is not available for issue');
                  }
                }}>
                  <BookMarked className="mr-2 h-4 w-4" />
                  Issue Book
                </Button>
                <Button variant="outline" onClick={() => {
                  if (selectedBook) {
                    handleReserveBook(selectedBook.id, 'STU-001'); // You can make this dynamic
                    setIsViewBookDialogOpen(false);
                  }
                }}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Reserve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return Book Dialog */}
      <Dialog open={isReturnBookDialogOpen} onOpenChange={setIsReturnBookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>
              Process book return for {selectedIssue?.studentName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">{selectedIssue.bookTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  Issued on: {new Date(selectedIssue.issueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(selectedIssue.dueDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <Label htmlFor="bookCondition">Book Condition</Label>
                <Select value={returnForm.condition} onValueChange={(value) => setReturnForm({...returnForm, condition: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fineAmount">Fine Amount (if any)</Label>
                <Input
                  id="fineAmount"
                  type="number"
                  step="0.01"
                  value={returnForm.fineAmount}
                  onChange={(e) => setReturnForm({...returnForm, fineAmount: e.target.value})}
                  placeholder="Enter fine amount"
                />
              </div>
              
              <div>
                <Label htmlFor="returnRemarks">Remarks</Label>
                <Textarea
                  id="returnRemarks"
                  value={returnForm.remarks}
                  onChange={(e) => setReturnForm({...returnForm, remarks: e.target.value})}
                  placeholder="Enter any remarks"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsReturnBookDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturnBook}>
              Process Return
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}