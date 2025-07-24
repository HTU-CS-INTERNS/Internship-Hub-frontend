'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap,
  Edit3,
  Save,
  Camera,
  Building,
  FileText,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { StudentApiService } from '@/lib/services/studentApi';
import EmptyState from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface StudentProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  university?: string;
  major?: string;
  gpa?: number;
  graduationYear?: number;
  skills?: string[];
  achievements?: string[];
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<StudentProfile | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const profileData = await StudentApiService.getStudentProfile();
        if (profileData) {
          // Transform UserProfileData to StudentProfile
          const transformedProfile: StudentProfile = {
            id: profileData.id || '',
            email: profileData.email || '',
            name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.email || '',
            phone: profileData.phone_number,
            avatar: profileData.avatar_url,
            // Set defaults for extended fields not in UserProfileData
            address: '',
            dateOfBirth: '',
            bio: '',
            university: '',
            major: '',
            gpa: undefined,
            graduationYear: undefined,
            skills: [],
            achievements: [],
            emergencyContact: {
              name: '',
              phone: '',
              relationship: ''
            },
          };
          setProfile(transformedProfile);
          setEditedProfile(transformedProfile);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!editedProfile) return;
    
    setIsSaving(true);
    try {
      await StudentApiService.updateProfile(editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        icon={User}
        title="Profile Not Found"
        description="Your profile information could not be loaded. Please contact support for assistance."
        actionLabel="Contact Support"
        onAction={() => console.log('Contact support')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and academic details</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic Details</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Student</Badge>
                    {profile.university && (
                      <Badge variant="outline">{profile.university}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={isEditing ? editedProfile?.name || '' : profile.name}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={isEditing ? editedProfile?.phone || '' : profile.phone || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={isEditing ? editedProfile?.dateOfBirth || '' : profile.dateOfBirth || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, dateOfBirth: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={isEditing ? editedProfile?.address || '' : profile.address || ''}
                  onChange={(e) => setEditedProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                  disabled={!isEditing}
                  placeholder="Enter your full address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={isEditing ? editedProfile?.bio || '' : profile.bio || ''}
                  onChange={(e) => setEditedProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
              <CardDescription>
                Your educational background and academic achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={isEditing ? editedProfile?.university || '' : profile.university || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, university: e.target.value} : null)}
                    disabled={!isEditing}
                    placeholder="Your university name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">Major/Field of Study</Label>
                  <Input
                    id="major"
                    value={isEditing ? editedProfile?.major || '' : profile.major || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, major: e.target.value} : null)}
                    disabled={!isEditing}
                    placeholder="Your major or field of study"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={isEditing ? editedProfile?.gpa || '' : profile.gpa || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, gpa: parseFloat(e.target.value)} : null)}
                    disabled={!isEditing}
                    placeholder="Your current GPA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Expected Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={isEditing ? editedProfile?.graduationYear || '' : profile.graduationYear || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, graduationYear: parseInt(e.target.value)} : null)}
                    disabled={!isEditing}
                    placeholder="Year of expected graduation"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  )) || <p className="text-muted-foreground text-sm">No skills added yet</p>}
                </div>
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Skills editing will be available soon
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Achievements</Label>
                <div className="space-y-2">
                  {profile.achievements?.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">{achievement}</span>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">No achievements added yet</p>}
                </div>
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Achievements editing will be available soon
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
              <CardDescription>
                Emergency contact information for urgent situations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={isEditing ? editedProfile?.emergencyContact?.name || '' : profile.emergencyContact?.name || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {
                      ...prev, 
                      emergencyContact: {
                        ...prev.emergencyContact,
                        name: e.target.value
                      }
                    } : null)}
                    disabled={!isEditing}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={isEditing ? editedProfile?.emergencyContact?.phone || '' : profile.emergencyContact?.phone || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {
                      ...prev, 
                      emergencyContact: {
                        ...prev.emergencyContact,
                        phone: e.target.value
                      }
                    } : null)}
                    disabled={!isEditing}
                    placeholder="Emergency contact phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={isEditing ? editedProfile?.emergencyContact?.relationship || '' : profile.emergencyContact?.relationship || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {
                      ...prev, 
                      emergencyContact: {
                        ...prev.emergencyContact,
                        relationship: e.target.value
                      }
                    } : null)}
                    disabled={!isEditing}
                    placeholder="Relationship to you"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
