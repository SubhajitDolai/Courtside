import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PencilIcon } from 'lucide-react';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) redirect('/login');
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();
  if (!profile) redirect('/onboarding');
  if (profile.role === 'ban') redirect('/banned');
  
  return (
    <main className="py-30 px-4 max-w-2xl mx-auto">
      <Card className="border-none shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold text-primary">My Profile</CardTitle>
          <CardDescription>View and manage your profile information</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-primary/10">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-2xl font-bold text-white">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
              <p className="text-muted-foreground">{profile.user_type}</p>
              <div className="mt-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {profile.user_type === 'faculty' ? 'Department' : 'Course'}: {profile.course}
                </Badge>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {profile.user_type === 'faculty' ? 'ID' : 'PRN'}
              </p>
              <p className="font-medium">{profile.prn}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {profile.user_type === 'faculty' ? 'Department' : 'Course'}
              </p>
              <p className="font-medium">{profile.course}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{profile.phone_number}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium">{profile.gender}</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button asChild size="lg" className="gap-2">
            <Link href="/profile/edit">
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
