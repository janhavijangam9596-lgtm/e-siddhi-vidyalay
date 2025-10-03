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
import { Checkbox } from '../ui/checkbox';
import { api } from '../../utils/api';
import { 
  Plus, Search, Eye, Edit, Trash2, Trophy, Target, 
  Calendar, Clock, Users, Award, Medal, Activity,
  Download, Upload, RefreshCw, Filter, MapPin,
  Timer, Flag, Star, Zap, BarChart3
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Sport {
  id: string;
  name: string;
  category: 'indoor' | 'outdoor' | 'both';
  teamSize: number;
  equipment: string[];
  season: 'summer' | 'winter' | 'monsoon' | 'all_year';
  coachId?: string;
  coachName?: string;
  description?: string;
  rules?: string;
  created_at: string;
}

interface SportsEvent {
  id: string;
  name: string;
  sportId: string;
  sportName: string;
  type: 'inter_class' | 'inter_school' | 'district' | 'state' | 'national';
  venue: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  prizes: Prize[];
  requirements?: string;
  created_at: string;
}

interface Prize {
  position: number;
  award: string;
  amount?: number;
}

interface Participant {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  rollNumber: string;
  sportId: string;
  sportName: string;
  eventId?: string;
  eventName?: string;
  teamId?: string;
  teamName?: string;
  position?: string;
  performance?: string;
  status: 'registered' | 'selected' | 'participating' | 'completed';
  registrationDate: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  sportId: string;
  sportName: string;
  captainId: string;
  captainName: string;
  members: TeamMember[];
  coachId?: string;
  coachName?: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface TeamMember {
  studentId: string;
  studentName: string;
  position: string;
  jerseyNumber: number;
}

interface Achievement {
  id: string;
  studentId: string;
  studentName: string;
  sportId: string;
  sportName: string;
  eventId?: string;
  eventName?: string;
  achievement: string;
  position: number;
  level: 'school' | 'district' | 'state' | 'national' | 'international';
  date: string;
  certificate?: string;
  points: number;
  created_at: string;
}

interface SportsStats {
  totalSports: number;
  activeEvents: number;
  totalParticipants: number;
  totalTeams: number;
  totalAchievements: number;
  sportsParticipationRate: number;
  upcomingEvents: number;
  medalsWon: number;
}

export function SportsManagement() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<SportsStats>({
    totalSports: 0,
    activeEvents: 0,
    totalParticipants: 0,
    totalTeams: 0,
    totalAchievements: 0,
    sportsParticipationRate: 0,
    upcomingEvents: 0,
    medalsWon: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddSportDialogOpen, setIsAddSportDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [isRegisterParticipantDialogOpen, setIsRegisterParticipantDialogOpen] = useState(false);
  const [isAddAchievementDialogOpen, setIsAddAchievementDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [newSport, setNewSport] = useState({
    name: '',
    category: 'outdoor',
    teamSize: '',
    equipment: '',
    season: 'all_year',
    coachId: '',
    description: '',
    rules: ''
  });

  const [newEvent, setNewEvent] = useState({
    name: '',
    sportId: '',
    type: 'inter_class',
    venue: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    requirements: '',
    prizes: [
      { position: 1, award: 'Gold Medal', amount: '' },
      { position: 2, award: 'Silver Medal', amount: '' },
      { position: 3, award: 'Bronze Medal', amount: '' }
    ]
  });

  const [newTeam, setNewTeam] = useState({
    name: '',
    sportId: '',
    captainId: '',
    coachId: '',
    members: [{ studentId: '', position: '', jerseyNumber: '' }]
  });

  const [registerParticipant, setRegisterParticipant] = useState({
    studentId: '',
    sportId: '',
    eventId: '',
    teamId: ''
  });

  const [newAchievement, setNewAchievement] = useState({
    studentId: '',
    sportId: '',
    eventId: '',
    achievement: '',
    position: '',
    level: 'school',
    date: new Date().toISOString().split('T')[0],
    points: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sportsData, eventsData, participantsData, teamsData, achievementsData, statsData] = await Promise.all([
        api.getSports(),
        api.getSportsEvents(),
        api.getSportsParticipants(),
        api.getSportsTeams(),
        api.getSportsAchievements(),
        api.getSportsStats()
      ]);
      
      setSports(sportsData);
      setEvents(eventsData);
      setParticipants(participantsData);
      setTeams(teamsData);
      setAchievements(achievementsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load sports data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSport = async () => {
    try {
      const sportData = {
        ...newSport,
        teamSize: parseInt(newSport.teamSize),
        equipment: newSport.equipment.split(',').map(eq => eq.trim()).filter(eq => eq)
      };
      
      await api.createSport(sportData);
      toast.success('Sport added successfully');
      setIsAddSportDialogOpen(false);
      resetSportForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add sport');
      console.error(error);
    }
  };

  const handleAddEvent = async () => {
    try {
      const eventData = {
        ...newEvent,
        maxParticipants: parseInt(newEvent.maxParticipants),
        currentParticipants: 0,
        status: 'upcoming',
        prizes: newEvent.prizes.map(prize => ({
          ...prize,
          amount: prize.amount ? parseFloat(prize.amount) : undefined
        }))
      };
      
      await api.createSportsEvent(eventData);
      toast.success('Event created successfully');
      setIsAddEventDialogOpen(false);
      resetEventForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create event');
      console.error(error);
    }
  };

  const handleAddTeam = async () => {
    try {
      const teamData = {
        ...newTeam,
        members: newTeam.members.filter(member => member.studentId),
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        status: 'active'
      };
      
      await api.createSportsTeam(teamData);
      toast.success('Team created successfully');
      setIsAddTeamDialogOpen(false);
      resetTeamForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create team');
      console.error(error);
    }
  };

  const handleRegisterParticipant = async () => {
    try {
      const participantData = {
        ...registerParticipant,
        status: 'registered',
        registrationDate: new Date().toISOString()
      };
      
      await api.registerSportsParticipant(participantData);
      toast.success('Participant registered successfully');
      setIsRegisterParticipantDialogOpen(false);
      resetRegisterParticipantForm();
      loadData();
    } catch (error) {
      toast.error('Failed to register participant');
      console.error(error);
    }
  };

  const handleAddAchievement = async () => {
    try {
      const achievementData = {
        ...newAchievement,
        position: parseInt(newAchievement.position),
        points: parseInt(newAchievement.points)
      };
      
      await api.createSportsAchievement(achievementData);
      toast.success('Achievement added successfully');
      setIsAddAchievementDialogOpen(false);
      resetAchievementForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add achievement');
      console.error(error);
    }
  };

  const resetSportForm = () => {
    setNewSport({
      name: '',
      category: 'outdoor',
      teamSize: '',
      equipment: '',
      season: 'all_year',
      coachId: '',
      description: '',
      rules: ''
    });
  };

  const resetEventForm = () => {
    setNewEvent({
      name: '',
      sportId: '',
      type: 'inter_class',
      venue: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxParticipants: '',
      requirements: '',
      prizes: [
        { position: 1, award: 'Gold Medal', amount: '' },
        { position: 2, award: 'Silver Medal', amount: '' },
        { position: 3, award: 'Bronze Medal', amount: '' }
      ]
    });
  };

  const resetTeamForm = () => {
    setNewTeam({
      name: '',
      sportId: '',
      captainId: '',
      coachId: '',
      members: [{ studentId: '', position: '', jerseyNumber: '' }]
    });
  };

  const resetRegisterParticipantForm = () => {
    setRegisterParticipant({
      studentId: '',
      sportId: '',
      eventId: '',
      teamId: ''
    });
  };

  const resetAchievementForm = () => {
    setNewAchievement({
      studentId: '',
      sportId: '',
      eventId: '',
      achievement: '',
      position: '',
      level: 'school',
      date: new Date().toISOString().split('T')[0],
      points: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': case 'registered': case 'active': return 'bg-blue-100 text-blue-800';
      case 'ongoing': case 'participating': return 'bg-yellow-100 text-yellow-800';
      case 'completed': case 'selected': return 'bg-green-100 text-green-800';
      case 'cancelled': case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'indoor': return 'bg-purple-100 text-purple-800';
      case 'outdoor': return 'bg-green-100 text-green-800';
      case 'both': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'school': return 'bg-blue-100 text-blue-800';
      case 'district': return 'bg-green-100 text-green-800';
      case 'state': return 'bg-yellow-100 text-yellow-800';
      case 'national': return 'bg-orange-100 text-orange-800';
      case 'international': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2: return <Medal className="h-4 w-4 text-gray-400" />;
      case 3: return <Award className="h-4 w-4 text-orange-500" />;
      default: return <Star className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredSports = sports.filter(sport => {
    return (
      sport.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === '' || sport.category === categoryFilter)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Sports Management</h1>
          <p className="text-muted-foreground">
            Manage sports activities, events, teams, and achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddAchievementDialogOpen} onOpenChange={setIsAddAchievementDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Trophy className="mr-2 h-4 w-4" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Achievement</DialogTitle>
                <DialogDescription>
                  Record a student's sports achievement
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="achievementStudent">Student</Label>
                  <Select value={newAchievement.studentId} onValueChange={(value) => setNewAchievement({...newAchievement, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student1">John Doe - Class 10A</SelectItem>
                      <SelectItem value="student2">Jane Smith - Class 9B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="achievementSport">Sport</Label>
                    <Select value={newAchievement.sportId} onValueChange={(value) => setNewAchievement({...newAchievement, sportId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="achievementEvent">Event (Optional)</Label>
                    <Select value={newAchievement.eventId} onValueChange={(value) => setNewAchievement({...newAchievement, eventId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="achievement">Achievement</Label>
                  <Input
                    id="achievement"
                    value={newAchievement.achievement}
                    onChange={(e) => setNewAchievement({...newAchievement, achievement: e.target.value})}
                    placeholder="Describe the achievement"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      type="number"
                      value={newAchievement.position}
                      onChange={(e) => setNewAchievement({...newAchievement, position: e.target.value})}
                      placeholder="Enter position (1, 2, 3, etc.)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select value={newAchievement.level} onValueChange={(value) => setNewAchievement({...newAchievement, level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="district">District</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="achievementDate">Date</Label>
                    <Input
                      id="achievementDate"
                      type="date"
                      value={newAchievement.date}
                      onChange={(e) => setNewAchievement({...newAchievement, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={newAchievement.points}
                      onChange={(e) => setNewAchievement({...newAchievement, points: e.target.value})}
                      placeholder="Enter points earned"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddAchievementDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAchievement}>
                  Add Achievement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isRegisterParticipantDialogOpen} onOpenChange={setIsRegisterParticipantDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Register Participant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register Participant</DialogTitle>
                <DialogDescription>
                  Register a student for sports participation
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="participantStudent">Student</Label>
                  <Select value={registerParticipant.studentId} onValueChange={(value) => setRegisterParticipant({...registerParticipant, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student1">John Doe - Class 10A</SelectItem>
                      <SelectItem value="student2">Jane Smith - Class 9B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="participantSport">Sport</Label>
                  <Select value={registerParticipant.sportId} onValueChange={(value) => setRegisterParticipant({...registerParticipant, sportId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="participantEvent">Event (Optional)</Label>
                  <Select value={registerParticipant.eventId} onValueChange={(value) => setRegisterParticipant({...registerParticipant, eventId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.filter(event => event.sportId === registerParticipant.sportId).map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="participantTeam">Team (Optional)</Label>
                  <Select value={registerParticipant.teamId} onValueChange={(value) => setRegisterParticipant({...registerParticipant, teamId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.filter(team => team.sportId === registerParticipant.sportId).map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsRegisterParticipantDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRegisterParticipant}>
                  Register Participant
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddTeamDialogOpen} onOpenChange={setIsAddTeamDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Flag className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Sports Team</DialogTitle>
                <DialogDescription>
                  Create a new sports team
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    placeholder="Enter team name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamSport">Sport</Label>
                    <Select value={newTeam.sportId} onValueChange={(value) => setNewTeam({...newTeam, sportId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="teamCaptain">Team Captain</Label>
                    <Select value={newTeam.captainId} onValueChange={(value) => setNewTeam({...newTeam, captainId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select captain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student1">John Doe</SelectItem>
                        <SelectItem value="student2">Jane Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="teamCoach">Coach (Optional)</Label>
                  <Select value={newTeam.coachId} onValueChange={(value) => setNewTeam({...newTeam, coachId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select coach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coach1">Mr. Johnson</SelectItem>
                      <SelectItem value="coach2">Ms. Williams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Team Members</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewTeam({
                        ...newTeam,
                        members: [...newTeam.members, { studentId: '', position: '', jerseyNumber: '' }]
                      })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {newTeam.members.map((member, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-center">
                        <Select 
                          value={member.studentId} 
                          onValueChange={(value) => {
                            const updatedMembers = [...newTeam.members];
                            updatedMembers[index].studentId = value;
                            setNewTeam({...newTeam, members: updatedMembers});
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Student" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student1">John Doe</SelectItem>
                            <SelectItem value="student2">Jane Smith</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Position"
                          value={member.position}
                          onChange={(e) => {
                            const updatedMembers = [...newTeam.members];
                            updatedMembers[index].position = e.target.value;
                            setNewTeam({...newTeam, members: updatedMembers});
                          }}
                        />
                        <Input
                          placeholder="Jersey #"
                          type="number"
                          value={member.jerseyNumber}
                          onChange={(e) => {
                            const updatedMembers = [...newTeam.members];
                            updatedMembers[index].jerseyNumber = e.target.value;
                            setNewTeam({...newTeam, members: updatedMembers});
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedMembers = newTeam.members.filter((_, i) => i !== index);
                            setNewTeam({...newTeam, members: updatedMembers});
                          }}
                          disabled={newTeam.members.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddTeamDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTeam}>
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Sports Event</DialogTitle>
                <DialogDescription>
                  Organize a new sports event or competition
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    placeholder="Enter event name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventSport">Sport</Label>
                    <Select value={newEvent.sportId} onValueChange={(value) => setNewEvent({...newEvent, sportId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter_class">Inter-Class</SelectItem>
                        <SelectItem value="inter_school">Inter-School</SelectItem>
                        <SelectItem value="district">District Level</SelectItem>
                        <SelectItem value="state">State Level</SelectItem>
                        <SelectItem value="national">National Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                    placeholder="Enter venue location"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input
                      id="registrationDeadline"
                      type="date"
                      value={newEvent.registrationDeadline}
                      onChange={(e) => setNewEvent({...newEvent, registrationDeadline: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="maxParticipants">Maximum Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({...newEvent, maxParticipants: e.target.value})}
                    placeholder="Enter maximum number of participants"
                  />
                </div>
                
                <div>
                  <Label>Prize Structure</Label>
                  <div className="space-y-2">
                    {newEvent.prizes.map((prize, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2">
                        <Input value={`Position ${prize.position}`} disabled />
                        <Input
                          placeholder="Award"
                          value={prize.award}
                          onChange={(e) => {
                            const updatedPrizes = [...newEvent.prizes];
                            updatedPrizes[index].award = e.target.value;
                            setNewEvent({...newEvent, prizes: updatedPrizes});
                          }}
                        />
                        <Input
                          placeholder="Amount (optional)"
                          type="number"
                          value={prize.amount}
                          onChange={(e) => {
                            const updatedPrizes = [...newEvent.prizes];
                            updatedPrizes[index].amount = e.target.value;
                            setNewEvent({...newEvent, prizes: updatedPrizes});
                          }}
                        />
                        <span className="text-sm text-muted-foreground self-center">₹</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={newEvent.requirements}
                    onChange={(e) => setNewEvent({...newEvent, requirements: e.target.value})}
                    placeholder="Enter event requirements and rules"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddSportDialogOpen} onOpenChange={setIsAddSportDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Sport
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Sport</DialogTitle>
                <DialogDescription>
                  Add a new sport to the school's athletics program
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sportName">Sport Name</Label>
                  <Input
                    id="sportName"
                    value={newSport.name}
                    onChange={(e) => setNewSport({...newSport, name: e.target.value})}
                    placeholder="Enter sport name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newSport.category} onValueChange={(value) => setNewSport({...newSport, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      value={newSport.teamSize}
                      onChange={(e) => setNewSport({...newSport, teamSize: e.target.value})}
                      placeholder="Enter team size"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="season">Season</Label>
                    <Select value={newSport.season} onValueChange={(value) => setNewSport({...newSport, season: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summer">Summer</SelectItem>
                        <SelectItem value="winter">Winter</SelectItem>
                        <SelectItem value="monsoon">Monsoon</SelectItem>
                        <SelectItem value="all_year">All Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="coach">Coach</Label>
                    <Select value={newSport.coachId} onValueChange={(value) => setNewSport({...newSport, coachId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coach" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coach1">Mr. Johnson</SelectItem>
                        <SelectItem value="coach2">Ms. Williams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="equipment">Equipment Required</Label>
                  <Input
                    id="equipment"
                    value={newSport.equipment}
                    onChange={(e) => setNewSport({...newSport, equipment: e.target.value})}
                    placeholder="Enter equipment needed (comma-separated)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSport.description}
                    onChange={(e) => setNewSport({...newSport, description: e.target.value})}
                    placeholder="Enter sport description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="rules">Rules & Regulations</Label>
                  <Textarea
                    id="rules"
                    value={newSport.rules}
                    onChange={(e) => setNewSport({...newSport, rules: e.target.value})}
                    placeholder="Enter basic rules and regulations"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddSportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSport}>
                  Add Sport
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
                <p className="text-sm text-muted-foreground">Total Sports</p>
                <p className="text-2xl font-bold">{stats.totalSports}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Events</p>
                <p className="text-2xl font-bold">{stats.activeEvents}</p>
                <p className="text-xs text-muted-foreground">{stats.upcomingEvents} upcoming</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                <p className="text-xs text-muted-foreground">{stats.sportsParticipationRate}% participation</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={stats.sportsParticipationRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">{stats.totalAchievements}</p>
                <p className="text-xs text-muted-foreground">{stats.medalsWon} medals won</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sports" className="w-full">
        <TabsList>
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sports..."
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
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Sports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSports.map((sport) => (
              <Card key={sport.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{sport.name}</h3>
                      <Badge className={getCategoryColor(sport.category)}>
                        {sport.category}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Team Size:</span>
                        <span className="font-medium">{sport.teamSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Season:</span>
                        <span className="font-medium">{sport.season}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coach:</span>
                        <span className="font-medium">{sport.coachName || 'Not assigned'}</span>
                      </div>
                    </div>
                    
                    {sport.equipment.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Equipment:</p>
                        <div className="flex flex-wrap gap-1">
                          {sport.equipment.slice(0, 3).map((eq, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {eq}
                            </Badge>
                          ))}
                          {sport.equipment.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{sport.equipment.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">{event.sportName}</p>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <Badge variant="outline">{event.type.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Venue:</span>
                        <span className="font-medium">{event.venue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span className="font-medium">
                          {event.currentParticipants}/{event.maxParticipants}
                        </span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={(event.currentParticipants / event.maxParticipants) * 100} 
                      className="w-full"
                    />
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Users className="mr-2 h-4 w-4" />
                        Participants
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">{team.sportName}</p>
                      </div>
                      <Badge className={getStatusColor(team.status)}>
                        {team.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Captain:</span>
                        <span className="font-medium">{team.captainName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coach:</span>
                        <span className="font-medium">{team.coachName || 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Members:</span>
                        <span className="font-medium">{team.members.length}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-sm font-bold text-green-600">{team.wins}</div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-sm font-bold text-gray-600">{team.draws}</div>
                        <div className="text-xs text-muted-foreground">Draws</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <div className="text-sm font-bold text-red-600">{team.losses}</div>
                        <div className="text-xs text-muted-foreground">Losses</div>
                      </div>
                    </div>
                    
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{team.points}</div>
                      <div className="text-xs text-muted-foreground">Total Points</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sports Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.slice(0, 10).map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{participant.studentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {participant.studentClass} - {participant.rollNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{participant.sportName}</TableCell>
                        <TableCell>{participant.eventName || '-'}</TableCell>
                        <TableCell>{participant.teamName || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(participant.status)}>
                            {participant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(participant.registrationDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
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
        
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getPositionIcon(achievement.position)}
                        <div>
                          <h3 className="font-semibold">{achievement.studentName}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.sportName}</p>
                        </div>
                      </div>
                      <Badge className={getLevelColor(achievement.level)}>
                        {achievement.level}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="font-medium">{achievement.achievement}</p>
                      {achievement.eventName && (
                        <p className="text-sm text-muted-foreground">{achievement.eventName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Position:</span>
                        <span className="font-medium">#{achievement.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">{new Date(achievement.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Points:</span>
                        <span className="font-medium">{achievement.points}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Certificate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}