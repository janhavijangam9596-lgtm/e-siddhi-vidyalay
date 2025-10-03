import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigation } from '../../hooks/useNavigation';
import {
  ChevronLeft, Book, Search, Calendar, Clock, AlertCircle,
  Download, BookOpen, History, Star, Filter, RotateCcw
} from 'lucide-react';

interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  borrowDate: string;
  dueDate: string;
  status: 'active' | 'overdue' | 'returned';
  fine: number;
  renewalCount: number;
  maxRenewals: number;
  category: string;
  coverImage?: string;
}

interface BookHistory {
  id: string;
  title: string;
  author: string;
  borrowDate: string;
  returnDate: string;
  rating?: number;
  fine: number;
}

interface AvailableBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  availability: 'available' | 'borrowed' | 'reserved';
  availableDate?: string;
}

export function MyLibrary() {
  const { navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const borrowedBooks: BorrowedBook[] = [
    {
      id: 'BK001',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      isbn: '978-0262033848',
      borrowDate: 'Dec 15, 2023',
      dueDate: 'Jan 15, 2024',
      status: 'active',
      fine: 0,
      renewalCount: 1,
      maxRenewals: 2,
      category: 'Computer Science'
    },
    {
      id: 'BK002',
      title: 'Physics for Scientists and Engineers',
      author: 'Raymond A. Serway',
      isbn: '978-1337553278',
      borrowDate: 'Dec 1, 2023',
      dueDate: 'Dec 31, 2023',
      status: 'overdue',
      fine: 50,
      renewalCount: 2,
      maxRenewals: 2,
      category: 'Physics'
    },
    {
      id: 'BK003',
      title: 'Organic Chemistry',
      author: 'Paula Bruice',
      isbn: '978-0134042282',
      borrowDate: 'Jan 5, 2024',
      dueDate: 'Feb 5, 2024',
      status: 'active',
      fine: 0,
      renewalCount: 0,
      maxRenewals: 2,
      category: 'Chemistry'
    }
  ];

  const bookHistory: BookHistory[] = [
    {
      id: 'H001',
      title: 'Data Structures and Algorithms',
      author: 'Michael T. Goodrich',
      borrowDate: 'Oct 1, 2023',
      returnDate: 'Oct 30, 2023',
      rating: 5,
      fine: 0
    },
    {
      id: 'H002',
      title: 'Linear Algebra',
      author: 'Gilbert Strang',
      borrowDate: 'Sep 15, 2023',
      returnDate: 'Oct 14, 2023',
      rating: 4,
      fine: 0
    },
    {
      id: 'H003',
      title: 'Digital Design',
      author: 'Morris Mano',
      borrowDate: 'Aug 20, 2023',
      returnDate: 'Sep 25, 2023',
      rating: 4,
      fine: 25
    }
  ];

  const availableBooks: AvailableBook[] = [
    {
      id: 'AB001',
      title: 'Machine Learning',
      author: 'Tom Mitchell',
      isbn: '978-0070428072',
      category: 'Computer Science',
      availability: 'available'
    },
    {
      id: 'AB002',
      title: 'Calculus',
      author: 'James Stewart',
      isbn: '978-1305071759',
      category: 'Mathematics',
      availability: 'borrowed',
      availableDate: 'Jan 20, 2024'
    },
    {
      id: 'AB003',
      title: 'Modern Physics',
      author: 'Kenneth Krane',
      isbn: '978-1118061145',
      category: 'Physics',
      availability: 'available'
    }
  ];

  const totalBorrowed = borrowedBooks.length;
  const overdueBooks = borrowedBooks.filter(b => b.status === 'overdue').length;
  const totalFines = borrowedBooks.reduce((sum, book) => sum + book.fine, 0);
  const availableRenewals = borrowedBooks.filter(b => b.renewalCount < b.maxRenewals).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'borrowed': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('dashboard')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">My Library</h1>
            <p className="text-muted-foreground">Manage your borrowed books and library resources</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download History
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBorrowed}</div>
            <p className="text-xs text-muted-foreground">Books in possession</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueBooks}</div>
            <p className="text-xs text-red-600">Return immediately</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{totalFines}</div>
            <p className="text-xs text-muted-foreground">Pending payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Can Renew</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableRenewals}</div>
            <p className="text-xs text-muted-foreground">Books eligible</p>
          </CardContent>
        </Card>
      </div>

      {/* Library Tabs */}
      <Tabs defaultValue="borrowed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="borrowed">My Books</TabsTrigger>
          <TabsTrigger value="search">Search Catalog</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="fines">Fines & Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="borrowed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currently Borrowed Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {borrowedBooks.map((book) => (
                  <div key={book.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold text-lg">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">by {book.author}</p>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>ISBN: {book.isbn}</span>
                          <span>•</span>
                          <span>{book.category}</span>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Borrowed: {book.borrowDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Due: {book.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(book.status)}>
                          {book.status}
                        </Badge>
                        {book.status === 'active' && (
                          <div className="text-sm">
                            {getDaysRemaining(book.dueDate) > 0 ? (
                              <span className="text-green-600">{getDaysRemaining(book.dueDate)} days left</span>
                            ) : (
                              <span className="text-red-600">Overdue by {Math.abs(getDaysRemaining(book.dueDate))} days</span>
                            )}
                          </div>
                        )}
                        {book.fine > 0 && (
                          <div className="text-sm text-red-600">
                            Fine: ₹{book.fine}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {book.renewalCount < book.maxRenewals && book.status === 'active' && (
                        <Button size="sm" variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Renew ({book.maxRenewals - book.renewalCount} left)
                        </Button>
                      )}
                      {book.status === 'overdue' && (
                        <Button size="sm" variant="destructive">
                          Return Book
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Library Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by title, author, or ISBN..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                <div className="space-y-3">
                  {availableBooks.map((book) => (
                    <div key={book.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">by {book.author}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>ISBN: {book.isbn}</span>
                            <span>•</span>
                            <span>{book.category}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getStatusColor(book.availability)}>
                            {book.availability}
                          </Badge>
                          {book.availableDate && (
                            <p className="text-xs text-muted-foreground">
                              Available: {book.availableDate}
                            </p>
                          )}
                          {book.availability === 'available' && (
                            <Button size="sm">Reserve</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Borrowing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookHistory.map((book) => (
                  <div key={book.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{book.title}</h4>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>Borrowed: {book.borrowDate}</span>
                          <span>•</span>
                          <span>Returned: {book.returnDate}</span>
                          {book.fine > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-red-600">Fine: ₹{book.fine}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {book.rating && (
                          <>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < book.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fines & Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-yellow-900">Total Outstanding Fines</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please clear your dues to continue borrowing books
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-900">₹{totalFines}</div>
                      <Button size="sm" className="mt-2">Pay Now</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Fine Details</h4>
                  {borrowedBooks.filter(b => b.fine > 0).map((book) => (
                    <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Overdue since {book.dueDate}
                        </p>
                      </div>
                      <span className="font-semibold text-red-600">₹{book.fine}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Library Rules</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Maximum 3 books can be borrowed at a time</li>
                    <li>• Loan period: 30 days for regular books</li>
                    <li>• Fine: ₹5 per day for late returns</li>
                    <li>• Maximum 2 renewals allowed per book</li>
                    <li>• Reference books cannot be borrowed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


