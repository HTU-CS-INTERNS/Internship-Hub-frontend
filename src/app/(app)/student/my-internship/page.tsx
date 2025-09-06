"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth-context";
import { StudentApiService } from "@/lib/services/studentApi";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  MapPin,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);

interface InternshipDetails {
  id: number;
  student_id: number;
  company_id: number;
  company_supervisor_id: number;
  lecturer_id?: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  companies: {
    id: number;
    name: string;
    address: string;
    city: string;
    region: string;
    industry?: string;
    contact_email?: string;
    contact_phone?: string;
    latitude?: number;
    longitude?: number;
    geofence_radius_meters?: number;
    created_at: string;
    updated_at?: string;
  };
  company_supervisors: {
    id: number;
    user_id: number;
    company_id: number;
    job_title?: string;
    users: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      phone_number?: string;
      is_active: boolean;
    };
  };
  lecturers?: {
    id: number;
    user_id: number;
    users: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      phone_number?: string;
      is_active: boolean;
    };
  };
}

interface CheckInResult {
  id: number;
  internship_id: number;
  check_in_timestamp: string;
  latitude: number;
  longitude: number;
  is_within_geofence: boolean;
  device_info?: string;
}

export default function MyInternshipPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [internship, setInternship] = React.useState<InternshipDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCheckingIn, setIsCheckingIn] = React.useState(false);

  React.useEffect(() => {
    const fetchInternshipDetails = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await StudentApiService.getMyInternship();
        setInternship(data as InternshipDetails);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch internship details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternshipDetails();
  }, [user, toast]);

  const handleCheckIn = () => {
    setIsCheckingIn(true);
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      setIsCheckingIn(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await StudentApiService.checkIn(
            latitude,
            longitude,
          ) as CheckInResult;
          if (result.is_within_geofence) {
            toast({
              title: "Check-in Successful",
              description: "You are within the company geofence.",
            });
          } else {
            toast({
              title: "Check-in Warning",
              description:
                "You are outside the company geofence. Your check-in has been logged.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Check-in Failed",
            description: "Could not complete check-in. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsCheckingIn(false);
        }
      },
      (error) => {
        toast({
          title: "Geolocation Error",
          description: `Could not get your location: ${error.message}`,
          variant: "destructive",
        });
        setIsCheckingIn(false);
      },
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!internship) {
    return <div>No active internship found.</div>;
  }

  const companyLocation: [number, number] | null =
    internship.companies.latitude && internship.companies.longitude
      ? [internship.companies.latitude, internship.companies.longitude]
      : null;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="My Internship"
        description="Details of your current internship and check-in functionality."
        icon={Briefcase}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Internship Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-3 text-primary" />
              <span>{internship.companies.name}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-primary" />
              <span>{internship.companies.address}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-primary" />
              <span>
                {new Date(internship.start_date).toLocaleDateString()} -{" "}
                {new Date(internship.end_date).toLocaleDateString()}
              </span>
            </div>
            <Button
              onClick={handleCheckIn}
              disabled={isCheckingIn || !companyLocation}
            >
              {isCheckingIn ? "Checking In..." : "Perform Check-In"}
            </Button>
            {!companyLocation && (
              <p className="text-sm text-muted-foreground flex items-center mt-2">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                Check-in is disabled because company location is not set.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Location</CardTitle>
          </CardHeader>
          <CardContent style={{ height: "300px" }}>
            {companyLocation
              ? (
                <MapContainer
                  center={companyLocation}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={companyLocation} />
                  <Circle
                    center={companyLocation}
                    radius={internship.companies.geofence_radius_meters || 100}
                    pathOptions={{
                      color: "blue",
                      fillColor: "blue",
                      fillOpacity: 0.2,
                    }}
                  />
                </MapContainer>
              )
              : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Location not available.
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
