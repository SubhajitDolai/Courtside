'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

export default function AddSlotPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sports, setSports] = useState<any[]>([])
  const [form, setForm] = useState({ 
    sport_id: "", 
    start_time: "", 
    end_time: "", 
    gender: "", 
    allowed_user_type: "student"
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // ✅ Fetch sports list (on client mount)
  useState(() => {
    const fetchSports = async () => {
      const { data } = await supabase.from("sports").select("*").eq("is_active", true)
      setSports(data ?? [])
    }
    fetchSports()
  })

  const handleSubmit = async () => {
    if (!form.sport_id || !form.start_time || !form.end_time || !form.gender || !form.allowed_user_type) {
      toast.error("Please fill all fields")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("slots").insert([form])

    if (!error) {
      toast.success("Slot added ✅")
      router.push("/admin/slots")
    } else {
      toast.error("Failed to add slot")
    }

    setLoading(false)
    setConfirmOpen(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Add New Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setConfirmOpen(true)
            }}
            className="space-y-6"
          >
            {/* Sport Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="sport_id">Sport</Label>
              <Select
                value={form.sport_id}
                onValueChange={(val) => setForm({ ...form, sport_id: val })}
              >
                <SelectTrigger id="sport_id">
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

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(val) => setForm({ ...form, gender: val })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Allowed User Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="allowed_user_type">Allowed Users</Label>
              <Select
                value={form.allowed_user_type}
                onValueChange={(val) => setForm({ ...form, allowed_user_type: val })}
              >
                <SelectTrigger id="allowed_user_type">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Students Only</SelectItem>
                  <SelectItem value="faculty">Faculty Only</SelectItem>
                  <SelectItem value="any">Anyone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Add Slot
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={(open) => !loading && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Add Slot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will add a new slot to the system. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding..." : "Yes, Add"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
