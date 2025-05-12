'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SlotsTable({ slots }: { slots: any[] }) {
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");

  // ✅ Unique dropdown options
  const uniqueSports = Array.from(new Set(slots.map((s) => s.sports?.name).filter(Boolean)));
  const uniqueUserTypes = Array.from(new Set(slots.map((s) => s.allowed_user_type || 'any')));
  const genders = ['male', 'female', 'any'];

  const filteredSlots = slots.filter((slot) => {
    const q = search.toLowerCase();
    const sport = slot.sports?.name?.toLowerCase() || '';
    const gender = slot.gender?.toLowerCase() || '';
    const userType = slot.allowed_user_type?.toLowerCase() || '';
    const time = slot.start_time;

    const matchSearch = sport.includes(q) || gender.includes(q) || userType.includes(q) || time.includes(q);
    const matchSport = sportFilter === "all" ? true : slot.sports?.name === sportFilter;
    const matchGender = genderFilter === "all" ? true : slot.gender === genderFilter;
    const matchUserType = userTypeFilter === "all" ? true : slot.allowed_user_type === userTypeFilter;

    return matchSearch && matchSport && matchGender && matchUserType;
  });

  const formatTime12hr = (time24: string) => {
    const [hour, minute] = time24.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-2xl font-bold">Manage Slots</CardTitle>
        <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:w-auto">

          {/* ✅ Search */}
          <Input
            placeholder="Search by sport, gender, user type or time"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[200px]"
          />

          {/* ✅ Sport Filter */}
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter Sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueSports.map((sport) => (
                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ✅ Gender Filter */}
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {genders.map((g) => (
                <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ✅ User Type Filter */}
          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter User Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueUserTypes.map((u) => (
                <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ✅ Add Button */}
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/slots/add">+ Add Slot</Link>
          </Button>

        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto p-0">
        <div className="min-w-[700px]">
          <table className="w-full text-sm border rounded-md">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Sport</th><th className="p-3 text-left">Time</th><th className="p-3 text-left">Gender</th><th className="p-3 text-left">User Type</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.map((slot) => (
                <tr key={slot.id} className="border-t hover:bg-accent transition-colors">
                  <td className="p-3">{slot.sports?.name}</td><td className="p-3">{formatTime12hr(slot.start_time)} – {formatTime12hr(slot.end_time)}</td><td className="p-3 capitalize">{slot.gender}</td><td className="p-3 capitalize">{slot.allowed_user_type || 'any'}</td><td className="p-3">{slot.is_active ? (<Badge variant="default">Active</Badge>) : (<Badge variant="destructive">Inactive</Badge>)}</td><td className="p-3 space-x-2"><Button size="sm" variant="outline" asChild><Link href={`/admin/slots/edit/${slot.id}`}>Edit</Link></Button></td>
                </tr>
              ))}
              {!filteredSlots.length && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">No slots found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
