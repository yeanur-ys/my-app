import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

export function ProfileSetup({ user, onProfileCreated }: { user: any; onProfileCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    fullName: user.user_metadata?.full_name || "",
    classNumber: user.user_metadata?.class_number || "",
    graduationYear: user.user_metadata?.graduation_year || "",
    schoolName: user.user_metadata?.school_name || "Default School",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email || "",
        full_name: profileData.fullName,
        class_number: Number.parseInt(profileData.classNumber),
        graduation_year: Number.parseInt(profileData.graduationYear),
        school_name: profileData.schoolName,
      });

      if (profileError) throw profileError;

      // Create or get community
      const { data: existingCommunities } = await supabase
        .from("communities")
        .select("id")
        .eq("class_number", Number.parseInt(profileData.classNumber))
        .eq("graduation_year", Number.parseInt(profileData.graduationYear))
        .eq("school_name", profileData.schoolName);

      let communityId = existingCommunities?.[0]?.id;

      if (!communityId) {
        const communityName = `Class ${profileData.classNumber} - ${profileData.graduationYear}`;
        const { data: newCommunities, error: communityError } = await supabase
          .from("communities")
          .insert({
            name: communityName,
            description: `Community for Class ${profileData.classNumber} graduating in ${profileData.graduationYear}`,
            class_number: Number.parseInt(profileData.classNumber),
            graduation_year: Number.parseInt(profileData.graduationYear),
            school_name: profileData.schoolName,
            icon: "🎓",
            color: "bg-blue-500",
          })
          .select("id");

        if (communityError) throw communityError;
        communityId = newCommunities?.[0]?.id;
      }

      // Add user to community
      if (communityId) {
        const { error: memberError } = await supabase.from("community_members").insert({
          user_id: user.id,
          community_id: communityId,
        });

        if (memberError) throw memberError;
      }

      onProfileCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
  const classes = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Set up your profile to join your school community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  type="number"
                  min={1}
                  max={12}
                  value={profileData.classNumber}
                  onChange={(e) => setProfileData({ ...profileData, classNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Graduation Year</Label>
                <Input
                  id="year"
                  type="number"
                  min={currentYear - 10}
                  max={currentYear + 10}
                  value={profileData.graduationYear}
                  onChange={(e) => setProfileData({ ...profileData, graduationYear: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School Name</Label>
              <Input
                id="school"
                type="text"
                placeholder="Enter your school name"
                value={profileData.schoolName}
                onChange={(e) => setProfileData({ ...profileData, schoolName: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <span className="mr-2">Loading...</span>}
              Complete Setup
            </Button>
          </form>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
