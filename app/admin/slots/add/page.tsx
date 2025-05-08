import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSlot } from "./actions";

export default async function AddSlotPage() {
  const supabase = await createClient();

  // Fetch sports to show in dropdown
  const { data: sports } = await supabase.from("sports").select("*").eq("is_active", true);

  return (
    <div className="flex flex-col min-h-screen max-w-full items-center justify-center p-4 space-y-4">
      <h1 className="text-2xl font-bold">Add Slot</h1>

      <form action={addSlot} className="space-y-4 max-w-sm">
        {/* Sport Dropdown */}
        <div className="space-y-2">
          <Label>Sport</Label>
          <Select name="sport_id" required>
            <SelectTrigger>
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent>
              {sports?.map((sport) => (
                <SelectItem key={sport.id} value={sport.id}>
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input type="time" name="start_time" required />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <Input type="time" name="end_time" required />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select name="gender" defaultValue="select" required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit">Add Slot</Button>
      </form>
    </div>
  );
}
